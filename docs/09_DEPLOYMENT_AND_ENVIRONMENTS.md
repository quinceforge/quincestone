# Quincestone — Deployment and Environments

> **Latest recorded provider snapshot (2026-11-22):** This section supersedes the historical Vercel inventory below. It records provider configuration and artifact metadata only; custom-domain verification is not a full browser journey test.

## Current Vercel inventory

The inspected Vercel team contains six projects. Each project has a latest READY preview deployment built from branch `brand/qid-1-7-corporate-convergence`, commit `044ffba186cc4b347d1a1941cacd6d1834be2316` (2026-11-11). The latest READY production deployments across all six projects point to `main` at `6e1f9615f747788c318e7d5d098e374e4d9dbce5` (2026-10-20). No deployment record was found for the then-current repository `main` merge commit `d4453c9e675d5562f9a4753203776f601759da41` (PR #147). Therefore the latest source changes are not verified as deployed to production.

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

The subsequent source audit found PR #148 merged at `4597086726f3afa0facc9042affaba8d4b3ca67a`. Provider deployment state for that commit was not checked during the source audit.

- Vercel deployment metadata still labels the GitHub owner as `quinceweb`. GitHub redirects that former repository path to `quinceforge/quincestone`; the redirect resolves to the same repository ID, so this is a legacy owner path, not evidence of two separate repositories.
- At the time of the snapshot, `main` was `d4453c9e675d5562f9a4753203776f601759da41`. GitHub reports the merged PR #147 quality check successful, and PR #147's quality, rendered-browser and review checks all passed.
- Vercel's latest READY previews are from the separate `brand/qid-1-7-corporate-convergence` branch and are not previews of current `main`.
- The latest READY production artifacts are from `6e1f9615f747788c318e7d5d098e374e4d9dbce5`, before the later corporate-authority and homepage-test merges. Do not describe the current `main` content as live.
- The Deal project has two distinct verified domain spellings: `quincestonedeals.app` and `www.quincestonedeal.app`. Canonical architecture documentation names `QuincestoneDeal.app`. Keep external Deal navigation withheld until the owner confirms the intended canonical hostname and redirect policy.
- Corporate and Shop have separate Vercel projects and the expected custom domains are attached to their respective projects. Do not change domain attachments or DNS as part of this documentation reconciliation.
- GitHub reports the `main` branch as unprotected, with required status-check enforcement disabled. This is a repository-governance risk; branch protection and required checks are not changed by this PR and require separate approval.

## Deployment conclusions

- **Source:** current repository `main` is ahead of every observed READY production artifact.
- **Preview:** READY artifacts exist, but the latest ones are from the corporate-convergence feature branch, not current `main`.
- **Production:** all six projects have READY production artifacts at the older SHA shown above; the current merged source has not been shown as deployed.
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

## Historical September deployment snapshot

This section preserves September observations. Use the newer dated inventory above for later provider evidence.

**Inspected:** 2026-09-23 against `main` source `8d10dc36eab4e207c2db1026ba9435ba43cb7ac2`

### Vercel projects in September

Five projects are **CONNECTED** to `quinceweb/quincestone` in the inspected Vercel team. No standalone Shop project exists yet. Provider state and repository configuration are reported separately; a repository contract is not deployment proof.

| Project | App boundary | Framework | Repository configuration | Domains reported by Vercel | Latest production attempt | Latest READY production |
|---|---|---|---|---|---|---|
| `webquincestone` | `apps/web` | Vite | root expected `apps/web`; output `dist` | includes the current Corporate domains and the legacy Shop attachment | **READY**, exact inspected `main` SHA | `8d10dc36eab4e207c2db1026ba9435ba43cb7ac2` |
| `Quincestone Shop` | `apps/shop` | Next.js | root `apps/shop`; frozen monorepo install; filtered build; output `.next` | target `shop.quincestone.com` | **NOT CREATED** | None |
| `quincestone-account` | `apps/account` | Next.js | app `vercel.json`: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no custom domain reported | **CANCELED**, exact inspected `main` SHA | `b7f616a09606d29789180d2962ed1c78ef9d974c` |
| `quincestone-app` | `apps/app` | Next.js | app `vercel.json`: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no custom domain reported | **CANCELED**, exact inspected `main` SHA | `b7f616a09606d29789180d2962ed1c78ef9d974c` |
| `quincestone-admin` | `apps/admin` | Next.js | app `vercel.json` added by this reconciliation: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no custom domain reported | **CANCELED**, exact inspected `main` SHA | None found in the 20 deployments inspected |
| `quincestone-deals` | `apps/deals` | Next.js | app `vercel.json`: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no `QuincestoneDeal.app` domain reported | **CANCELED**, exact inspected `main` SHA | `b7f616a09606d29789180d2962ed1c78ef9d974c` |

All projects reported Node `24.x`. Project IDs are intentionally omitted because names are sufficient for operations and avoid turning volatile provider identifiers into architecture.

### September deployment conclusions

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
