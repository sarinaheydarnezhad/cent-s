<!-- Snapshot links rebased from docs/refinement; historical content retained. -->
# Program status

Updated 2026-11-18. **Current phase: 0. Runtime verification delivered within safe supported scope. Phase 1 has not started and awaits explicit approval.** Local connectivity is resolved; one unchanged integration suite is still red. This is a conditional readiness assessment, not complete regression acceptance.

Frontend repository: `D:\app\itatest`. Shared backend repository: `D:\Lerona\Backend`. Itatest local preview project: `D:\Lerona\Backend\backend\Cent.Preview\Cent.Preview.csproj`. API: `http://127.0.0.1:5108`; frontend: `http://localhost:5173/cent-s`.

Permanent constraint: the backend repository is read-only for this refinement program. Itatest-specific Cent.Module/Cent.Preview, Lerona-specific modules, and shared infrastructure are distinct boundaries. Inspect backend code only as needed for existing frontend behavior. Use only Cent.Preview with verified isolated local data for safe API tests. No production database connections, backend source/configuration/schema/authentication/API-contract edits, Lerona/shared-infrastructure edits, database upgrades or migrations, unrelated services, real payments, destructive operations, deployments, commits, or pushes. Any necessary backend change requires stopping and presenting impact analysis for both Itatest and Lerona before approval. Local fixture records created through the already-running preview's supported APIs are the explicitly authorized exception for runtime data; no direct database edits or cleanup/deletions were performed.

All reports, progress updates, technical explanations, implementation plans, documentation and approval questions are permanently in English, superseding the former Persian reporting rule. The user-facing interface remains conversational, warm, professional Persian.

## Delivered and preserved

Initial audit preserved: 26-page PDF and three brand PNGs reviewed; architecture, 36 route entries, layouts, components, protections, Persian writing and build/deployment conventions inspected; 738 Persian occurrences indexed. Existing results remain 61 unit tests, passing production/TypeScript build, nine passing mock-auth scenarios, 93 scoped lint errors and an interrupted >10-minute full lint run. Initial public visual baseline remains 26 screenshots/56 width-route checks/eight guest redirects.

Current runtime: localhost smoke, courses, curriculum and personal progress pass. Safe notes, targeted recovery and asynchronously settled study-return audit variants pass. Unchanged study-return fails twice at its immediate reader-page assertion; full original notes/recovery were excluded for deletion/arbitrary-account reasons. Additional real API/UI checkpoints include recommendations, subscription/idempotency, simulator, server logout/revocation, authorization and six admin interfaces. Captured 32 unmocked audit images plus 12 supplemental suite images, with mock-injected conditions labeled separately.

## Open baseline issues and limits

R01 test synchronization; R02 exposed math subject code in recommendation presentation; legacy theme/brand/accessibility/writing issues and lint baseline. First smoke's origin mismatch was resolved for verification; transient 429 observation retained. No fixes applied. Real Google, live gateway/failure states, full expiry windows, deletions/destructive admin operations and full private accessibility/width/theme matrices remain outside verified scope. Account editing/settings are not implemented.

## Approval gate

Review [Phase 0 report](../../PHASE_0_REPORT.md), [regression results](../../REGRESSION_REPORT.md), [visual evidence](../../VISUAL_REVIEW.md) and [implementation plan](../../IMPLEMENTATION_PLAN.md). Accept or require closure of the red original suite and exclusions before authorizing Phase 1. Final vector approval remains a later asset gate. No backend change is needed or proposed. Protected fixes are separate decisions.

## Workspace and teardown

Both initial repositories had no tracked edits; frontend had only ?? docs/. Existing brand assets and audit evidence preserved. No tracked application/configuration/test/dependency files changed, and no backend files were authored. New documentation and evidence are under docs/refinement; normal ignored Vite/PDF/browser outputs were generated. No dependencies installed, no backend started/stopped, no migrations, commits, pushes or deployments. Local fixture records remain; no deletion cleanup. Final source identity, documentation-link and owned-frontend-server shutdown results are recorded in the verification addendum after execution.

## Pending phases

1 foundations/themes → 2 shared components → 3 public/auth → 4 student → 5 assessments → 6 reader/resources → 7 commerce → 8 admin → 9 final regression. Each phase requires explicit authorization; none began.

## Final verification addendum — 2026-11-18

Frontend and backend tracked and staged diffs both returned exit 0. Frontend status remains ?? docs/; backend status is clean. Documentation links and all copied evidence hashes passed validation. The owned Vite execution was stopped with Ctrl+C; its final probe failed to connect (HTTP 000). User-owned Cent.Preview remained reachable with HTTP 200 and DEVELOPMENT_MOCK status. No commit, push, deployment, source/configuration change, database upgrade or destructive cleanup occurred. [Final verification evidence](../../evidence/runtime-2026-11-18/final-verification.json). Phase 1 remains unstarted and awaits explicit approval.
