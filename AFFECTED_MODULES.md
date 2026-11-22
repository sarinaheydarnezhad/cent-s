# Affected modules and dependencies

Audit: 2026-11-20. `F` = this frontend checkout; `B` = `D:/Lerona/Backend/backend`. Backend source is readable. Production persistence/runtime is not inspected. Paths identify affected code, not permission to change it.

## Frontend impact map

| Files under F | Observed dependency / affected behavior | Suggested task |
| --- | --- | --- |
| `src/types.ts` | Five-value SubjectId; fixed result subject dictionary; shared admin Question contract | T2.1, T5.1 |
| `src/services/cent.ts` | ExamAttempt has flat questions/deadline; ExamQuestion has no passage/version/section; product/order/grant have single training or subscription | T2.1, T2.2, T5.1, T5.2 |
| `src/pages/PracticePages.tsx` | Exam controller; `cent:exam:user:kind:course:topic` session key omits version; 3600 initial timer; storage restore/start/submit | T3.1, T5.1 |
| `src/components/ExamExperience.tsx` | Explicit 60-minute copy, unrestricted question map, null-key answered meter, dynamic options, SVG image, no shared passage | T3.1, T5.1 |
| `src/pages/AssessmentResults.tsx`, `PersonalResults.tsx` | Accuracy/subject/topic results; comparability lacks rule version; review lacks original full stem/options/passage | T3.1, T5.1 |
| `src/pages/LearningProgress.tsx`, `ReadinessPage.tsx`, `StudentDashboard.tsx` | Curriculum/mastery/recommendations; adding or retiring topics changes progress denominator | T4.4, T5.1 |
| `src/pages/CourseCatalog.tsx`, `public/HomePage.tsx`, `public/ExamPage.tsx`, `public/DiagnosticIntroPage.tsx` | Primarily API curriculum metadata, not hardcoded official counts; subject offer mapping and published content | T4.4, T5.1, T5.2 |
| `src/components/AssessmentUI.tsx`, `UI.tsx`, `src/services/learning-presentation.ts`, `assessment-presentation.ts` | Subject icons/fallbacks, exact topic resolution, restrained educational status semantics | T5.1 |
| `src/pages/ReadingLibrary.tsx`, `StudyReader.tsx`, `components/ReaderExperience.tsx`, `ReadingUI.tsx` | Source-text/image reading, watermark, saved page, revisioned notes; not an English comprehension exam engine | T3.3, T4.4, T5.1 |
| `src/services/study-return.ts`, `src/state/AppState.tsx` | Intended destination, session restoration, results/library; preserve study return and user isolation | T3.1–T3.4 |
| `src/pages/CommercePages.tsx`, `components/CommerceUI.tsx`, `services/commerce.ts`, `services/useCommerceAccess.ts`, `services/usePaymentCooldown.ts` | Permanent-training/subscription assumptions, persisted retry identity, verified result recovery, current access/expiry refresh, server Retry-After | T2.2, T3.2, T5.2 |
| `src/pages/admin/CentAdmin.tsx` | Default new question has four options; no add-option control; product UI TRAINING/SUBSCRIPTION; existing import calls mutate data | T4.4, T5.2 |
| `src/App.tsx`, `components/DashboardLayout.tsx`, `PublicLayout.tsx`, `JourneyNav.tsx` | Existing public/student/admin route topology; no calendar/planner route | T3.5 if separately selected |
| `src/main.tsx`, `foundations.css`, `foundation-ui.css`, `public.css`, `student.css`, `assessment.css`, `reading.css`, `commerce.css`, `styles.css`, `cent.css` | Ordered global/style layers; scoped redesign extension; preserve approved tokens | T5.1–T5.3 |
| `public/appearance.js`, `components/AppearanceControl.tsx`, `Brand.tsx`, `public/brand/*`, `public/images/*` | Existing approved theme/logo/artwork | Protected; no replacement required |
| `src/services/google-auth*`, `google-identity*`, `components/GoogleSignIn.tsx`, `pages/public/LoginPage.tsx`, `GoogleCallbackPage.tsx`, `ProtectedRoute.tsx` | OAuth code/PKCE and GIS modes; shared bearer sessions; product decision on Google-only entry | T3.3, T3.4 |
| `vite.config.ts`, `.env.example`, `CLOUDFLARE.md`, `GOOGLE-GIS.md`, `.github/workflows/deploy.yml`, `public/_headers` | Root/subpath, API proxy, callback headers, deployment triggers | Protected until T6 review |
| `src/data/questions.ts`, `src/services/scoring.ts` | Legacy sample/helper imported by tests, not production pages; helper's optional −1/3 penalty differs from official −1/4 | T1.1 classification; no blanket replacement |

