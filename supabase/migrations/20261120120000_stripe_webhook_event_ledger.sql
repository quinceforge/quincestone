-- Durable Stripe event idempotency, monotonic payment ordering and refund watermark.
-- The transactional RPC claims the event before reconciliation; PostgreSQL commits
-- the claim only when all related commerce writes commit successfully.
alter table public.commerce_payments
  add column if not exists provider_event_created_at timestamptz;

alter table public.commerce_payments
  add column if not exists provider_amount_refunded integer not null default 0;

-- The previous webhook recorded Stripe charge.refunded event IDs and cumulative
-- amount_refunded values. Backfill the latest cumulative value, not the sum of
-- those historical snapshots, before switching to delta-based refund writes.
update public.commerce_payments p
set provider_amount_refunded = coalesce((
  select max(r.amount)
  from public.commerce_refunds r
  where r.payment_id = p.id
    and r.provider = 'stripe'
    and r.status = 'succeeded'
    and r.provider_refund_id like 'evt_%'
), 0)
where p.provider = 'stripe';

create table if not exists public.commerce_stripe_events (
  event_id text primary key,
  event_type text not null,
  event_created_at timestamptz not null,
  received_at timestamptz not null default now()
);

create index if not exists commerce_stripe_events_received_idx
  on public.commerce_stripe_events (received_at desc);

alter table public.commerce_stripe_events enable row level security;
revoke all on public.commerce_stripe_events from public, anon, authenticated;
grant all on public.commerce_stripe_events to service_role;

comment on table public.commerce_stripe_events is
  'Durable Stripe webhook event ledger. Service-role only; events are recorded after successful reconciliation.';
comment on column public.commerce_payments.provider_event_created_at is
  'Timestamp of the newest Stripe event applied to this payment; prevents stale events from regressing payment state.';

-- The current fulfillment model is one fulfillment record per order; this
-- constraint makes concurrent duplicate checkout events safe.
create unique index if not exists commerce_fulfillments_order_uidx
  on public.commerce_fulfillments (order_id);

comment on column public.commerce_payments.provider_amount_refunded is
  'Cumulative Stripe amount_refunded observed for this payment, in the payment currency minor unit.';
