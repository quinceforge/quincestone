# Quincestone — Release Process

## Source authority

Remote `main` in [`quinceforge/quincestone`](https://github.com/quinceforge/quincestone) is the canonical source authority. Substantive changes use focused branches and pull requests. QS-AUDIT-002 verified remote `main` on 2026-11-26 at `4597086726f3afa0facc9042affaba8d4b3ca67a`. T01 reconfirmed that ref. The source check establishes the inspected revision.

## Status and evidence

Use the [canonical architecture status definitions](00_COMPANY_ARCHITECTURE.md#status-language) and [repository instructions](../AGENTS.md).

| Status | Required evidence or meaning |
|---|---|
| **IMPLEMENTED** | Source exists in the inspected revision. Record the repository, commit and relevant paths. |
| **CONFIGURED** | Project or provider configuration was directly inspected. Record the target and observation date. |
| **DEPLOYED** | A provider reports that the artifact, schema or function exists. Record the exact version or SHA, environment and provider evidence. |
| **CONNECTED** | An authenticated provider connection was inspected. Record the integration and inspection scope. |
| **VERIFIED** | Exact deployed behavior or state was directly tested. Record the target, version, date, journey or state tested, and result. |
| **PLANNED** | Approved future architecture without complete implementation. |
| **DEFERRED** | Intentionally postponed. |
| **BLOCKED** | Missing authority, access or evidence prevents completion. |
| **SUPERSEDED** | Retained history that is no longer authoritative. |

Use `production` as the environment qualifier for **VERIFIED** runtime evidence. Historical uses of “Live” retain their recorded meaning and provenance. Stripe live mode describes an account mode. Repository source verification, local checks, provider configuration, authenticated connections, artifacts and runtime tests each establish only their observed scope. The audited SHA has no production deployment or production runtime verification recorded here. See [deployment evidence](09_DEPLOYMENT_AND_ENVIRONMENTS.md) and the [provider register](11_PROVIDER_REGISTER.md).

## Accountable roles

| Area | Accountable role |
|---|---|
| Architecture and repository source authority | Architecture owner |
| Release evidence and exact-SHA runtime records | Release owner |
| Provider configuration and connection evidence | Provider owner |
| Account entry point and customer ownership | Identity owner |
| Branch protection and required CI checks | Repository administrator |

Individual reviewer assignments are pending confirmation by the human owner. Architecture and release reviewers must approve the governance changes and disposition of historical references before merge.

## Open decisions

| Decision | Separate approval and evidence required |
|---|---|
| Canonical Account entry point | Identity owner approval of the operational entry point after reviewing the architecture and observed cross-product paths. |
| Account and Business OS customer ownership | Identity and architecture owner approval of personal and workspace customer responsibilities, including authorization and compatibility boundaries. |
| Main branch protection | Repository administrator approval after inspecting current protection and agreeing the intended policy. |
| Required CI checks | Repository administrator and release owner approval of the checks to enforce after confirming their current names and behavior. |
| Current Vercel deployment evidence | Release owner approval to reconcile project, environment, commit, deployment status and domain evidence. |
| Provider configuration and runtime verification | Provider and release owner approval of the inspection scope, environment and exact journeys to verify. |

Each decision remains open. Approval of these documentation changes does not approve a routing, repository setting, provider or deployment change.

## Required gate

For a production-facing change:

- inspect the diff;
- run the repository quality gate;
- verify database/security changes when applicable;
- obtain a successful Vercel deployment for the exact release commit when applicable;
- verify the preview/runtime behavior;
- merge the PR;
- verify the resulting `main` deployment;
- verify the production domain separately.

A previous successful deployment of an earlier commit does not verify a later commit.

## Engineering sequence

`INSPECT REALITY → DEFINE AUTHORITY → MODEL STATE → IMPLEMENT VERTICALLY → VERIFY EVIDENCE → DOCUMENT TRUTH → RELEASE SAFELY → LEARN FROM OUTCOMES`

Before implementation, identify the canonical owner, entities, state transitions, failure/retry/idempotency behavior and Human Review boundary. A feature is complete only when its experience, server authorization/validation, persistence, events, operational surface, authorized provider action, outcome, trace and verification are complete where applicable.

Failure is a first-class state: validation, authentication, authorization, network, timeout, server, persistence, duplicates, provider rejection, webhook replay, partial completion, retry, recovery, evidence and terminal failure must be intentional. Preserve valuable completed user input when a final request fails.

## Safety

Never bypass a failed deployment check by claiming source existence is deployment success. Never create synthetic production records to prove a workflow. Never perform live financial or irreversible external actions during verification unless explicitly authorized.