## Backend impact map

| Files under B | Evidence / reuse boundary | Suggested task |
| --- | --- | --- |
| `Cent.Module/Entities.cs`, `CentDbContext.cs`, `CurriculumEntities.cs` | Existing cent_* relational model, no ExamVersion/Passage/Device/Bundle/OrderLine/StudyLease; one unique grant per order | T2.1–T2.3 |
| `Cent.Module/CurriculumPackage.cs` | Five static course identities; SHA-derived stable GUIDs with `cent-curriculum-v1:` namespace | T2.1, T4.4 |
| `Cent.Module/CentCurriculumImporter.cs` | Validate requires 39 sources, five subjects and four distinct options; hash idempotency; upserts overwrite same identities; retires omitted imported questions | T4.4 |
| `Cent.Module/CentPractice.cs` | At most 20 questions, randomized groups, global 60 minutes, correct/total percentages; snapshots and idempotent submit reusable | T3.1 |
| `Cent.Module/CentLearning.cs` | Latest distinct active question evidence, last ten per topic; minimum three; all imported topics denominator | T4.4 |
| `Cent.Module/CentContent.cs` | Per-request training/subscription access, expiry fields, personal watermark, notes/progress, public metadata | T3.2, T3.3 |
| `Cent.Module/CentPayments.cs` | Server rial price, single product/order, verified transaction/one grant, provider/reference uniqueness; TRAINING expiry null | T3.2 |
| `Cent.Module/CentAdmin.cs` | Training/product CRUD, publish/import, order/user views, grant revocation, audit; no bundle/price-policy/device management | T4.4, T5.2 |
| `Cent.Module/CentModule.cs`, `CentGoogleAuth.cs`, `CentGoogleGisAuth.cs`, `CentGoogleIdTokenValidator.cs` | Cent-specific CORS, bearer policy, 7-day sessions, Google validation; no device binding or study concurrency enforcement | T2.3, T3.3, T3.4 |
| `Cent.Module/Migrations/*`, `Deployment/*.sql` | InitialCent, Curriculum, AddCentGoogleAuthentication; independent cent_migrations_history; SQL Server production code | T2.*, T6.1 |
| `Cent.Preview/Program.cs`, `PreviewSchema.cs`, `CurriculumUpgrade.cs`, `GoogleAuthUpgrade.cs` | Development SQLite host; startup/upgrade/import can write data—do not run in Phase 0 | T6.1 isolated testing only |
| `Cent.Curriculum/SourceReader.cs`, `QuestionAuthoring.cs`, `OtherAuthoring.cs`, `PhysicsAuthoring.cs`, `Program.cs` | Extract/author/generate pipeline; generation rewrites package/review files | T4.* |
| `Cent.Module/Content/curriculum.json`, `Content/Sources/*`, `Content/Review/*` | Bundled inventory, provenance, findings; local source package, not production inventory | T4.* |
| `Flashcards.Api/Program.cs` | Shared host registration; Cent connection may fall back to shared physical FlashcardsDb | Protected Lerona boundary; T6 compatibility review |

## Relationship and protection map

`Course → Training → Documents → Pages/Sections`; `Source → Chapter → Topic → SourceSection/SourceExercise → Question`; `User → Attempt → AttemptQuestion(snapshot, answer) → Analysis`; `User/Product → Order → Entitlement`; `User/Document → Progress, Note`.

Most foreign keys use NoAction. AttemptQuestion deliberately stores QuestionId without a live-question FK, preserving snapshots. Curriculum changes can still change mastery through active-bank filtering. Payment rows snapshot amount/title/type/training/duration/provider; future bundles require item-level scope without losing that financial history.

Keep auth, cent_* isolation, Lerona flashcards/subscriptions/Myket/SMS/sync/backups, existing notes, immutable published PDF pages, purchase snapshots, request identities and production secrets protected. Do not reuse another Lerona service's device limits as evidence of Itatest enforcement.

## Existing verification entry points

Frontend Vitest files cover session, Google auth/GIS, appearance, legacy scoring, presentation and commerce helpers/components. Browser scripts cover public/components/dashboard/assessment/reading/commerce/accessibility plus connected notes/curriculum/courses/progress/study-return. Only the commands actually defined in `tests/browser/package.json` may be used as npm scripts; other checks are standalone `.mjs` files. Backend `Cent.Tests` contains API, curriculum, gateway, commerce and both Google test classes. Their existence is verified; they were **not executed during this audit**.
