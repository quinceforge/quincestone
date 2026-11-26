# Quincestone — Deployment and Environments

## Source and evidence scope

Remote `main` in [`quinceforge/quincestone`](https://github.com/quinceforge/quincestone) was verified on 2026-11-26 at audited SHA `4597086726f3afa0facc9042affaba8d4b3ca67a`. This is source evidence. The audited SHA has no deployment or production journey verification in this record. See the [release process](12_RELEASE_PROCESS.md#status-and-evidence) for evidence requirements and [open decisions](12_RELEASE_PROCESS.md#open-decisions) for approval gates.

> **Dated provider snapshot (2026-11-22):** This section supersedes the 2026-09-23 Vercel inventory below. It records provider configuration and artifacts. Custom-domain verification describes provider configuration and is separate from runtime journey testing.

## Vercel inventory observed on 2026-11-22

The inspected Vercel team contains six projects. Each project has a latest READY preview deployment built from branch `brand/qid-1-7-corporate-convergence`, commit `044ffba186cc4b347d1a1941cacd6d1834be2316` (2026-11-11). The latest READY production deployments across all six projects point to `main` at `6e1f9615f747788c318e7d5d098e374e4d9dbce5` (2026-10-20). No deployment record was found for the repository `main` merge commit at that inspection `d4453c9e675d5562f9a4753203776f601759da41` (PR #147). The inspection did not establish production deployment of that source SHA.

| Vercel project | App | Framework | Verified custom domains | Latest READY production SHA | Latest READY preview SHA |
|---|---|---|---|---|---|
| `webquincestone` | `apps/web` | Vite | `quincestone.com` (308 redirect to `www.quincestone.com`), `www.quincestone.com` | `6e1f9615f747788c318e7d5d098e374e4d9dbce5` | `044ffba186cc4b347d1a1941cacd6d1834be2316` |
| `quincestone-shop` | `apps/shop` | Next.js | `shop.quincestone.com` | `6e1f9615f747788c318e7d5d098e374e4d9dbce5` | `044ffba186cc4b347d1a1941cacd6d1834be2316` |
| `quincestone-account` | `apps/account` | Next.js | `account.quincestone.com` | `6e1f9615f747788c318e7d5d098e374e4d9dbce5` | `044ffba186cc4b347d1a1941cacd6d1834be2316` |
| `quincestone-app` | `apps/app` | Next.js | `app.quincestone.com` | `6e1f9615f747788c318e7d5d098e374e4d9dbce5` | `044ffba186cc4b347d1a1941cacd6d1834be2316` |
| `quincestone-admin` | `apps/admin` | Next.js | `admin.quincestone.com` | `6e1f9615f747788c318e7d5d098e374e4d9dbce5` | `044ffba186cc4b347d1a1941cacd6d1834be2316` |
| `quincestone-deals` | `apps/deals` | Next.js | `quincestonedeals.app`, `www.quincestonedeal.app` | `6e1f9615f747788c318e7d5d098e374e4d9dbce5` | `044ffba186cc4b347d1a1941cacd6d1834be2316` |

Vercel reported all listed custom domains as verified. This is provider domain-verification evidence, not proof that every page, redirect, authentication flow, checkout or API works end-to-end.

### Source connection and release gap

- The 2026-11-22 inspection recorded the former GitHub owner `quinceweb` in Vercel deployment metadata. The former path redirected to `quinceforge/quincestone` and resolved to the same repository ID.
- At that inspection, `main` was `d4453c9e675d5562f9a4753203776f601759da41`. GitHub reports the merged PR #147 quality check successful, and PR #147's quality, rendered-browser and review checks all passed.
- Vercel's latest READY previews are from the separate `brand/qid-1-7-corporate-convergence` branch and are not previews of the `main` SHA recorded in that inspection.
- The latest READY production artifacts are from `6e1f9615f747788c318e7d5d098e374e4d9dbce5`, before the later corporate-authority and homepage-test merges. Those artifacts establish deployment only for the observed production SHA.
- The Deal project has two distinct verified domain spellings: `quincestonedeals.app` and `www.quincestonedeal.app`. Canonical architecture documentation names `QuincestoneDeal.app`. Keep external Deal navigation withheld until the owner confirms the intended canonical hostname and redirect policy.
- Corporate and Shop have separate Vercel projects and the expected custom domains are attached to their respective projects. Do not change domain attachments or DNS as part of this documentation reconciliation.
- The 2026-11-22 record reports `main` as unprotected with required status-check enforcement disabled. Current settings and any proposed changes require separate review and approval.

## Deployment conclusions from 2026-11-22

- **Source:** the inspected repository `main` is ahead of every observed READY production artifact.
- **Preview:** READY artifacts exist, but the latest ones are from the corporate-convergence feature branch, not current `main`.
- **Production:** all six projects have READY production artifacts at the older SHA shown above; the source SHA inspected on 2026-11-22 had no matching deployment in that record.
- **Domain configuration:** all six product surfaces have their expected domains attached and Vercel marks them verified, with the Deal hostname discrepancy still unresolved.
- **Runtime verification:** not performed in this provider inventory. Exact production-domain browser journeys, auth boundaries, checkout/payment, APIs, and cross-app handoffs remain separate verification work.

## Release gate

Before any production release:
1. Build a preview from the exact current `main` SHA for each affected app.
2. Verify route, responsive, accessibility, metadata, authentication and cross-app handoff behavior on those exact previews.
3. Verify backend/RLS/provider behavior for any affected vertical slice; never use synthetic live financial actions.
4. Resolve the canonical Deal hostname and redirect policy with the domain owner.
5. Obtain separate explicit release approval; no production deployment, promotion, DNS/domain mutation, migration, payment configuration change or customer-data mutation is authorized by this audit.

---

## Edge installation release

Deploy the database migration before the gateway and updated authenticated function. Deploy `edge-channel-gateway` with platform JWT verification disabled because it performs its own installation/origin gate; keep `edge-workspace` JWT verification enabled. Configure the Business OS with the verified asset and gateway URLs, then test one marked installation from an approved and an unapproved origin. Disable or revoke the installation to stop new public intake. Do not reuse a production installation for preview.

## Historical Vercel snapshot from 2026-09-23

**Evidence status:** **SUPERSEDED** by the 2026-11-22 inventory. The following records describe the original inspection.

**Inspected:** 2026-09-23 against `main` source `8d10dc36eab4e207c2db1026ba9435ba43cb7ac2`

## Vercel projects

The 2026-09-23 inspection recorded five projects **CONNECTED** to the former repository path `quinceweb/quincestone` in the inspected Vercel team. No standalone Shop project exists yet. Provider state and repository configuration are reported separately; a repository contract is not deployment proof.

| Project | App boundary | Framework | Repository configuration | Domains reported by Vercel | Latest production attempt | Latest READY production |
|---|---|---|---|---|---|---|
| `webquincestone` | `apps/web` | Vite | root expected `apps/web`; output `dist` | includes the current Corporate domains and the legacy Shop attachment | **READY**, exact inspected `main` SHA | `8d10dc36eab4e207c2db1026ba9435ba43cb7ac2` |
| `Quincestone Shop` | `apps/shop` | Next.js | root `apps/shop`; frozen monorepo install; filtered build; output `.next` | target `shop.quincestone.com` | **NOT CREATED** | None |
| `quincestone-account` | `apps/account` | Next.js | app `vercel.json`: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no custom domain reported | **CANCELED**, exact inspected `main` SHA | `b7f616a09606d29789180d2962ed1c78ef9d974c` |
| `quincestone-app` | `apps/app` | Next.js | app `vercel.json`: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no custom domain reported | **CANCELED**, exact inspected `main` SHA | `b7f616a09606d29789180d2962ed1c78ef9d974c` |
| `quincestone-admin` | `apps/admin` | Next.js | app `vercel.json` added by this reconciliation: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no custom domain reported | **CANCELED**, exact inspected `main` SHA | None found in the 20 deployments inspected |
| `quincestone-deals` | `apps/deals` | Next.js | app `vercel.json`: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no `QuincestoneDeal.app` domain reported | **CANCELED**, exact inspected `main` SHA | `b7f616a09606d29789180d2962ed1c78ef9d974c` |

All projects reported Node `24.x`. Project IDs are intentionally omitted because names are sufficient for operations and avoid turning volatile provider identifiers into architecture.

## Deployment conclusions from 2026-09-23

- Corporate Web is **DEPLOYED** at the inspected `main` SHA and Vercel reports production **READY**. Direct production journey verification is separate.
- Standalone Shop is repository-ready only after its branch checks pass. It has no Vercel project, preview, or production deployment in this snapshot.
- Account, Business OS and Deals have older **READY** production artifacts, but the latest exact-`main` production attempts are **CANCELED**. They are not verified current.
- Admin is **CONFIGURED** as a Vercel project, but no READY production artifact was found in the inspected window.
- The documentation PR's first Admin preview exposed a stale Vercel `dist` output setting. The branch adds an app-local Next.js `vercel.json`; verification remains pending until a new preview is READY.
- Do not detach `shop.quincestone.com` from `webquincestone` until a standalone Shop preview has the correct environment contract and its routes, APIs, canonical metadata, checkout return, mobile behavior and accessibility are verified. The final domain move must be one intentional cutover with a rollback target.
- `account.quincestone.com`, `app.quincestone.com`, `admin.quincestone.com` and `QuincestoneDeal.app` remain canonical domain contracts; their attachment state must be rechecked at release time.
- A canceled deployment is not a diagnosed build failure. Build logs were not inspected, so no cause is claimed.

## Environment and release rules

Browser-safe variables must remain separate from service-role, Stripe, Resend, OAuth, provider and webhook secrets. The root `pnpm-lock.yaml` is dependency authority.

A deployment is verified only when the exact commit, target, status and intended domain journey are directly checked. Preview READY does not imply production; an older production artifact does not verify newer source.

See [12_RELEASE_PROCESS.md](12_RELEASE_PROCESS.md) for the release gate and [00_COMPANY_ARCHITECTURE.md](00_COMPANY_ARCHITECTURE.md) for domain ownership.
