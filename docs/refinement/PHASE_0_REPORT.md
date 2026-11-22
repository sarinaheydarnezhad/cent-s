# Phase 0 — Updated runtime baseline report

Updated 2026-11-18. **Phase 0 runtime verification completed to the safe supported extent, with one unchanged integration suite failing and explicit coverage limits. At this historical report’s issuance, Phase 1 had not started. The owner subsequently conditionally accepted Phase 0 and authorized Phase 1; see the separate post-GIS checkpoint and Phase 1 report below.** This report supersedes the initial backend-unavailable status while preserving its results.

## 1. Backend connectivity

Frontend repository: `D:\app\itatest`. Shared backend repository: `D:\Lerona\Backend`. Itatest local preview project: `D:\Lerona\Backend\backend\Cent.Preview\Cent.Preview.csproj`. API: `http://127.0.0.1:5108`; frontend: `http://localhost:5173/cent-s`.

Permanent constraint: the backend repository is read-only for this refinement program. Itatest-specific Cent.Module/Cent.Preview, Lerona-specific modules, and shared infrastructure are distinct boundaries. Inspect backend code only as needed for existing frontend behavior. Use only Cent.Preview with verified isolated local data for safe API tests. No production database connections, backend source/configuration/schema/authentication/API-contract edits, Lerona/shared-infrastructure edits, database upgrades or migrations, unrelated services, real payments, destructive operations, deployments, commits, or pushes. Any necessary backend change requires stopping and presenting impact analysis for both Itatest and Lerona before approval. Local fixture records created through the already-running preview's supported APIs are the explicitly authorized exception for runtime data; no direct database edits or cleanup/deletions were performed.

All reports, progress updates, technical explanations, implementation plans, documentation and approval questions are permanently in English, superseding the former Persian reporting rule. The user-facing interface remains conversational, warm, professional Persian.

The user-started backend answered HTTP 200 at /api/cent/v1/status and /openapi/v1.json; the root / returned 404, as expected for an API application. Status: service Cent, payments DEVELOPMENT_MOCK, screenshotBlocking false. OpenAPI title: Cent Local Preview API. Port 5108 listens only on 127.0.0.1; process 13016 is the expected backend/Cent.Preview/bin/Debug/net10.0/Cent.Preview.exe with no command-line overrides. Read-only source inspection established Development-only startup, explicit replacement of CentDbContext with SQLite at backend/Cent.Preview/App_Data/preview.db, and early mock-payment branches without external gateway calls. The local database already contained curriculum (5 courses, 39 source documents, 190 topics). No import, startup, upgrade or migration was run by this audit. Initial sandbox process inspection was denied; approved read-only inspection confirmed identity before fixture writes.

## 2. Integration test results

| Check | Actual result | Qualification |
| --- | --- | --- |
| Existing smoke, first attempt | FAIL, exit 1 | Frontend override used 127.0.0.1; mock payment returned to localhost and lost origin-specific session storage. Real order created locally. Environment/harness mismatch; retained log. |
| Existing smoke, default localhost origin | PASS, exit 0 | Administrator login, PDF upload/render/publish, student registration, mock training purchase, library, protected canvas, watermarks, notes on pages 1/2, reload, profile, 390px fit. Session recovery deliberately injects two 503 responses. |
| Existing test:courses | PASS, exit 0 | Five courses/39 source documents, home/store/course outlines, public access, mobile. Error and omitted-documents branches use intercepted responses. |
| Existing test:curriculum | PASS, exit 0 | Nine targeted algebra questions, hidden answer keys, server submission, 100% topic mastery, source reading, persisted note, mobile. |
| Existing test:progress | PASS, exit 0 | Real 0%/100% practice results, 50% recent accuracy, +100 comparable change, mastery without evidence inflation, filters, second-learner isolation. |
| Existing test:study-return | FAIL twice, exit 1 | At line 40, immediate select value was 1 rather than 3 after navigation. Original test remains unchanged and failed. |
| Audit-only study-return-settled | PASS, exit 0 | Same assertions with a wait for reader page 3; complete cancel/login/test reload/result reload/exact-page return/draft restoration/safe fallback. Supports test synchronization diagnosis; not an original-suite pass. |
| Audit-only safe-notes | PASS, exit 0 | First three creations, edit/create, injected 503 and same-ID retry, five distinct notes after reload. Original deletion segment omitted; full test:notes not run. |
| Audit-only targeted-recovery | PASS, exit 0 | Same two injected 503s, actual smoke learner selected via this run's training/order IDs, page 2 and persisted note restored. Original arbitrary-user recovery script not run. |
| Additional API/UI runtime audit | PASS after audit-helper corrections | 61 recorded checkpoints (includes repeated setup), 32 screenshots, no final assertion failures or uncaught page errors. No response mocking in these captures. Helpers initially confused two sessions and parsed an empty 401 as JSON; raw failure log and corrected execution retained. |

