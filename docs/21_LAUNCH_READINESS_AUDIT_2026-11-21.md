# Quincestone launch-readiness audit — 2026-11-21

**Status:** discovery in progress; no production changes made.
**Audit branch:** `chore/launch-readiness-audit-2026-11`
**Production source:** `main`
**Repository inspected:** `quinceforge/quincestone`

## Executive findings

1. The repository is a multi-application monorepo. Preserve the existing boundaries: Corporate Web, Shop, Account, Business OS, Deals, Admin, shared packages, and one canonical Supabase backend.
2. The standalone Shop Vercel project now exists and `shop.quincestone.com` is verified on that project. This contradicts older deployment documentation that says the Shop project does not exist.
3. Vercel project metadata currently associates the Corporate, Shop and Account projects with `quinceweb/quincestone`, while the inspected GitHub repository is `quinceforge/quincestone`. This source-link discrepancy must be resolved before treating CI/deployments as evidence for this repository.
4. Recent Vercel deployment records show READY artifacts for Corporate Web, Shop and Account on branch `brand/qid-1-7-corporate-convergence`, commit `044ffba186cc4b347d1a1941cacd6d1834be2316`. Those records had no explicit production target. A query filtered to production returned no records. Do not call these production deployments or live-domain verification.
5. The Phase 2 Stripe branch exists and is 10 commits ahead of `main`, zero behind at inspection. It adds a durable Stripe event ledger, event timestamp ordering and a unique fulfillment-per-order index. Its current webhook handler still performs payment, order, fulfillment/refund and event-ledger writes as separate PostgREST requests. This is not transaction-level atomicity.
6. The branch webhook has a check-then-act idempotency race: two concurrent deliveries can both observe no ledger row and begin reconciliation before either inserts the event row. A unique event primary key at the final insert does not roll back earlier writes. The unique fulfillment index helps one sub-operation but does not make the whole transition atomic.
7. The migration adds a unique index on `commerce_fulfillments(order_id)`. Before applying it anywhere, verify existing data has no duplicate order IDs and confirm the intended one-fulfillment-per-order model.
8. The repository's documented local command is `pnpm install --frozen-lockfile` followed by `pnpm check`. No local checkout/build/test execution has been performed in this remote GitHub inspection session.
9. Supabase project `quincestone` is ACTIVE_HEALTHY, PostgreSQL 17, with 56 recorded migrations and 8 Edge Functions at inspection. Production was queried read-only; no migrations or writes were applied.
10. Supabase advisor results included 5 RLS-enabled tables without policies, 1 SECURITY DEFINER finding, 1 leaked-password-protection warning, and 18 unindexed foreign keys. These are review leads, not automatic proof of exploitable vulnerabilities. Compare each finding to intended access patterns before remediation.

## Verified deployment configuration

| Surface | Vercel project | Custom domain evidence |
|---|---|---|
| Corporate | `webquincestone` | `quincestone.com`, `www.quincestone.com` verified |
| Shop | `quincestone-shop` | `shop.quincestone.com` verified |
| Account | `quincestone-account` | `account.quincestone.com` verified |

Domain verification proves domain attachment/verification only. It does not prove current production deployment or runtime journey correctness.

## Priority engineering work

### P0 — Establish trustworthy source and release evidence
- Resolve the Vercel Git repository owner mismatch and verify exact project root/build settings.
- Inspect production-target deployment records, current aliases and runtime domains independently.
- Preserve `main` as production source authority.

### P0 — Stripe transactional webhook
- Replace multi-request reconciliation with a single database transaction, preferably a narrowly scoped service-only Postgres RPC.
- Claim the Stripe event and apply all related payment/order/fulfillment/refund transitions in the same transaction.
- Make duplicate concurrent deliveries serialize safely; a duplicate must return success only after the first transaction commits.
- Enforce monotonic event ordering and terminal-state rules inside the transaction, not only in application-side sequencing.
- Verify payment/order relationships, amount/currency and allowed state transitions.
- Add tests for duplicate concurrent delivery, stale success after failure, stale failure after success, repeated refunds, partial/full refunds, missing payment, DB failure/rollback and retry.
- Keep the event ledger, payment, order, fulfillment and refund records mutually consistent on every failure path.

