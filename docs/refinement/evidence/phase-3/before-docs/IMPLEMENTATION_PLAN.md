# Current implementation plan — Phase 2 delivered

The owner explicitly approved the refined Phase 1 logo/variants and light/dark appearance, accepted its documented technical limits, and authorized Phase 2 shared components on local main. Phase 1 is visually accepted and closed with those limitations carried forward. Phase 2 is delivered for acceptance; Phase 3 remains unauthorized.

Completed order: main/worktree/protection checkpoint → source/brand review and Phase 1 acceptance record → focused baseline and before captures → five-layer inventory/variants/color roles → buttons/surfaces/native fields/filter/badges → feedback/dialog/loading/empty/progress → representative safe consumers and mobile disclosure → local reference → theme/keyboard/contrast/reflow and regressions → actual evidence and documentation. Existing architecture and protected behavior remain.

Phase 2 intentionally stops before public-page restructuring, dashboard/assessment/reader/commerce/admin redesign, global validation/copy migration, new features and backend work. [Usage guide](COMPONENT_USAGE_GUIDE.md) records current consumers and deferred migration; [report](PHASE_2_REPORT.md) records actual verification.

Proposed Phase 3, requiring separate explicit approval: public Home/Exam/CourseCatalog/Details/DiagnosticIntro/Login/Callback/404 presentation, navigation/copy/mobile hierarchy and truthful availability; reuse these components; preserve GIS official button/protocol/session/security and all routes. Real-provider verification requires its separately configured environment; no backend or production change is implied. Do not begin Phase 3 based on this proposal.

Real Google OAuth/FedCM/signatures and production CORS remain unverified; external payments, comprehensive WCAG/assistive-technology coverage, original study-return synchronization, exposed math: recommendation codes, destructive operations, exhaustive timeout/reader/private-state coverage and existing lint debt remain. Historical backend results are prebuilt-assembly checks (Cent 108, Lerona 396, 3 skipped), not fresh source-build verification; no backend tests were rerun in Phase 2.

---

## Preserved earlier phase records

# Project-specific implementation plan

Phase 1 was explicitly authorized and is now implemented for owner review. Every later row still requires explicit approval before execution and a report/stop afterward. Phase 0 did not implement any row below. The local preview is now available and representative private runtime evidence exists. Full visual acceptance still requires each phase’s own state/theme/accessibility evidence and explicit approval; build/mock evidence alone is insufficient.

| Phase | Small reviewable scope tied to this checkout | Evidence/gate and risks |
| --- | --- | --- |
| 1 Foundations | Extend existing styles.css/cent.css semantics; one Light/Dark/System preference owner + early resolution; accessible shared appearance control; Vazirmatn reuse; product metadata/Brand/favicon; faithful vector proposal | Review SVG before final logo; all semantic colors contrast/state checks; system/reload/navigation/storage-failure tests; no auth identifiers/routes/protocol edits; screenshots public + available private shells |
| 2 Components | Extend UI.tsx/CentUI.tsx; typed buttons/fields/notices, progress semantics; shared shell/menu naming/focus; consolidate existing card/table/tab states; development-only preview using existing Vite environment | No new framework/store; rendered default/hover/pressed/focus/disabled/loading both themes; keyboard/reduced-motion; guard preview from production |
| 3 Public/auth | HomePage, ExamPage, CourseCatalog/Details, DiagnosticIntro, LoginPage, callback and 404 presentation; truthful service claims; calmer mobile hero/form; consistent navigation/copy | Preserve Google capture/proof/safe return/session; rerun 61 unit and nine auth browser scenarios; real curriculum screenshots and real Google round trip when configured; no new IMAT/SAT routes |
| 4 Student | CentDashboard, LibraryPage, NotesPage, AccountPage, PersonalResults, LearningProgress presentation | Preserve actual recent page/outcome, comparable score/evidence logic; no weekly planner/mock personalization; local progress/browser suites and both-theme private screenshots |
| 5 Assessment | CentExamPage three modes + CentResultPage; focused question layout, selected semantics, readable mixed text/timer/results | No scoring/timing/submission/state changes; reproduce E01/E02 separately for approval; local curriculum/study-return suites + keyboard/mixed-direction/time states |
| 6 Resources/reader | Course/resource navigation, StudyReader chrome/controls/notes; preserve distinct source vs canvas branches | No PDF inversion or delivery/access modifications; note/draft/revision/zoom/visibility/print behavior checks; smoke/notes/recovery/study-return suites on isolated preview |
| 7 Commerce | Catalog/checkout/result/account order presentation, known-state labels, transparent amounts/entitlements | No real transactions; paid boolean remains authoritative; distinct states only when supported; config failure copy fix; local simulated purchase suite |
| 8 Admin | Six CentAdmin screens and all aliases; same tokens, denser tables/forms/status/upload presentation | No real destructive operations; roles/validation/upload/publish/payment controls unchanged; admin fixtures only in local preview |
| 9 Final audit | Entire route/state/theme matrix, responsive seven-width checks, relevant unit/build/lint/browser suites, security boundary review, final documentation | Close or explicitly accept every baseline/new gap; meaningful accessibility review; owner final visual/function approval; no deployment |