Raw logs, original-result JSON, audit-only variants, screenshots and hashes: [evidence manifest](evidence/runtime-2026-11-18/manifest.json), [runtime checkpoint report](evidence/runtime-2026-11-18/extended-runtime.json), [regression report](REGRESSION_REPORT.md). Stored checkpoints are not a count of independent tests.

Preserved initial baseline: **61 unit tests passed; production build including TypeScript passed; 9 isolated mock-authentication browser scenarios passed; scoped lint had 93 errors and zero warnings; full lint was stopped after exceeding 10 minutes; initial integration execution was blocked by ECONNREFUSED at 127.0.0.1:5108.** These checks were not rerun merely to repeat an unchanged-source result. The current backend-connected checks above replace the old connectivity blocker, not the original historical outcomes.

## 3. Verified functional flows

| Functionality | Backend-connected verification |
| --- | --- |
| Authentication/session | Real preview admin/student password login, student registration, reload restoration, guest/invalid token denial, explicit server logout (204), revoked token denial (401), browser redirect to login. Injected transient recovery is separately labeled. No real Google exchange. |
| Student dashboard | Empty and populated dashboards with actual library count, persisted note count, last study page, latest zero-score result and recommendation. |
| Assessment/practice | Targeted diagnostic and practice attempts, answers absent from initial payload, real 0%/100% scores, result review, reload, history/filter/account isolation. Subscribed simulator started and submitted through UI; unsubscribed learner denied 403. |
| Submission/results/recommendations | Server-generated result and stored rule-based weak-topic analysis; repeated submission returns stored result. Recommendations are fixed educational rules, not external AI. |
| Educational resources/PDF | Unentitled/guest access denied 403/401, entitled PDF canvas and user watermark displayed, imported source-text reader displayed, exact lesson/page restoration verified after asynchronous loading. |
| Notes/persistence | Create multiple notes, edit own new note, same-ID retry after injected failure, five distinct server-persisted notes after reload, notes listing and page-local draft restoration. Peer write to an unentitled PDF rejected 403. No deletion. |
| Account/settings | Actual identity, paid order history, active subscription and validity display. There is no implemented editable account-settings flow. |
| Products/subscriptions/orders | Real backend catalog, isolated training and subscription products, development MOCK orders, PAID history, active entitlement/library, duplicate checkout request returns same order ID, repeat verification, missing/unknown-order error UI and other-learner order denial 404. No real money or gateway. |
| Administration/authorization | Actual overview, users, content/PDF, products, orders and questions pages loaded for the seeded local admin; smoke creates/publishes a new training PDF. Student access to five admin API families denied 403, guests denied 401; student admin UI redirects to dashboard. Overview incomeRial was 0 despite paid mock orders. No role escalation or destructive edit. |

## 4. Unverified functional flows

Real Google OAuth consent/code exchange, seven-day server session expiration, external payment gateway/callback/failure/cancellation/pending states, expired/revoked subscription transitions, note deletion, destructive admin operations, resumed/interrupted upload, all validation and concurrent note-conflict combinations, a full 60-minute assessment timeout, print/visibility protection, complete private route/width/accessibility matrices, admin compatibility aliases, all dark-mode states and assistive-technology acceptance remain unverified. These were not simulated into successful backend evidence. Account profile/order/subscription display exists; account name/email/password editing, password recovery and a separate settings route are not implemented, so no settings-save behavior is claimed. No recurring bank debit exists. Full global lint remains incomplete.

Static architecture/route findings and earlier mock tests remain useful but do not establish unverified runtime behavior. See [coverage ledger](AUDIT_COVERAGE.md).

## 5. Newly discovered baseline defects and classifications

| ID / classification | Evidence and consequence |
| --- | --- |
| R01 — existing integration-test synchronization defect | Unchanged study-return test failed twice at tests/browser/check-study-return.mjs:40 with 1 !== 3. Waiting for the asynchronously loaded reader page passes the rest of the same journey. No demonstrated failure to retain the settled reader page; original suite is still red. Fixing the tracked test is outside this documentation-only task. |
| R02 — newly observed runtime presentation defect | Zero-score recommendations expose internal subject prefix `math:` in learner-facing topic chips, recommendation text and topic breakdown. Visible in [result](evidence/runtime-2026-11-18/runtime-diagnostic-result-390.png) and [dashboard](evidence/runtime-2026-11-18/runtime-dashboard-populated-390.png). Functional rule-based recommendation verified; localized presentation deferred. No scoring/API edit authorized. |
| E01 — environment mismatch, resolved for verification | 127.0.0.1 web origin differs from Cent.Preview's localhost mock return origin. First smoke failed; default-origin rerun passed. Use localhost for frontend tests without changing tracked configuration. |
| E02 — runtime admission limit observation | First smoke logged a real /me HTTP 429; Cent's existing admission limiter allows four concurrent requests. It recovered during the flow; not reproduced as a persistent application failure in the corrected run. Limits were not altered or bypassed. |
| H01 — audit helper issues, corrected | Additional capture initially revoked the registration token while its browser used a separate password-login token, then a continuation tried parsing an empty 401 body as JSON. No security defect: each revocation returned 204 and the corresponding session returned 401. Continuation explicitly revoked its browser token and verified redirect to login. Raw logs retained; these are not application regressions. |

