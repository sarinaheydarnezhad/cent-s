# Phase 8 — administrative application

Status: implemented locally; final verification recorded below. Awaiting the owner's explicit visual approval. Phase 9 is excluded. English technical documentation; Persian interface.

## Discovery and path allowlist

Confirmed absolute Git roots: `D:\Lerona\itatest`, `D:\Lerona\Backend`, `D:\Lerona\Frontend`. All three working trees were clean at entry. No AGENTS.md was found in the workspace or applicable ancestors.

Allowed edits: `itatest/src/**`, `itatest/tests/**`, `itatest/docs/refinement/**`; `Backend/backend/Cent.Module/**`, `Backend/backend/Cent.Preview/**`, `Backend/backend/Cent.Exam.Tests/**`, `Backend/backend/Cent.Tests/**`, `Backend/docs/cent/**`. Local ignored build outputs remain inside these repositories. The Cent.Tests allowlist covers the existing upload/bootstrap and duplicate-reference compatibility tests. No shared host source, Lerona code, production database, commit, push, or deployment is authorized.

## Implementation plan

1. Reuse Cent sessions, role column, audit table, resource upload, commerce and versioned exam services. Add Cent policies and trusted bootstrap over verified existing identity.
2. Add bounded administrative read contracts, accurate persisted metrics, role management and safe publication safeguards. Preserve immutable exam/content releases and historical financial snapshots.
3. Build a dedicated permission-aware admin shell and connected Persian modules; retain supported resource/question forms.
4. Verify Cent authorization/API behavior and student regressions, frontend tests/builds/lint, isolated real-API browser flows and new AFTER evidence.
5. Record contracts, limitations, provisioning, evidence and complete changed-path integrity review. Stop for visual approval.

## Capability classification

| Capability | Discovery classification / implementation direction |
| --- | --- |
| Sessions and admin role | Already implemented; extend existing Cent role/policies, no parallel identity system |
| Bootstrap | Cent-only backend correction: bind explicit operator secret to existing Google-verified session identity |
| Resource creation/edit/PDF publish | Already implemented; integrate and preserve current image storage |
| Products and entitlement revocation | Already implemented; permission isolation and safe UI confirmation |
| Users/orders | Existing truncated lists; Cent-only paginated reads and detail summaries |
| Subscriptions | Existing entitlements; add bounded administrative projection |
| Questions | Existing editor; bound reads and prevent edits to immutable release-backed items |
| Versioned assessments | Existing publish/archive/activate services; integrate existing validation gates |
| Curriculum | Existing importer and versioned releases; expose read visibility, no duplicate CMS |
| Reports/overview | Cent-only aggregates from persisted records, no invented active-user/performance metric |
| Roles | Existing single role column supports five roles and legacy ADMIN alias; no schema replacement |
| Settings | Read-only existing feature flags, no secrets or shared configuration editing |
| Destructive deletion/refunds/manual paid/automatic renewal | Product decisions / explicitly excluded |
| Verified password-only bootstrap | Unsupported verification evidence; Google-verified identity required |
| Shared dependencies | None identified for planned implementation; escalate if this changes |

## Delivery and integration

The existing Cent session handler, role column, audit table, document storage, PDF converter, curriculum importer, versioned assessment engine and commerce services are reused. There is no second login, CMS, storage service, payment system or entitlement model. The detailed endpoint contracts, permission matrix, metric definitions, audit behavior and operator provisioning procedure are in the [backend handoff](../../../Backend/docs/cent/PHASE_8_ADMIN_API_HANDOFF.md).

The dedicated admin shell uses the existing Slate & Sage tokens, Light/Dark control, Vazirmatn, dialogs, remote-loading components and sign-out. Role-aware navigation and direct-URL permission checks supplement mandatory server policies. Existing `ADMIN` accounts remain compatible; SuperAdmin, UserManager, ContentManager, ExamManager and FinanceManager are recognized. Login and Google callback changes only select the destination for these existing session roles.

| Route (relative to the configured base path) | Connected capability |
| --- | --- |
| `/admin` | Persisted user/resource/assessment totals; finance totals only with finance permission; permitted shortcuts |
| `/admin/users` | Bounded paginated search and role filtering, verified-identity status, account details, purchase/access summary |
| `/admin/resources` | Paginated published/draft resources, sections/products/grants, existing training editor and PDF conversion/upload/publication |
| `/admin/content` | Existing curriculum counts, course availability and latest ten imports; versioned content remains immutable |
| `/admin/assessments` | Existing version list/detail and confirmed publication/archive/activation; original server gates remain |
| `/admin/questions` | Paginated bank, options/key/explanation, topic relationship, manual draft creation/editing; imported or active questions are read-only |
| `/admin/orders` | Status/search filters, transaction reference, immutable amounts, payment events, legacy and subject access dates, confirmed existing entitlement revocation |
| `/admin/subscriptions` | Existing legacy subscription intervals, active/expired/upcoming/revoked filters and order navigation |
| `/admin/packages` | Existing subject offers with explicit reviewed-content approval; existing legacy product editor with sold-product protections |
| `/admin/reports` | Actual UTC registration buckets, order statuses and assessment participation in a bounded 7/30/90-day range |
| `/admin/roles` | Permission matrix, confirmed audited role assignment and paginated audit records |
| `/admin/settings` | Allowlisted read-only existing feature configuration; no secrets |

