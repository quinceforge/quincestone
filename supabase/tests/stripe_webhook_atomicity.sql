-- Run with psql against a disposable database AFTER all migrations are applied:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/stripe_webhook_atomicity.sql
-- All fixtures are rolled back. Never point this at production.
begin;

do $$
declare
  v_order_id uuid := '8d8e7f10-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  v_payment_id uuid := '8d8e7f10-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
  v_bad_order_id uuid := '8d8e7f10-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
  v_bad_payment_id uuid := '8d8e7f10-aaaa-4aaa-8aaa-aaaaaaaaaaa4';
  v_result jsonb;
  v_status text;
  v_count integer;
  v_now bigint := extract(epoch from now())::bigint;
begin
  insert into public.commerce_orders (
    id, order_number, email, billing_address, shipping_address,
    subtotal_amount, total_amount, currency, status
  ) values (
    v_order_id, 987654321, 'stripe-atomicity-test@example.invalid', '{}'::jsonb, '{}'::jsonb,
    5000, 5000, 'USD', 'pending_payment'
  );

  insert into public.commerce_payments (
    id, order_id, provider, provider_checkout_session_id,
    amount, currency, status, verified
  ) values (
    v_payment_id, v_order_id, 'stripe', 'cs_atomicity_test_1',
    5000, 'USD', 'pending', false
  );

  -- A failed card attempt should be recorded but must not cancel an open Checkout Session.
  v_result := public.process_stripe_webhook_event(jsonb_build_object(
    'id', 'evt_atomicity_test_failure',
    'type', 'payment_intent.payment_failed',
    'created', v_now,
    'data', jsonb_build_object('object', jsonb_build_object(
      'id', 'pi_atomicity_test_1',
      'metadata', jsonb_build_object('order_id', v_order_id::text)
    ))
  ));

  select status into v_status from public.commerce_payments where id = v_payment_id;
  if v_status <> 'failed' then raise exception 'Expected failed payment attempt, got %', v_status; end if;
  select status into v_status from public.commerce_orders where id = v_order_id;
  if v_status <> 'pending_payment' then raise exception 'Failed payment attempt cancelled retryable order: %', v_status; end if;

  -- An asynchronous Checkout success event must be able to complete that same order.
  v_result := public.process_stripe_webhook_event(jsonb_build_object(
    'id', 'evt_atomicity_test_async_success',
    'type', 'checkout.session.async_payment_succeeded',
    'created', v_now + 1,
    'data', jsonb_build_object('object', jsonb_build_object(
      'id', 'cs_atomicity_test_1',
      'payment_status', 'paid',
      'amount_total', 5000,
      'currency', 'usd',
      'payment_intent', 'pi_atomicity_test_1',
      'metadata', jsonb_build_object('order_id', v_order_id::text)
    ))
  ));

  if coalesce(v_result ->> 'received', 'false') <> 'true'
     or coalesce(v_result ->> 'reconciled', 'false') <> 'true' then
    raise exception 'Expected successful async reconciliation, got %', v_result;
  end if;

  select status into v_status from public.commerce_payments where id = v_payment_id;
  if v_status <> 'succeeded' then raise exception 'Expected succeeded payment, got %', v_status; end if;

  select status into v_status from public.commerce_orders where id = v_order_id;
  if v_status <> 'fulfillment_required' then raise exception 'Expected fulfillment_required order, got %', v_status; end if;

  select count(*) into v_count from public.commerce_fulfillments where order_id = v_order_id;
  if v_count <> 1 then raise exception 'Expected exactly one fulfillment, got %', v_count; end if;

  v_result := public.process_stripe_webhook_event(jsonb_build_object(
    'id', 'evt_atomicity_test_async_success',
    'type', 'checkout.session.async_payment_succeeded',
    'created', v_now + 1,
    'data', jsonb_build_object('object', jsonb_build_object(
      'id', 'cs_atomicity_test_1',
      'payment_status', 'paid',
      'amount_total', 5000,
      'currency', 'usd',
      'payment_intent', 'pi_atomicity_test_1',
      'metadata', jsonb_build_object('order_id', v_order_id::text)
    ))
  ));
  if coalesce(v_result ->> 'duplicate', 'false') <> 'true' then
    raise exception 'Expected duplicate event response, got %', v_result;
  end if;

  select count(*) into v_count from public.commerce_fulfillments where order_id = v_order_id;
  if v_count <> 1 then raise exception 'Duplicate delivery created another fulfillment'; end if;

  insert into public.commerce_orders (
    id, order_number, email, billing_address, shipping_address,
    subtotal_amount, total_amount, currency, status
  ) values (
    v_bad_order_id, 987654322, 'stripe-atomicity-rollback@example.invalid', '{}'::jsonb, '{}'::jsonb,
    1000, 1000, 'USD', 'pending_payment'
  );

  insert into public.commerce_payments (
    id, order_id, provider, provider_checkout_session_id,
    amount, currency, status, verified
  ) values (
    v_bad_payment_id, v_bad_order_id, 'stripe', 'cs_atomicity_test_bad',
    1000, 'USD', 'pending', false
  );

  begin
    perform public.process_stripe_webhook_event(jsonb_build_object(
      'id', 'evt_atomicity_test_rollback',
      'type', 'checkout.session.completed',
      'created', extract(epoch from now())::bigint,
      'data', jsonb_build_object('object', jsonb_build_object(
        'id', 'cs_atomicity_test_bad',
        'payment_status', 'paid',
        'amount_total', 2000,
        'currency', 'usd',
        'metadata', jsonb_build_object('order_id', v_bad_order_id::text)
      ))
    ));
    raise exception 'Expected amount mismatch to abort the transaction';
  exception when check_violation then
    null;
  end;

  select count(*) into v_count from public.commerce_stripe_events
  where event_id = 'evt_atomicity_test_rollback';
  if v_count <> 0 then
    raise exception 'Failed reconciliation left an event-ledger claim behind';
  end if;

  select status into v_status from public.commerce_payments where id = v_bad_payment_id;
  if v_status <> 'pending' then
    raise exception 'Failed reconciliation changed payment status to %', v_status;
  end if;
end;
$$;

rollback;
