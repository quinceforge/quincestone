# Quincestone Master Architecture & Corporate Authority Implementation Specification

**Status:** Approved development direction  
**Repository:** `quinceforge/quincestone`  
**Baseline:** `main` at `6e1f9615f747788c318e7d5d098e374e4d9dbce5`  
**Development branch:** `codex/corporate-authority-ecosystem`  
**Production status:** Protected; no production deployment, merge, migration, DNS change, payment change, or customer-data mutation is authorized by this specification.

## 1. Strategic architecture

Quincestone is one company operating a connected ecosystem of independently owned digital products. Its corporate website is the public institutional authority and marketing gateway. It is not the commerce catalogue, customer account application, business workspace, or negotiation runtime.

The design direction is **hybrid enterprise/editorial**: enterprise-grade information architecture, precise product communication, restrained premium visual execution, accessible interactions, and measurable engineering quality. Learn from leading technology companies' clarity, systems thinking, reliability and governance; do not imitate their trademarks, interfaces or unsupported claims.

## 2. Canonical product responsibilities and domains

| Product | Canonical destination | Responsibility |
|---|---|---|
| Corporate | `https://quincestone.com` | Company identity, public information, product/service marketing, research, careers, contact |
| Shop | `https://shop.quincestone.com` | Product catalogue, departments, cart, checkout, orders and commerce operations |
| Account | `https://account.quincestone.com` | Individual identity, authentication, profile and account security |
| Business | `https://app.quincestone.com` | Business workspace, organization membership, projects, service requests and delivery |
| Edge | `https://quincestone.com/edge` | Edge product marketing, capability explanation and truthful demonstrations |
| Deals | Existing canonical domain `https://quincestonedeal.app` pending domain-owner verification | Negotiated commercial opportunities, proposals, terms and agreements |
| Admin | `https://admin.quincestone.com` subject to existing deployment verification | Internal administrative control plane |

Do not introduce a second Deal domain or another application deployment without a reviewed architecture decision. All cross-product destinations should ultimately be centralized in a typed link/configuration module and verified against actual deployed applications before production use.

## 3. Corporate website information architecture

Primary public navigation:
- Home
- Commerce
- Edge
- Business
- Deal
- About
- Research
- Careers
- Contact

The existing platform/operating-model content may remain accessible as supporting corporate material, but it must not obscure the company's broader technology, commerce and business-enablement identity.

### Homepage
Establish Quincestone as a technology and commerce company. Explain what it builds, sells and delivers. Present the ecosystem and route visitors to the correct product. Keep existing working demonstrations where their illustrative status is explicit and they add real explanatory value.

### Commerce page
This is a corporate introduction to Quincestone Shop, not a duplicate storefront. Explain the five departments: DRIVE, HOME, PET, TRAVEL and WORK; communicate product-selection and customer-experience standards; display **no more than two** Quincestone Verified products, and only when the authoritative catalogue confirms that each product meets all publication and verification requirements. Do not fabricate products, ratings, badges, stock, prices or claims. If no eligible products exist, show a transparent non-product state or omit the showcase until eligibility is met. The primary CTA opens `https://shop.quincestone.com`.

### Edge page
Explain the actual Edge product and its boundaries: observed facts, derived intelligence, approved knowledge, policy, human review, authorized action, outcome and trace. Demonstrations must be labeled illustrative unless connected to a real, authorized environment. Do not imply capabilities not implemented.

### Business page
Present five service lines:
1. Digital Foundation & Engineering — corporate sites, startup platforms, school/church/organization sites, portals and commerce platforms.
2. Experience & Conversion Modernization — audits, restructuring, UX, accessibility, performance and conversion improvement.
3. Digital Identity & Presence Infrastructure — business identity, eligible business-profile setup, maps/discovery configuration, listings, SEO and ongoing management.
4. Business Launch & Revenue Architecture — business model, revenue, pricing, payment-flow planning, platform and operational architecture.
5. Digital Operations Stewardship — CRM/workflows, automation, analytics, operational systems and Edge implementation.

The page must distinguish services Quincestone can currently deliver from roadmap/partner-dependent services. Do not guarantee search ranking, map placement, third-party verification, revenue, conversion uplift or integrations. Primary workspace CTA points to `https://app.quincestone.com`; assessment/contact intake remains a separate pre-engagement path.

### Deal page
Explain commercial enquiries, proposals, negotiation and agreement workflows and link to the verified canonical Deals application. Do not describe Quincestone as an escrow, bank, payment institution or legal service provider unless the relevant regulated capability and permissions are independently established.

### Company pages
About, Research, Careers and Contact must contain accurate, approved information. No invented staff, customers, case studies, partnerships, awards, office addresses or performance metrics.