Legacy `/admin/finance`, `/admin/diagnostics`, `/admin/simulators` and `/admin/subjects` redirect to their current modules. The router respects both `/cent-s/` and `/` deployment bases. Lists use stable server ordering and bounded pagination rather than arbitrary sort expressions. Loading, empty, error, recovery, permission denial, validation and success feedback are connected to actual request results. No success is displayed before the server accepts a mutation.

## Security and database boundaries

Every admin API uses the existing CentSession scheme. Anonymous requests receive 401; students and unrelated specialists receive 403. Specialist roles cannot assign roles. Role changes are committed with their audit event, cannot target the caller, require verified identity for administrative promotion, protect the final SuperAdmin and apply to existing sessions on the next request. Bootstrap requires the exact existing verified identity, its authenticated session, an operator secret and an empty initial SuperAdmin cohort; it creates no password or extra session. No real identity was provisioned.

Sensitive projections exclude password/session hashes, Google subjects, OTPs, merchant configuration and payment authority. Historical order amounts, result JSON, content releases and published pages remain protected. Published/imported questions cannot be overwritten. Main-gateway receipt totals exclude MOCK/sandbox orders. UTC reporting and subscription intervals use server time. Unsupported active-user and scientific performance metrics are described honestly rather than synthesized.

No entity, context, migration or schema change was needed. The real-API browser checks use a new disposable SQLite database with random fixture sessions, synthetic `.invalid` identities and MOCK financial rows. The explicit fixture flag rejects existing databases; ordinary preview startup creates no known administrator. Tokens stay in ignored preview files and are excluded from screenshots and reports.

## Verification and evidence

The [AFTER screenshot index](evidence/phase-8/SCREENSHOTS.md) covers all modules, details, mobile navigation, Light and Dark themes, and the root deployment base. No BEFORE images were captured.

- [Real API/browser verification](evidence/phase-8/verification.json): 12 workflow groups, 19 screenshots, 17 layout checks and zero page errors. No intercepted backend responses. Coverage includes anonymous/student denial, specialist isolation, safe aggregates, direct URLs, search/empty/error/recovery, actual pagination, training creation and genuine PDF publication, immutable questions, draft validation/save, orders, subscriptions and audited immediate role enforcement.
- [Root build verification](evidence/phase-8/root-verification.json): anonymous and student redirects plus authorized orders at `/admin/orders`, using the production root build.
- [Student regression](evidence/phase-8/student-regression.log): seven existing exam/Practice/reader/note scenarios passed. These use intercepted contract fixtures and do not claim database or provider integration.
- [Frontend tests](evidence/phase-8/frontend-tests.log): **245 passed across 21 files**. [Focused lint](evidence/phase-8/focused-lint.log), [subpath production build](evidence/phase-8/build-subpath.log) and [root production build](evidence/phase-8/build-root.log) pass. `npm run build` includes TypeScript project checking.
- Cent.Exam.Tests: 86 passed with no failures/skips, including eight new admin policy/session cases; ignored artifact `Backend/.dotnet/phase8-test-results/phase8.trx`. Existing commerce, curriculum, exam and gateway regressions are included. The historical 127 Cent/396 Lerona counts are not reused as current results.
- The existing Cent.Tests PDF upload regression was updated to the authenticated, verified, operator-targeted bootstrap contract. The corrected case passed, including complete-page publication and immutable published pages. [Sanitized backend counters](evidence/phase-8/backend-verification.json) and the [corrected-case log](evidence/phase-8/backend-upload.log) record these results. The previous fixture's anonymous bootstrap was correctly rejected with 401. A concurrent build hit the running suite's DLL lock; the freshly compiled corrected assembly was verified from a separate ignored output folder, without changing project/dependency configuration.
- The [full existing Cent.Tests run](evidence/phase-8/backend-regression-initial.log) executed **127 cases: 125 passed and two failed**. Both failures were stale compatibility expectations: the former bootstrap contract above, and expecting SQLite uniqueness failure instead of the existing `409/payment_reference_reused` domain failure. The latter test now asserts the exact status/code and retains the single-grant and pending-order invariants. The [targeted rerun](evidence/phase-8/backend-fixed-regressions.log) passed **both corrected cases, zero failures/skips**. This verifies all 127 cases across the initial run and targeted repairs; a second all-green full 127-case run was not performed. Ignored TRX artifacts are `phase8-cent-regression-before.trx` and `phase8-cent-fixed-regressions.trx` under `Backend/.dotnet/phase8-test-results`.

