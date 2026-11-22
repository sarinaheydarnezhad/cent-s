# Baseline verification and regression report

Current Phase 1 results are in the implementation record below and PHASE_1_REPORT.md. The following original sections preserve the historical Phase 0 baseline, when no frontend source/test/configuration edits had been made. Backend source remains unchanged. This report distinguishes original failures, post-GIS results, new-code checks and safe exclusions.

Frontend repository: `D:\app\itatest`. Shared backend repository: `D:\Lerona\Backend`. Itatest local preview project: `D:\Lerona\Backend\backend\Cent.Preview\Cent.Preview.csproj`. API: `http://127.0.0.1:5108`; frontend: `http://localhost:5173/cent-s`.

Permanent constraint: the backend repository is read-only for this refinement program. Itatest-specific Cent.Module/Cent.Preview, Lerona-specific modules, and shared infrastructure are distinct boundaries. Inspect backend code only as needed for existing frontend behavior. Use only Cent.Preview with verified isolated local data for safe API tests. No production database connections, backend source/configuration/schema/authentication/API-contract edits, Lerona/shared-infrastructure edits, database upgrades or migrations, unrelated services, real payments, destructive operations, deployments, commits, or pushes. Any necessary backend change requires stopping and presenting impact analysis for both Itatest and Lerona before approval. Local fixture records created through the already-running preview's supported APIs are the explicitly authorized exception for runtime data; no direct database edits or cleanup/deletions were performed.

All reports, progress updates, technical explanations, implementation plans, documentation and approval questions are permanently in English, superseding the former Persian reporting rule. The user-facing interface remains conversational, warm, professional Persian.

## Preserved initial baseline

| Check | Preserved result |
| --- | --- |
| npm.cmd test | PASS; 61 tests in 3 files (Google auth/session/legacy scoring), not rerun |
| npm.cmd run build | PASS; includes TypeScript tsc -b, production build/postbuild, not rerun |
| npm.cmd --prefix tests/browser run test:google-auth | PASS; 9 isolated synthetic scenarios, not rerun; [result](evidence/google-auth-result.json) |
| npm.cmd run lint | INCOMPLETE; stopped after >10 minutes; not rerun or called successful |
| Authored-scope ESLint | FAIL; 93 errors, zero warnings; [diagnostic](evidence/eslint-authored.json) |
| Initial smoke and courses | BLOCKED by ECONNREFUSED 127.0.0.1:5108 before fixtures; retained historical result, now rerun below |
| Initial public/browser baseline | 56 cases, 26 images, 8 guest redirects; no uncaught page errors or document overflow in that matrix |
| Initial brand/source/audit helpers | All 26 PDF pages extracted/rendered, inventories created; helper lint passed; initial corrected helper attempts documented previously |

Lint distribution retained: 9 src errors (CentUI effect 1, DashboardLayout unused imports 3, PracticePages effect 1, StudyReader effects 4), 7 scripts globals and 77 browser-test globals. Likely generated public/pdfjs scope contributed to full-lint slowness, but causality was not proved. No rules weakened or remediation attempted.

## Current runtime commands and outcomes

Existing npm browser scripts were executed unchanged except the specifically identified audit-only copies. Local environment overrides set CENT_TEST_API_URL to http://127.0.0.1:5108/api/cent/v1; corrected CENT_TEST_WEB_URL is http://localhost:5173/cent-s. Vite used process-only CENT_BACKEND_URL/VITE_CENT_API_URL/VITE_BASE_PATH values. No tracked configuration was edited. No dependencies installed.

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

[First-run suite exit/timestamps](evidence/runtime-2026-11-18/suite-results.jsonl), [corrected smoke log](evidence/runtime-2026-11-18/smoke-default-origin.log), [original study-return rerun](evidence/runtime-2026-11-18/study-return-original-rerun.log), [audit variant generation](evidence/runtime-2026-11-18/prepare-variants.mjs), [settled study result](evidence/runtime-2026-11-18/phase0-study-return-settled-result.json), [safe notes result](evidence/runtime-2026-11-18/phase0-safe-notes-result.json), [targeted recovery result](evidence/runtime-2026-11-18/phase0-targeted-recovery-result.json), [checkpoint report](evidence/runtime-2026-11-18/extended-runtime.json).

The original test:notes suite was not run because it deletes a note. Its safe variant omits that segment while preserving create/edit/retry/reload assertions. Original test:recovery was not run because it selects the first existing student, with assumptions about password/page-two notes. Its variant selects only this run's smoke learner via training/order ownership. The original study-return suite is not reported as passing because a diagnostic passes. No assertions or security controls were weakened in tracked tests.

## Baseline defects, environment and helper classification

