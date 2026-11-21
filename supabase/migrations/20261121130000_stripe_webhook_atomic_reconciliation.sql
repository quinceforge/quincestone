-- Atomic Stripe event claim and commerce reconciliation.
-- This migration is additive and must be applied only in a disposable development database
-- until duplicate fulfillment rows and all migration checks have been verified.

create or replace function public.process_stripe_webhook_event(p_event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event_id text := p_event ->> 'id';
  v_event_type text := p_event ->> 'type';
  v_created bigint := (p_event ->> 'created')::bigint;
  v_occurred_at timestamptz;
  v_object jsonb := p_event #> '{data,object}';
  v_order_id uuid;
  v_payment public.commerce_payments%rowtype;
  v_updated_payment_id uuid;
  v_order_status text;
  v_amount bigint;
  v_total_refunded bigint;
  v_refund_delta bigint;
  v_full_refund boolean;
begin
  if coalesce(v_event_id, '') = '' or coalesce(v_event_type, '') = '' or v_object is null then
    raise exception using errcode = '22023', message = 'Invalid Stripe event envelope';
  end if;
  if v_created is null or v_created <= 0 then
    raise exception using errcode = '22023', message = 'Invalid Stripe event timestamp';
  end if;
  v_occurred_at := to_timestamp(v_created);

  -- This insert is the serialization point. Concurrent deliveries of the same
  -- event block on the unique key; only the transaction that inserts it proceeds.
  insert into public.commerce_stripe_events(event_id, event_type, event_created_at)
  values (v_event_id, v_event_type, v_occurred_at)
  on conflict (event_id) do nothing;

  if not found then
    return jsonb_build_object('received', true, 'duplicate', true);
  end if;

  if v_event_type = 'checkout.session.completed' then
    if coalesce(v_object ->> 'payment_status', '') <> 'paid' then
      return jsonb_build_object('received', true, 'reconciled', false);
    end if;

    begin
      v_order_id := coalesce(v_object #>> '{metadata,order_id}', v_object ->> 'client_reference_id')::uuid;
    exception when invalid_text_representation then
      raise exception using errcode = '22023', message = 'Checkout event has an invalid order reference';
    end;
    if v_order_id is null then
      raise exception using errcode = '22023', message = 'Checkout event is missing an order reference';
    end if;

    select * into v_payment
    from public.commerce_payments
    where provider = 'stripe'
      and provider_checkout_session_id = v_object ->> 'id'
      and order_id = v_order_id
    for update;

    if not found then
      raise exception using errcode = 'P0002', message = 'Payment record not found for checkout session';
    end if;

    if v_object ? 'amount_total'
      and (v_object ->> 'amount_total')::bigint <> v_payment.amount then
      raise exception using errcode = '23514', message = 'Stripe checkout amount does not match recorded payment';
    end if;
    if v_object ? 'currency'
      and lower(v_object ->> 'currency') <> lower(v_payment.currency) then
      raise exception using errcode = '23514', message = 'Stripe checkout currency does not match recorded payment';
    end if;

    select status into v_order_status
    from public.commerce_orders where id = v_order_id for update;
    if not found then
      raise exception using errcode = 'P0002', message = 'Order record not found';
    end if;

    if v_payment.provider_event_created_at is null
      or v_payment.provider_event_created_at <= v_occurred_at then
      if v_payment.status not in ('refunded', 'partially_refunded') then
        update public.commerce_payments
        set provider_event_id = v_event_id,
            provider_event_created_at = v_occurred_at,
            provider_payment_intent_id = case
              when jsonb_typeof(v_object -> 'payment_intent') = 'string' then v_object ->> 'payment_intent'
              else null end,
            verified = true,
            status = 'succeeded',
            updated_at = now()
        where id = v_payment.id;

        if v_order_status in ('pending_payment', 'paid') then
          update public.commerce_orders
          set status = 'fulfillment_required', paid_at = coalesce(paid_at, v_occurred_at), updated_at = now()
          where id = v_order_id;
          insert into public.commerce_fulfillments(order_id, source, status)
          values (v_order_id, 'supplier', 'required')
          on conflict (order_id) do nothing;
        end if;
      end if;
    end if;

  elsif v_event_type = 'payment_intent.payment_failed' then
    select * into v_payment
    from public.commerce_payments
    where provider = 'stripe' and provider_payment_intent_id = v_object ->> 'id'
    for update;

    if found then
      select status into v_order_status
      from public.commerce_orders where id = v_payment.order_id for update;

      if (v_payment.provider_event_created_at is null or v_payment.provider_event_created_at <= v_occurred_at)
        and v_payment.status in ('pending', 'processing') then
        update public.commerce_payments
        set provider_event_id = v_event_id,
            provider_event_created_at = v_occurred_at,
            verified = true,
            status = 'failed',
            updated_at = now()
        where id = v_payment.id;

        if v_order_status = 'pending_payment' then
          update public.commerce_orders
          set status = 'cancelled', cancelled_at = v_occurred_at, updated_at = now()
          where id = v_payment.order_id;
        end if;
      end if;
    end if;

  elsif v_event_type = 'charge.refunded' then
    if jsonb_typeof(v_object -> 'payment_intent') = 'string' then
      select * into v_payment
      from public.commerce_payments
      where provider = 'stripe' and provider_payment_intent_id = v_object ->> 'payment_intent'
      for update;

      if found then
        v_amount := coalesce((v_object ->> 'amount')::bigint, 0);
        v_total_refunded := coalesce((v_object ->> 'amount_refunded')::bigint, 0);
        if v_amount <= 0 or v_total_refunded < 0 or v_total_refunded > v_amount then
          raise exception using errcode = '22023', message = 'Invalid Stripe refund amounts';
        end if;

        if v_payment.provider_event_created_at is null or v_payment.provider_event_created_at <= v_occurred_at then
          select coalesce(sum(amount), 0) into v_refund_delta
          from public.commerce_refunds
          where payment_id = v_payment.id and status = 'succeeded';

          v_refund_delta := greatest(v_total_refunded - v_refund_delta, 0);
          v_full_refund := v_total_refunded >= v_amount;

          update public.commerce_payments
          set provider_event_id = v_event_id,
              provider_event_created_at = v_occurred_at,
              status = case when v_full_refund then 'refunded'
                            when v_total_refunded > 0 then 'partially_refunded'
                            else status end,
              verified = true,
              updated_at = now()
          where id = v_payment.id;

          if v_refund_delta > 0 then
            insert into public.commerce_refunds(
              order_id, payment_id, provider, provider_refund_id, amount, currency, status
            ) values (
              v_payment.order_id, v_payment.id, 'stripe', v_event_id,
              v_refund_delta::integer, v_payment.currency, 'succeeded'
            );
          end if;

          if v_full_refund then
            update public.commerce_orders
            set status = 'refunded', updated_at = now()
            where id = v_payment.order_id
              and status not in ('fulfilled', 'delivered', 'returned');
          end if;
        end if;
      end if;
    end if;
  end if;

  return jsonb_build_object('received', true, 'reconciled', true);
end;
$$;

revoke all on function public.process_stripe_webhook_event(jsonb) from public, anon, authenticated;
grant execute on function public.process_stripe_webhook_event(jsonb) to service_role;

comment on function public.process_stripe_webhook_event(jsonb) is
  'Atomically claims a Stripe event and reconciles commerce payment/order/fulfillment/refund state. Service-role only.';