## 4. Shared ecosystem architecture

Preserve the existing independently deployable applications and shared packages. Preserve the established One Quincestone Backend direction and its single canonical Supabase authority. Reuse existing identity, policy, workflow, audit, event, data ownership and RLS foundations rather than introducing parallel systems.

Application boundaries:
- Corporate owns public marketing content and inbound corporate enquiries.
- Shop owns catalogue, cart, checkout and order operations.
- Account owns individual identity and authentication.
- Business owns organization workspaces, projects and service delivery.
- Edge owns governed intelligence and action orchestration within explicit authority limits.
- Deals owns negotiated commercial records and participant access.
- Admin owns internal administrative operations with privileged access controls.

Authentication is not authorization. Enforce server-side authorization, organization scoping, least privilege, RLS and auditability. Do not expose service-role credentials or provider secrets to browser code. Consequential external actions require explicit authorization and suitable human review.

## 5. Design constitution

- Preserve and reconcile the existing QVS design-system tokens before creating new local token families.
- Hybrid visual language: premium editorial composition plus precise enterprise product communication.
- Use the established warm stone/ivory, carbon and mineral-teal design family where supported by canonical tokens. Do not independently introduce a competing accent palette.
- Typography, contrast, responsive grids, focus states, keyboard behavior, motion preferences and semantic structure must be consistent.
- Reuse shared components and existing interaction patterns where they meet quality requirements.
- Do not redesign unrelated product applications as part of the corporate-first milestone.

## 6. Corporate-first delivery sequence

1. Reconcile source-of-truth, route/domain ownership, design tokens and existing corporate PR work.
2. Update corporate navigation and Account/Business destinations.
3. Rebuild corporate Commerce presentation and Shop handoff.
4. Expand Business service proposition and workspace handoff.
5. Refine Edge and Deal marketing pages without changing their underlying product runtimes.
6. Audit homepage, footer, SEO, metadata, structured content and accessibility.
7. Verify links and responsive behavior; prepare preview and draft PR.
8. After corporate review, continue ecosystem-wide integration in separate, bounded workstreams.

## 7. Quality gates

For the corporate app:
- frozen-lockfile dependency install in a controlled environment;
- ESLint;
- TypeScript typecheck;
- Vitest;
- Vite production build;
- keyboard and screen-reader checks;
- responsive checks at mobile, tablet and desktop widths;
- metadata, canonical URL, sitemap and robots checks;
- internal/external link destination verification;
- no console errors or broken routes;
- honest demo/product/service content review.

Run monorepo checks where the available environment permits. Report commands actually run and their exact results. A GitHub commit or successful status check is not by itself proof of a live production release.

## 8. Source and release safeguards

- Work only on `codex/corporate-authority-ecosystem` until a reviewed PR is ready.
- Do not force-push, rewrite shared history, merge, or modify `main`.
- Do not merge or wholesale copy stale PRs. Reuse prior work selectively after diff review.
- No production deployment, production migration, customer-data change, payment configuration change, DNS cutover, or unapproved recurring spend.
- Preserve existing commerce, account, business, Edge, Deals and admin functionality.
- Any required backend schema change must be separately designed, tested and approved before application.
- Preview deployments are allowed only within existing authorized preview infrastructure and must not be represented as production.

## 9. Initial known risks requiring verification

- Corporate Account links currently point to Business app paths; update to Account domain while preserving Business workspace destination.
- Corporate Deal link spellings/domain references differ across current source and architecture notes; verify domain ownership and routing before treating one as production canonical.
- The QVS documentation and actual shared CSS tokens need reconciliation; inspect all consumers before changing tokens.
- Existing launch-readiness notes identify Vercel Git-source and production-target questions. Verify actual Vercel project source and live targets before any release; do not infer production state from GitHub CI alone.
- Corporate product showcase must use the catalogue publication gate and must not create a second product source of truth.
- The inspected main branch is not protected at the GitHub branch metadata level. Do not change repository protection settings without separate approval.

## 10. Definition of done for the first corporate milestone

- Corporate page hierarchy communicates the company, not just one software capability.
- Commerce page markets Shop and sends checkout/catalogue activity to Shop.
- No more than two eligible Verified products are shown.
- Business page clearly presents the five approved service lines and routes workspace users to Business.
- Account links route to Account, not Business.
- Edge demonstration remains clearly illustrative unless genuinely connected.
- Deal destination is consistent and verified or clearly withheld pending verification.
- Existing routes, legal pages, demos and shared components remain functional.
- Corporate checks pass and a draft PR contains evidence, changed files, test results, limitations and approval requirements.
- Production remains unchanged until separate explicit authorization.
