# Current coverage additions — Phase 2

No Phase 0 re-audit. Focused pre-edit checkpoint: local main/clean initial worktree, 124 unit tests, production build, 9 appearance groups, 25 mock-auth scenarios, 9 src lint errors, read-only backend clean/isolation verified, source inventory and 12 actual pre-change public captures.

After implementation: 8 component browser groups and 48 computed rendered contrast pairs in both themes; 14 reference observations across320/375/390/768/1024/1280/1440; 32 actual consumer observations at390/1440. Components: action variants/sizes/busy/disabled/hover/pressed/focus, cards, fields/default/invalid/readonly/disabled/LTR, filters/badges/native radios, feedback/retry/status, dialog initial/boundary/restore/Escape/guarded dismissal, learning/progress, loading/skeleton/distinct empties, reduced motion and 200%text sample. Consumer checks include real public/student mobile disclosure/focus and real course retry after injected503.

Actual pages: login/catalog/course plus dashboard/learning/results/recommendation/admin. Before/after matches login/catalog/course at390/1440/light/dark. Reference values are illustrative; one actual course failure state is deliberately injected. Actual login discovery disables Google locally; mock provider tests are separate. Final tests: 144 unit; 75 mocked-auth executions across dev light/dark/root; 9 appearance groups each development/root; connected courses/curriculum/progress/smoke plus qualified notes/targeted recovery.

Real Google OAuth/FedCM/signatures and production CORS remain unverified; external payments, comprehensive WCAG/assistive-technology coverage, original study-return synchronization, exposed math: recommendation codes, destructive operations, exhaustive timeout/reader/private-state coverage and existing lint debt remain. Historical backend results are prebuilt-assembly checks (Cent 108, Lerona 396, 3 skipped), not fresh source-build verification; no backend tests were rerun in Phase 2.

Native confirmation/deletion, every private route/width/validation/selected-answer state, real assistive technology and all browser engines were not covered anew. Existing36-route ledger remains below; these focused additions do not mark every route complete.

---

## Preserved earlier phase records

# Audit coverage ledger

Updated 2026-11-18. S = static source inspection; R = actual rendered browser page; I = isolated Cent.Preview integration; M = intercepted/synthetic response; U = unverified. R alone does not imply a successful backend flow. Previous backend-unavailable findings remain historical in the initial evidence. No label grants visual/WCAG acceptance.

Frontend repository: `D:\app\itatest`. Shared backend repository: `D:\Lerona\Backend`. Itatest local preview project: `D:\Lerona\Backend\backend\Cent.Preview\Cent.Preview.csproj`. API: `http://127.0.0.1:5108`; frontend: `http://localhost:5173/cent-s`.

Permanent constraint: the backend repository is read-only for this refinement program. Itatest-specific Cent.Module/Cent.Preview, Lerona-specific modules, and shared infrastructure are distinct boundaries. Inspect backend code only as needed for existing frontend behavior. Use only Cent.Preview with verified isolated local data for safe API tests. No production database connections, backend source/configuration/schema/authentication/API-contract edits, Lerona/shared-infrastructure edits, database upgrades or migrations, unrelated services, real payments, destructive operations, deployments, commits, or pushes. Any necessary backend change requires stopping and presenting impact analysis for both Itatest and Lerona before approval. Local fixture records created through the already-running preview's supported APIs are the explicitly authorized exception for runtime data; no direct database edits or cleanup/deletions were performed.

All reports, progress updates, technical explanations, implementation plans, documentation and approval questions are permanently in English, superseding the former Persian reporting rule. The user-facing interface remains conversational, warm, professional Persian.

## Complete route inventory

36 route entries, 34 concrete patterns and two wildcard fallbacks. Paths are relative to /cent-s/ locally. No separate registration/recovery/settings/order-detail route exists. Alias components do not establish alias navigation runtime coverage.

