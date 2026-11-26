# Quincestone repository guide

Start with [agent rules](../AGENTS.md), the [canonical architecture](00_COMPANY_ARCHITECTURE.md) and the [delivery direction](DELIVERY_DIRECTION.md). Each application owns its user journey. The shared backend owns canonical records and enforces authorization.

## Product and source ownership

| Surface | Where to start | Authority and boundary |
|---|---|---|
| Corporate | [apps/web](../apps/web/README.md), [corporate specification](22_QUINCESTONE_MASTER_ARCHITECTURE_AND_CORPORATE_AUTHORITY_SPEC.md) | Company identity, services, trust and routing to product surfaces |
| Shop | [apps/shop](../apps/shop/README.md), [commerce architecture](07_COMMERCE_ARCHITECTURE.md), [Shop boundary](20_SHOP_APPLICATION_BOUNDARY.md) | Published catalogue and fixed-price commerce. Admin owns authoring and approval. |
| Account | [apps/account](../apps/account/README.md), [identity and access](04_IDENTITY_AND_ACCESS.md) | Personal identity, recovery and customer relationship. Workspace and platform authority require separate checks. |
| Business OS | [apps/app](../apps/app/README.md), [product architecture](01_PRODUCT_ARCHITECTURE.md) | Workspace membership, operations and human review |
| Edge | [Edge architecture](06_EDGE_ARCHITECTURE.md), [operating model](EDGE_OPERATING_MODEL.md), [Supabase functions](../supabase/functions/) | Public assessment and installed intake. Core governs interpretation, policy and routing. A human authorizes consequential actions where required. |
| Deal | [apps/deals](../apps/deals/README.md), [deployment evidence](09_DEPLOYMENT_AND_ENVIRONMENTS.md) | Negotiated commerce. External hostname and redirect policy await owner confirmation. |
| Admin | [apps/admin](../apps/admin/README.md), [control plane](18_ADMIN_CONTROL_PLANE.md) | Internal operations and catalogue decisions under platform roles |
| Shared packages | [packages](../packages/), [design system](03_DESIGN_SYSTEM.md), [technical architecture](02_TECHNICAL_ARCHITECTURE.md) | Shared configuration, types, UI and intelligence contracts |

## Infrastructure and operations

| Concern | Repository source or runbook | Evidence to confirm when changing it |
|---|---|---|
| GitHub and CI | [Workflows](../.github/workflows/), [release process](12_RELEASE_PROCESS.md) | Base and head SHA, check results, PR overlap and current merge rules |
| Vercel and domains | [Deployment inventory](09_DEPLOYMENT_AND_ENVIRONMENTS.md), [monorepo configuration](vercel-monorepo.md) | Project, commit, target, root directory, domain and runtime journey |
| Supabase and migrations | [Backend boundary](03_ONE_QUINCESTONE_BACKEND.md), [database guide](database.md), [active migrations](../supabase/migrations/), [pending migrations](../supabase/migrations_pending/) | Exact environment, applied migration history, dependencies, role grants, RLS and rollback or forward recovery |
| Payments and providers | [Provider register](11_PROVIDER_REGISTER.md), [commerce architecture](07_COMMERCE_ARCHITECTURE.md) | Provider mode, durable reconciliation, retry behavior and isolated test results |
| Operations and recovery | [Operations](10_OPERATIONS.md), [observability](11_OBSERVABILITY.md), [security](08_SECURITY.md), [release verification](17_RELEASE_VERIFICATION.md) | Owner, relevant logs and alerts, recovery procedure and last exercised date |

Use Node 22 to match the Quality workflow, the repository-pinned pnpm version, and the root lockfile. Start with `pnpm install --frozen-lockfile` and `pnpm check`. Use the owning application README for focused development. Configure development credentials through approved environment tooling and keep service credentials server-side.

Architecture documents define intended ownership. The implementation and migrations establish source behavior. Provider snapshots and tests record what was observed at a particular date, environment and commit. Report a discrepancy at the owning document and verify it before changing code or declaring a capability live.