| ID / classification | Evidence and consequence |
| --- | --- |
| R01 — existing integration-test synchronization defect | Unchanged study-return test failed twice at tests/browser/check-study-return.mjs:40 with 1 !== 3. Waiting for the asynchronously loaded reader page passes the rest of the same journey. No demonstrated failure to retain the settled reader page; original suite is still red. Fixing the tracked test is outside this documentation-only task. |
| R02 — newly observed runtime presentation defect | Zero-score recommendations expose internal subject prefix `math:` in learner-facing topic chips, recommendation text and topic breakdown. Visible in [result](evidence/runtime-2026-11-18/runtime-diagnostic-result-390.png) and [dashboard](evidence/runtime-2026-11-18/runtime-dashboard-populated-390.png). Functional rule-based recommendation verified; localized presentation deferred. No scoring/API edit authorized. |
| E01 — environment mismatch, resolved for verification | 127.0.0.1 web origin differs from Cent.Preview's localhost mock return origin. First smoke failed; default-origin rerun passed. Use localhost for frontend tests without changing tracked configuration. |
| E02 — runtime admission limit observation | First smoke logged a real /me HTTP 429; Cent's existing admission limiter allows four concurrent requests. It recovered during the flow; not reproduced as a persistent application failure in the corrected run. Limits were not altered or bypassed. |
| H01 — audit helper issues, corrected | Additional capture initially revoked the registration token while its browser used a separate password-login token, then a continuation tried parsing an empty 401 body as JSON. No security defect: each revocation returned 204 and the corresponding session returned 401. Continuation explicitly revoked its browser token and verified redirect to login. Raw logs retained; these are not application regressions. |

## Runtime security and coverage limits

Verified 401/403/404 denials for guests/invalid or revoked tokens, student admin APIs, unentitled PDF metadata/page, other learner order/result and unentitled peer note write. Actual server logout and browser redirect verified; 7-day expiry not time-traveled. Test fixture subscriptions and orders use MOCK provider exclusively; idempotent checkout and PAID history verified. No external provider or production connection. No migrations, backend config changes or raw DB edits. Local records retained without cleanup.

Real Google OAuth consent/code exchange, seven-day server session expiration, external payment gateway/callback/failure/cancellation/pending states, expired/revoked subscription transitions, note deletion, destructive admin operations, resumed/interrupted upload, all validation and concurrent note-conflict combinations, a full 60-minute assessment timeout, print/visibility protection, complete private route/width/accessibility matrices, admin compatibility aliases, all dark-mode states and assistive-technology acceptance remain unverified. These were not simulated into successful backend evidence. Account profile/order/subscription display exists; account name/email/password editing, password recovery and a separate settings route are not implemented, so no settings-save behavior is claimed. No recurring bank debit exists. Full global lint remains incomplete.

No newly introduced application regression is identified; application source did not change. This does not establish a clean baseline. Initial brand/theme/accessibility defects and protected assessment hypotheses remain. All new source/doc identity/link checks and teardown are added to PROGRAM_STATUS after execution.


## Phase 1 implementation record

| Check | Original Phase 0 | Post-GIS checkpoint | Phase 1 |
| --- | --- | --- | --- |
| Frontend unit |61 pass|114 pass|124 pass (10 new appearance checks)|
| Build / TypeScript |Pass|Pass|Pass, including root build; final logs linked from report|
| Auth browser |9 mock code scenarios|16 GIS +9 retained scenarios|16+9 in each development theme; root-path results separately recorded|
| Authored lint |93 errors|93 errors|93 existing errors; new code separately clean|
| Global lint |Interrupted|154 existing errors including prior evidence helpers|Completed; baseline helpers remain, no rules suppressed|
| Backend regression |Earlier runtime local checks|Existing binaries Cent108; Lerona396 pass/3 skip|Source/config unchanged; binary limitation retained|
| Backend-connected |Historical smoke/courses/curriculum/progress and qualified notes/recovery|Current-source courses/curriculum/progress pass; stale-host/overlap smoke failures retained|Semantic selector smoke passes; final courses/curriculum/progress logs retained|

New issues found during implementation were resolved: doubled base path in asset URLs; test-only Node module typing; selected letter foreground in dark; sidebar contrast; smoke positional selector; appearance test ambiguity after PNG favicon addition. None was hidden by disabling assertions/rules. Earlier failure logs remain evidence, not current passes. Original study-return test remains unchanged/deferred. Real Google, external financial states, exhaustive timeouts/deletions/full accessibility are unverified. Font addition incurs one local ~344KiB Latin variable asset; CSS grows from81.80KB post-GIS to roughly101KB, application JS from127.77KB to roughly129KB; exact final sizes in build log. No Web Vitals/Lighthouse claim.

The first stale preview and overlapping tests produced 404/429 console assertions. After current-source preview and sequential execution, smoke passes; its training selector was made semantic because Phase 1 adds a select in the header. Native select labels include option text, so prefix matching is intentional. No business logic change was made to obtain this pass. Work is authorized directly on frontend `main`. No redesign branch, commit, push, deployment, production access, database migration or shared-backend source/configuration change. Preserve GIS commits frontend `c8df574` / backend `87525a7`. Backend source is read-only; compiled output is confined to ignored frontend `.preview-artifacts/`. Tests use isolated SQLite and development mock payments only. Local fixture data is not production data.