| # | Route | Screen / behavior | Access | Current coverage |
| --- | --- | --- | --- | --- |
| 1 | / | HomePage | Public | S,R,I; real home/curriculum |
| 2 | /exam | ExamPage → CourseCatalog | Public | S,R,I; five real course cards |
| 3 | /courses/:code | CourseDetails | Public metadata; study links depend on entitlement | S,R,I; all five outlines |
| 4 | /diagnostic/intro | DiagnosticIntroPage + JourneyNav | Public | S,R initial public render |
| 5 | /diagnostic/results | Redirect /student/results | Student destination | S,R initial guest redirect only |
| 6 | /package | CatalogPage + CourseCatalog | Public | S,R,I; actual catalog/products and injected failure branches |
| 7 | /checkout | CentCheckoutPage; ?product= | Internal login guard | S,R,I; missing-product/training checkout, mock purchase |
| 8 | /checkout/success | CentCheckoutResult; ?order= | Internal login guard | S,R,I; paid, missing/unknown order; pending/failure gateway U |
| 9 | /login | LoginPage; register tab on same URL | Public | S,R,I,M; real password/admin/student/register; Google M only |
| 10 | /auth/google/callback | GoogleCallbackPage, pre-mount capture | Standalone callback | S,R,M; actual Google round trip U |
| 11 | /diagnostic/test | CentExamPage diagnostic; ?course=&topic=&returnTo= | Internal login guard | S,R,I; targeted diagnostic, submit/result |
| 12 | /student | CentDashboard | STUDENT | S,R,I; empty/populated dashboard |
| 13 | /student/preparation | LibraryPage alias | STUDENT | S; alias component covered at /student/content; alias navigation U |
| 14 | /student/results | CentResultsPage → PersonalResults | STUDENT | S,R,I; empty/populated/filter/account isolation |
| 15 | /student/results/:id | CentResultPage; optional safe ?returnTo= | STUDENT | S,R,I; diagnostic/practice/simulator result and recommendations |
| 16 | /student/analysis | LearningProgress | STUDENT | S,R,I; actual topic mastery |
| 17 | /student/practice | CentExamPage practice; course/topic/returnTo | STUDENT | S,R,I; targeted practice and study return after load |
| 18 | /student/content | LibraryPage | STUDENT | S,R,I; empty, training and subscription library |
| 19 | /student/notes | NotesPage | STUDENT | S,R,I; empty and server-persisted notes |
| 20 | /student/simulators | CentSimulatorsPage | STUDENT; subscription controls CTA | S; listing CTA runtime U; simulator tested directly |
| 21 | /student/simulators/test | CentExamPage simulator | STUDENT; backend subscription check required | S,R,I; subscribed start/submit, unsubscribed API 403 |
| 22 | /student/simulators/result | Redirect /student/results | STUDENT | S,R initial guest redirect; authorized alias U |
| 23 | /student/profile | AccountPage, orders/subscription | STUDENT | S,R,I,M; profile/orders/subscription; editing not implemented |
| 24 | /student/study/:id | StudyReader; ?page=&note= | STUDENT + server resource access | S,R,I; PDF/source text, notes/reload/page restore; deletion U |
| 25 | /admin | CentAdminDashboard | ADMIN | S,R,I; actual overview; student redirect/403, guest401 |
| 26 | /admin/users | CentUsersAdmin | ADMIN | S,R,I; actual users list; role mutation U |
| 27 | /admin/content | CentContentAdmin | ADMIN | S,R,I; actual list, new fixture upload/publish; delete/resume U |
| 28 | /admin/subjects | CentContentAdmin alias | ADMIN | S; alias component covered at content; alias navigation U |
| 29 | /admin/packages | CentProductsAdmin | ADMIN | S,R,I; product list and dedicated fixture product creation |
| 30 | /admin/orders | CentOrdersAdmin | ADMIN | S,R,I; actual local paid mock orders, mobile |
| 31 | /admin/finance | CentOrdersAdmin alias | ADMIN | S; alias component covered at orders; alias navigation U |
| 32 | /admin/questions | CentQuestionsAdmin | ADMIN | S,R,I; real question bank/list; question edits U |
| 33 | /admin/diagnostics | CentQuestionsAdmin alias | ADMIN | S; question alias navigation U |
| 34 | /admin/simulators | CentQuestionsAdmin alias | ADMIN | S; question alias navigation U |
| 35 | /admin/* | Redirect /admin | ADMIN | S; authorized fallback U |
| 36 | * | NotFoundPage outside public shell | Public | S,R initial /missing-page |

## Functional and state coverage

Public home/catalog/course outlines, empty and populated dashboard/library/notes/results, practice and diagnostic/server result/mastery/recommendations, source and PDF reading, persistent notes/drafts, paid mock training/subscription entitlement and profile/order history, missing/unknown order errors, session revocation, role/API denials, and six primary admin pages now have actual preview evidence. Exact test qualifications are in [regression report](REGRESSION_REPORT.md). Unchanged study-return fails before waiting for page restoration; the audit-only settled-page variant passes the full journey. No deletion was run.

Authentication M remains nine synthetic scenarios, including real-Google-shaped success/failure/expiry cases. Backend password/login/logout are I. Test:courses deliberately intercepts error/missing-document responses; smoke/recovery and safe notes inject 503s. Those branches are not naturally occurring backend failures. Extended audit screenshots do not mock responses.

## Layouts, components, themes and widths

All initial layout/component source findings remain in [component inventory](COMPONENT_INVENTORY.md). PublicLayout, DashboardLayout student/admin, diagnostic/result views, source/PDF reader and payment pages now have real local data. The initial eight public routes at 320,375,390,768,1024,1280,1440 × 900 retain their 56-case/26-image evidence. New captures sample 390 × 844 and 1440 × 1000, plus existing suite widths 1365/1440 × 950/1000. There is no complete private seven-width matrix. No document overflow was observed where measured; contained table scrolling is not proof of full keyboard/cell accessibility.

The application still has no Light/Dark/System preference. System-color-scheme observation and source inspection establish this baseline; no dark appearance was invented. No final accessibility, theme or visual approval is claimed.

## Unverified and unimplemented behavior

Real Google OAuth consent/code exchange, seven-day server session expiration, external payment gateway/callback/failure/cancellation/pending states, expired/revoked subscription transitions, note deletion, destructive admin operations, resumed/interrupted upload, all validation and concurrent note-conflict combinations, a full 60-minute assessment timeout, print/visibility protection, complete private route/width/accessibility matrices, admin compatibility aliases, all dark-mode states and assistive-technology acceptance remain unverified. These were not simulated into successful backend evidence. Account profile/order/subscription display exists; account name/email/password editing, password recovery and a separate settings route are not implemented, so no settings-save behavior is claimed. No recurring bank debit exists. Full global lint remains incomplete.

IMAT/SAT services, study planners, CEFR readiness levels, video introduction, blog/about, support chat and external analytics/AI-provider management were not established as implemented. Reference concepts and inactive CSS do not justify adding or advertising them.


## Phase 1 implementation record

Phase 1 retains the 36-entry route ledger. Representative real local screenshots cover home, login (Google locally disabled), dashboard, account, active diagnostic, saved results, reader, catalog and admin at mobile/desktop in light/dark. A separate mocked GIS button image is explicitly labeled. Seven-width checks cover home/login/dashboard/account/diagnostic setup/catalog/results, supplemented with reader/admin. Exact cases and overflow flags: [foundation review](evidence/phase-1/foundation-review.json), [rendered state review](evidence/phase-1/rendered-states.json). This is representative foundation coverage, not completion of every Phase 2–9 page/state. No private routes were bypassed; backend-issued local sessions were used. No new route was added.