### P1 — Local environment and automated quality gate
- Inspect current Supabase CLI conventions and repository configuration before introducing `supabase/config.toml`.
- Run frozen install, root `pnpm check`, and targeted Shop tests in a controlled local environment.
- Do not assume the earlier disposable Supabase branch exists or is still running; verify provider state and cost before any provisioning.

### P1 — Shop and five department catalogue
- Audit actual route coverage, product records, assets, cart, checkout and Account handoff.
- Preserve approved DRIVE selling prices: 4K Dual Dash Camera ₦179,900; Multi-function Car Jump Starter ₦119,900; Digital Tyre Inflator ₦69,900; Wireless Tyre Pressure Monitor ₦79,900; Professional OBD2 Scanner ₦199,900.
- Treat these as approved selling prices only; supplier costs, landed costs, inventory and margins remain unverified.
- Verify HOME, PET, TRAVEL and WORK catalogues against actual repository and canonical product records before declaring them complete.

## Safety and scope

- This branch is based on `main` and is intended for audit documentation and subsequent focused implementation.
- No production Supabase writes, migrations, deployments, domain changes, secrets changes or live payment actions were performed.
- Do not merge this audit branch as a substitute for the required engineering and test gates.
- All production migrations, production deployments, domain cutovers and cost-incurring infrastructure changes require separate explicit approval.

## Canonical catalogue snapshot (read-only, 2026-11-21)

The canonical production `commerce_products` table contains 21 records, and none currently satisfy the combined public-publishing state (`lifecycle_status = active`, `merchandising_status = published`, `publication_state = published`).

| Collection | Records | Current states |
|---|---:|---|
| `drive` | 8 | All research / draft / private |
| `home-outdoor` | 8 | All research / draft / private |
| `companion` (Pet naming candidate) | 2 | All research / draft / private |
| `travel` | 2 | One research / draft / private; one sourcing / draft / private |
| Work | 0 | No collection records observed |

This means catalogue records exist, but none are publicly publishable under the current canonical state gates. Department labels and mappings must be reconciled before publication. In particular, `companion` must be confirmed as the intended Pet department and `home-outdoor` as the intended Home department. Do not promote research records to active or published merely to fill the storefront. Product readiness requires verified supplier, landed cost, media rights, product content, price, inventory and launch approval.

## Updated deployment-provider evidence (2026-11-21)

A direct Vercel project read shows the three customer-facing projects currently have `live: false`. Each has a latest deployment with `readyState: READY`, but `target: null`. Therefore these READY deployments are not evidence of a production-target deployment.

| Project | Framework | Latest deployment target | Project live flag |
|---|---|---|---|
| `webquincestone` | Vite | null (not identified as production) | false |
| `quincestone-shop` | Next.js | null (not identified as production) | false |
| `quincestone-account` | Next.js | null (not identified as production) | false |

Custom domains are attached to the projects, but attachment alone does not prove the domains serve a current production deployment. Production launch remains unverified.

The Vercel team `quincestone` is on the Hobby plan. Its six Quincestone application projects are connected to GitHub repository `quinceweb/quincestone`, while this active engineering repository is `quinceforge/quincestone`. A separate Vercel team `quincestoneforge` is on Pro but currently has no linked projects. Do not change Git integration, team ownership, domains or project settings without a separate explicit approval and a rollback plan.

## Disposable database environment blocker

The Supabase project currently has no development branch. Branch creation was attempted only after the previously approved $0.01344/hour, 24-hour test window authorization; the provider rejected the operation because database branching requires the Pro plan or above. No branch was created and no cost was incurred. The connected Desktop Commander device was offline at the time of inspection, so local Docker/Supabase CLI validation could not be run. The SQL test script is committed for execution in a disposable database when an eligible environment is available.