Existing initial findings remain: legacy Cent branding, absent theme system, hardcoded colors/gradients, mobile menu accessibility issues, supporting-color contrast failures, inconsistent Persian wording, and source-observed assessment answer-progress/expiry risks. None was repaired. No application-source regression was introduced because no application source was changed; this is not proof of a defect-free baseline.

## 6. Visual evidence

32 new unmocked backend-connected audit captures, 12 supplemental suite captures (two follow deliberately injected 503 conditions), and one retained failed-origin screenshot. These are local test records, not production learners. The prior 26 public screenshots and 56 viewport checks remain intact as the historical backend-unavailable baseline; the nine auth scenarios remain mock-backed.

Examples: [populated dashboard](evidence/runtime-2026-11-18/runtime-dashboard-populated-390.png), [diagnostic result/recommendations](evidence/runtime-2026-11-18/runtime-diagnostic-result-390.png), [protected PDF](evidence/runtime-2026-11-18/runtime-reader-pdf-1440.png), [persisted note](evidence/runtime-2026-11-18/runtime-reader-note-390.png), [subscription/profile](evidence/runtime-2026-11-18/runtime-profile-subscription-1440.png), [admin overview](evidence/runtime-2026-11-18/runtime-admin-overview-1440.png), [admin orders mobile](evidence/runtime-2026-11-18/runtime-admin-orders-390.png). Full index and interpretation: [visual review](VISUAL_REVIEW.md).

No document-level horizontal overflow was recorded in the sampled new captures where measured. The mobile admin table shows a subset of columns at its initial internal scroll position; this does not prove every cell is accessible. No complete private responsive, keyboard, contrast or WCAG acceptance is claimed. No dark screenshots were manufactured.

## 7. Security and shared backend protection

Only Cent.Module and Cent.Preview code needed to verify these flows was inspected. Backend source/configuration/migrations, Lerona modules and shared infrastructure were not changed. No production endpoints/databases, external payment gateways or Google consent flows were used. The additional browser audit blocked non-loopback HTTP requests; none was requested. Test credentials came from the existing preview seed and freshly registered test accounts. No sessions/tokens are stored in the report artifacts. API access controls were exercised normally, without bypasses or server-limit changes. Local fixture records remain in preview.db; no destructive cleanup was attempted. The user-owned backend stays running.

## 8. Remaining blockers

The original study-return suite is red until its loading synchronization is separately authorized for repair. Global lint still lacks a completed result, and its scoped 93-error baseline remains. The safe exclusions above prevent full business-flow/security/accessibility signoff. Preview connectivity and imported curriculum are no longer blockers. No missing backend change is required for Phase 1 foundations.

## 9. Decisions requiring approval

Explicit approval is required before Phase 1, including acceptance or required closure of R01 and the documented safe exclusions. The tracked study-return test correction and any protected assessment/payment change are separate work, outside this audit. The exact logo vector and dark/supporting palette still require their planned visual review. Backend changes, if ever required, need impact analysis for both applications first; none is proposed now.

## 10. Phase 1 readiness and stop

**Conditionally ready for owner review of the limited foundations phase; not a clean all-tests-passing signoff and not approval to start.** The principal environment blocker is resolved and representative private flows now have real local evidence. Review the red original suite, legacy lint baseline and exclusions before deciding. The existing Phase 1 scope remains brand/vector proposal, semantic tokens, Light/Dark/System preference and minimal metadata/shell work, preserving protected behavior. No Phase 1 implementation, commit, push or deployment was performed. Work stops after this report and awaits explicit Phase 1 approval.

The initial audit's 26-page brand review, three supplied PNGs, 36-route ledger, component inventory, 738 indexed Persian source occurrences and design findings remain linked from [program brief](PROGRAM_BRIEF.md), [architecture audit](ARCHITECTURE_AUDIT.md), [component inventory](COMPONENT_INVENTORY.md) and [findings](FINDINGS.md).

Final boundary check: frontend/backend tracked and staged diffs are empty; the owned frontend server was stopped, while the user-owned preview remained running. Documentation local links and copied evidence hashes passed validation. See [final verification evidence](evidence/runtime-2026-11-18/final-verification.json).


## Phase 1 implementation record

Phase 0 is now conditionally accepted by the owner. [Post-GIS checkpoint](POST_GIS_CHECKPOINT.md) records the separate c8df574/87525a7 baseline, current-source preview correction,114 unit tests,16+9 mocked auth scenarios, scoped/global lint counts and pre-existing backend binary checks. Phase 1 outcomes are recorded separately in [Phase 1 report](PHASE_1_REPORT.md); historical Phase 0 evidence and known failures are preserved.
