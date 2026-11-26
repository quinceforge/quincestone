# Quincestone — Provider Register

Edge installation intake is a Quincestone Core capability, not an external provider. It prepares and routes work but does not execute consequential provider actions. Existing provider executors remain behind human authorization and `action_executions`.

## Canonical repository source

| Provider | Governed role | Source evidence |
|---|---|---|
| GitHub | Canonical repository and source ref | [`quinceforge/quincestone`](https://github.com/quinceforge/quincestone), remote `main` verified on 2026-11-26 at `4597086726f3afa0facc9042affaba8d4b3ca67a` for QS-AUDIT-002 and reconfirmed for T01. |

The source-ref check establishes the repository and commit. Provider configuration, authenticated connections, deployments and exact runtime journeys have their own dated evidence under the [release process](12_RELEASE_PROCESS.md#status-and-evidence).

## Historical provider snapshot

**Inspected:** 2026-09-15. The status claims in this table describe the original inspection. The Vercel inventory has since been superseded by the [2026-11-22 snapshot](09_DEPLOYMENT_AND_ENVIRONMENTS.md#vercel-inventory-observed-on-2026-11-22).

| Provider | Governed role | Status and evidence recorded on 2026-09-15 |
|---|---|---|
| GitHub | Source authority | **CONNECTED / VERIFIED**: former repository path `quinceweb/quincestone`; remote `main` inspected at the recorded SHA |
| Vercel | Project deployment and domain delivery | **CONNECTED / CONFIGURED**: five projects inspected; only Web was READY at current `main`; see [deployment evidence](09_DEPLOYMENT_AND_ENVIRONMENTS.md) |
| Supabase | One canonical backend: Auth, PostgreSQL, RLS, RPCs, Edge Functions, events and audit foundation | **CONNECTED / DEPLOYED**: exact project `quincestone` inspected; 55 deployed migrations reconciled to source on 2026-09-15; clean replay of repository-only pending migrations remains separate work |
| Stripe | PaymentProvider | **CONNECTED** in live mode: one active “Quincestone Edge Assessment” product and one USD 49 one-time price; no webhook endpoints returned. No successful production payment was inspected |
| Resend | Email delivery provider | **CONNECTED / CONFIGURED**: `send.quincestone.com` verified for sending; `shopmail.quincestone.com` failed verification; no templates or webhooks returned. Delivery is **NOT VERIFIED** |
| Shopify | CommerceProvider / downstream projection where used | Projection tables and RPC boundary **DEPLOYED** in Supabase; provider connection, catalog sync and order authority **NOT VERIFIED** |
| Google | CalendarProvider / business capability | Calendar Edge Functions **DEPLOYED**; provider configuration and successful execution **NOT VERIFIED** |
| Colibrì | Replaceable IntelligenceProvider below Edge | **PLANNED / NOT INSPECTED**; no product, policy or authority ownership |
| Ever Gauzy | Optional BusinessProvider below ActionExecution | **PLANNED / NOT INSPECTED**; no connection, deployment or production readiness claimed |
| Artemis | Independent verification plane | **PLANNED / DEFERRED**; never runtime product authority |

Provider capability never transfers Quincestone identity, policy, authorization, workflow or UX ownership. Account existence, configuration, connection, deployment, runtime verification and production readiness are separate states.

All provider results return through governed server adapters and are reconciled into the shared Quincestone backend. Stripe retains payment-provider authority; Resend retains delivery authority; Colibrì and Ever Gauzy remain replaceable capability providers. None owns Quincestone's canonical entity model. See [One Quincestone Backend](03_ONE_QUINCESTONE_BACKEND.md).