## Recommended Phase 1 boundaries

Implementation files expected: `index.html`, `src/main.tsx`, `src/styles.css`, `src/cent.css`, `src/components/Brand.tsx`, the smallest necessary theme module/control and shared shell integration; brand assets in `public/`; focused theme tests where behavior changes. Public brand-string sweep may touch a small number of existing pages/services only for text, never protocol logic. Do not bundle component redesign, assessment fixes, content changes, routing changes, backend work or dependency upgrades into foundations.

Order within Phase 1: review candidate logo geometry → map tokens/contrast → startup/preference/control → public metadata/name assets → review representative actual page states → run required checks → report and stop. Header/account control placement is a proposal; do not create a new public settings route.

## Risks and mitigation

Global CSS affects all routes: inventory literals and migrate by semantic role, never invert all colors. Reader canvas/source content must keep independent surface policies. Existing late CSS overrides can defeat tokens: inspect computed colors and loading/error/hover states. Local base `/cent-s/` and root deployment must both remain compatible. Keep OAuth/session tests as regression gates. Use the confirmed isolated preview for private-page verification. Current baseline has a red study-return synchronization test and explicit safe exclusions; accept or close these at the approval gate. Generated PDF.js assets complicate broad lint; document baseline and propose a scoped config correction separately, without hiding authored-source failures.

## Permanent execution constraints and updated Phase 0 gate

Frontend repository: `D:\app\itatest`. Shared backend repository: `D:\Lerona\Backend`. Itatest local preview project: `D:\Lerona\Backend\backend\Cent.Preview\Cent.Preview.csproj`. API: `http://127.0.0.1:5108`; frontend: `http://localhost:5173/cent-s`.

Permanent constraint: the backend repository is read-only for this refinement program. Itatest-specific Cent.Module/Cent.Preview, Lerona-specific modules, and shared infrastructure are distinct boundaries. Inspect backend code only as needed for existing frontend behavior. Use only Cent.Preview with verified isolated local data for safe API tests. No production database connections, backend source/configuration/schema/authentication/API-contract edits, Lerona/shared-infrastructure edits, database upgrades or migrations, unrelated services, real payments, destructive operations, deployments, commits, or pushes. Any necessary backend change requires stopping and presenting impact analysis for both Itatest and Lerona before approval. Local fixture records created through the already-running preview's supported APIs are the explicitly authorized exception for runtime data; no direct database edits or cleanup/deletions were performed.

All reports, progress updates, technical explanations, implementation plans, documentation and approval questions are permanently in English, superseding the former Persian reporting rule. The user-facing interface remains conversational, warm, professional Persian.

Do not begin Phase 1 until explicit approval. Current evidence supports conditional review of foundations, not an all-tests-passing signoff. Preserve the original red study-return result and qualified audit variant; do not silently fold tracked test fixes or protected assessment/payment changes into branding. Source snapshots, runtime evidence and baseline lint are regression comparison inputs. No backend change is needed for the proposed foundations scope; any later necessity stops execution for Itatest/Lerona impact analysis. Logo vector/palette decisions and normal phase review gates remain unchanged.


## Phase 1 implementation record

Phase 1 is implemented using one early public theme owner, existing CSS with semantic aliases, a native appearance control and supplied-logo reconstruction. Detailed source/evidence: [Phase 1 report](PHASE_1_REPORT.md). Next proposed Phase 2: extend UI.tsx/CentUI.tsx with reusable button/input/card/notice/tab/table/progress states, accessible labels/errors/selection, keyboard/menu/focus behavior and a development-only state review. No new framework/backend changes. Keep page restructuring, scoring/timing, reader behavior and commerce workflows outside Phase 2. Explicit authorization remains required.