Desktop 1440px, tablet 768px and mobile 390px/360px checks found no document-level horizontal overflow. Wide tables scroll inside labeled focusable regions. Reviewed screenshots show preserved Persian RTL, contained mixed-language identifiers, readable statuses and visible chart values. Keyboard checks cover Escape dismissal, focus return, a working skip link and reduced-motion behavior; form controls have labels. This is focused browser and visual inspection, not a claim of a complete assistive-technology certification.

Body descriptions use 16px text; primary table, filter, button and chart labels use at least 14px. Smaller text is reserved for secondary metadata and the existing brand lockup.

## Unsupported capabilities and remaining limits

- There is no account suspension/deletion model, unverified password-only administrative promotion, refund, arbitrary paid-state mutation, financial adjustment or automatic-renewal feature.
- One existing role per account is supported. Combined specialist roles need a separate product decision. No replacement authorization system was introduced.
- Curriculum editing follows the existing importer/release process. There is no duplicate visual CMS or published-definition editor. The PDF workflow creates new documents; it cannot overwrite published pages.
- Legacy subscriptions remain visible and manageable through existing supported operations; new subject purchases retain the existing independent finite terms. This task introduces no new commercial policy.
- Editor option lists and version lists are explicitly capped; there is no claim of unlimited editor scalability. Sorting is stable and fixed. Search/filter/pagination cover supported server contracts.
- Engine-disabled previews can inspect assessment versions but cannot execute engine-only mutations. Production SQL Server runtime/concurrency, actual Google identity exchange, live merchant verification and deployment are outside this local verification.
- The existing shared-host test dependency graph emits package/pruning/advisory and EF Core resolution warnings; the attached build logs retain them. No dependency version or shared project was changed in this task.
- Audit rows cover domain successes and authenticated domain rejections. Framework authorization denials are rejected before handlers. Retention/archival policy and existing non-GUID exam audit-target limitations remain documented in the backend handoff.

No shared-code dependency required a source change. Visual approval is the outstanding owner decision, as explicitly requested in Phase 8 §20. Phase 9, production provisioning, commit, push and deployment have not been performed.

## Changed-file inventory and isolation

All paths below are relative to their confirmed Git repository. Evidence includes only local synthetic data. Existing uncommitted Phase 8 work was preserved during continuation.

Itatest application and tests:

```text
src/App.tsx
src/components/ProtectedRoute.tsx
src/components/PublicLayout.tsx
src/main.tsx
src/pages/admin/CentAdmin.tsx
src/pages/admin/AdminLayout.tsx
src/pages/admin/AdminPages.tsx
src/pages/admin/AdminPages.test.tsx
src/pages/admin/SubjectOffersAdmin.tsx
src/pages/public/GoogleCallbackPage.tsx
src/pages/public/LoginPage.tsx
src/services/admin.ts
src/services/admin.test.ts
src/types.ts
src/admin.css
tests/browser/check-admin-real.mjs
docs/refinement/PHASE_8_REPORT.md
docs/refinement/evidence/phase-8/**
```

Cent backend and tests:

```text
backend/Cent.Exam.Tests/ExamApiTests.cs
backend/Cent.Exam.Tests/AdminApiTests.cs
backend/Cent.Tests/CentApiTests.cs
backend/Cent.Tests/CentCommerceTests.cs
backend/Cent.Module/CentAdmin.cs
backend/Cent.Module/CentAdminConsole.cs
backend/Cent.Module/CentAdminSecurity.cs
backend/Cent.Module/CentLearning.cs
backend/Cent.Module/CentModule.cs
backend/Cent.Module/CentPractice.cs
backend/Cent.Module/Exams/CentExamEndpoints.cs
backend/Cent.Module/SubjectCommerce.cs
backend/Cent.Preview/Program.cs
docs/cent/PHASE_8_ADMIN_API_HANDOFF.md
```

`D:\Lerona\Frontend` remains clean. All backend source changes belong to Cent. Shared host, Lerona entities/contexts/migrations/configuration, auth, flashcards, sync, backup and subscriptions source remain unchanged. Only local ignored outputs are generated by builds/tests; no production database or real payment operation was executed. Repository HEADs remain at their entry commits, with no commit/push/deployment.

The [machine-readable integrity record](evidence/phase-8/workspace-integrity.json) lists every changed path and repository HEAD. Git's trust exception was supplied only to the read command for these named workspace repositories; no global Git configuration was changed.

