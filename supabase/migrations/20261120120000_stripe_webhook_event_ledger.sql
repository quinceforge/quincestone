-- Durable Stripe event idempotency and monotonic provider-event ordering.
-- Event rows are inserted only after the webhook's reconciliation writes succeed.
alter table public.commerce_payments
  add column if not exists provider_event_created_at timestamptz;

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
