# Quincestone — Deployment and Environments

## Edge installation release

Deploy the database migration before the gateway and updated authenticated function. Deploy `edge-channel-gateway` with platform JWT verification disabled because it performs its own installation/origin gate; keep `edge-workspace` JWT verification enabled. Configure the Business OS with the verified asset and gateway URLs, then test one marked installation from an approved and an unapproved origin. Disable or revoke the installation to stop new public intake. Do not reuse a production installation for preview.

**Authority:** current deployment evidence

**Last documented inspection:** 2026-09-23. A newer read-only provider inspection was performed on 2026-11-21; see [Launch Readiness Audit](21_LAUNCH_READINESS_AUDIT_2026-11-21.md).

## Vercel projects

The Vercel team currently contains separate Corporate Web, Shop and Account projects. Provider metadata links these projects to `quinceweb/quincestone`, while the repository inspected for this audit is `quinceforge/quincestone`. Resolve this repository-owner discrepancy before treating Vercel build/deployment records as evidence for the current GitHub source. The standalone Shop project now exists. Provider state and repository configuration are reported separately; a repository contract is not deployment proof.

| Project | App boundary | Framework | Repository configuration | Domains reported by Vercel | Latest production attempt | Latest READY production |
|---|---|---|---|---|---|---|
| `webquincestone` | `apps/web` | Vite | root expected `apps/web`; output `dist` | includes the current Corporate domains and the legacy Shop attachment | **READY**, exact inspected `main` SHA | `8d10dc36eab4e207c2db1026ba9435ba43cb7ac2` |
| `quincestone-shop` | `apps/shop` | Next.js | Confirm current Vercel project settings before release | `shop.quincestone.com` verified on the Shop project | Recent READY deployment observed; target was not explicit | Production target not independently verified |
| `quincestone-account` | `apps/account` | Next.js | app `vercel.json`: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no custom domain reported | **CANCELED**, exact inspected `main` SHA | `b7f616a09606d29789180d2962ed1c78ef9d974c` |
| `quincestone-app` | `apps/app` | Next.js | app `vercel.json`: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no custom domain reported | **CANCELED**, exact inspected `main` SHA | `b7f616a09606d29789180d2962ed1c78ef9d974c` |
| `quincestone-admin` | `apps/admin` | Next.js | app `vercel.json` added by this reconciliation: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no custom domain reported | **CANCELED**, exact inspected `main` SHA | None found in the 20 deployments inspected |
| `quincestone-deals` | `apps/deals` | Next.js | app `vercel.json`: root-relative frozen install, filtered build, `.next` | Vercel aliases only; no `QuincestoneDeal.app` domain reported | **CANCELED**, exact inspected `main` SHA | `b7f616a09606d29789180d2962ed1c78ef9d974c` |

All projects reported Node `24.x`. Project IDs are intentionally omitted because names are sufficient for operations and avoid turning volatile provider identifiers into architecture.

## Deployment conclusions

- Corporate Web is **DEPLOYED** at the inspected `main` SHA and Vercel reports production **READY**. Direct production journey verification is separate.
- Standalone Shop has a Vercel project and verified `shop.quincestone.com` domain attachment. Recent READY deployment records were observed, but their target was not explicit; production deployment and runtime journey remain unverified.
- Account, Business OS and Deals have older **READY** production artifacts, but the latest exact-`main` production attempts are **CANCELED**. They are not verified current.
- Admin is **CONFIGURED** as a Vercel project, but no READY production artifact was found in the inspected window.
- The documentation PR's first Admin preview exposed a stale Vercel `dist` output setting. The branch adds an app-local Next.js `vercel.json`; verification remains pending until a new preview is READY.
- Do not detach `shop.quincestone.com` from `webquincestone` until a standalone Shop preview has the correct environment contract and its routes, APIs, canonical metadata, checkout return, mobile behavior and accessibility are verified. The domain is now attached to the standalone Shop project. Verify the current source link, production target, exact commit, environment contract and all critical journeys before treating the cutover as complete.
- `account.quincestone.com`, `app.quincestone.com`, `admin.quincestone.com` and `QuincestoneDeal.app` remain canonical domain contracts; their attachment state must be rechecked at release time.
- A canceled deployment is not a diagnosed build failure. Build logs were not inspected, so no cause is claimed.

## Environment and release rules

Browser-safe variables must remain separate from service-role, Stripe, Resend, OAuth, provider and webhook secrets. The root `pnpm-lock.yaml` is dependency authority.

A deployment is verified only when the exact commit, target, status and intended domain journey are directly checked. Preview READY does not imply production; an older production artifact does not verify newer source.

See [12_RELEASE_PROCESS.md](12_RELEASE_PROCESS.md) for the release gate and [00_COMPANY_ARCHITECTURE.md](00_COMPANY_ARCHITECTURE.md) for domain ownership.
