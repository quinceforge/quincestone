# Quincestone delivery direction

## Order of work

The repository guide and review process give each change a starting point. The source audit at `4597086726f3afa0facc9042affaba8d4b3ca67a` provides the baseline below. Recheck PR state and source before beginning a change.

| Order | Workstream | Evidence required to advance |
|---|---|---|
| 1 | Admin-to-Shop publishing and five departments | Review [#145](https://github.com/quinceforge/quincestone/pull/145). Reconcile active and pending schema, then verify draft, edit, price, private preview, authorization, publish, audit and public visibility for one test product on an isolated database. Verify every canonical department and legacy mapping. |
| 2 | Payment and transaction integrity | Review [#142](https://github.com/quinceforge/quincestone/pull/142) and [#144](https://github.com/quinceforge/quincestone/pull/144) together. Verify idempotency, delayed and duplicate events, refunds, persistence failures and retry behavior in isolation. |
| 3 | Public and authenticated journeys | Verify Corporate routing, Edge assessment and Human Review, Account, Business OS and Deal on exact previews. Record the unresolved Deal hostname and use verified capabilities in customer-facing copy. Keep the Shop experiment isolated until its original work can be inspected. |
| 4 | Operational and release readiness | Reconcile [#143](https://github.com/quinceforge/quincestone/pull/143) against merged [#148](https://github.com/quinceforge/quincestone/pull/148). Record exact deployment evidence, monitoring, recovery and ownership for affected systems. Obtain separate approval before production actions. |

Keep this order for dependent changes. Independent fixes and evidence gathering can proceed when their own prerequisites are satisfied. Changes that publish real products, affect live payments, or deploy production require their own approval.

## Direction for every build

1. **Inspect.** Read `AGENTS.md`, the repository guide and the owning source. Verify the base SHA and look for overlapping PRs, migrations or experiments.
2. **Define.** State the user journey, owning surface, data and authorization authority, prerequisites and acceptance evidence. For stateful changes, identify transitions, failure handling, audit and recovery.
3. **Implement.** Use an isolated branch and ship one complete, reviewable workflow through its normal entry point.
4. **Verify.** Run `pnpm check` and the checks that exercise the changed behavior. Record local, mock, isolated database, browser and provider evidence separately, including blockers.
5. **Document and review.** Update the owning documentation and submit the PR with its evidence, dependency order and release impact.
6. **Release with approval.** Verify the exact preview and follow the [release process](12_RELEASE_PROCESS.md). Verify provider state and production journeys separately after an authorized release.

The PR checklist records the review evidence. GitHub rulesets govern enforcement of required checks and reviews. The [deployment inventory](09_DEPLOYMENT_AND_ENVIRONMENTS.md) records the most recent branch protection observation.
