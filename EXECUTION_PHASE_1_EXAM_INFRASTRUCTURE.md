# Execution Phase 1 — CEnT exam infrastructure implementation

Date: **2026-11-20**. Status: **implementation slice built and tested; not activated, migrated or deployed**. The owner's Execution Phase 1 instruction authorizes this bounded implementation and supersedes earlier documentation-only restrictions for this slice. Commercial decisions, content publication and database application remain separately gated. This report does not approve unresolved policies or start another implementation workstream.

## Implemented behavior

- Both official blueprints are retained: historical five sections/55 questions/6,600 seconds and current Reading-first six sections/65 questions/8,400 seconds. Structure is defined centrally, persisted as immutable definition JSON and exposed through configuration APIs. Ordered section and scoring rules are value objects inside that definition, not controller/frontend constants. Administration-cycle dates are provenance; no macro-periods or sessions are fabricated.
- Published definitions cannot be edited into another blueprint. Corrections need new version/configuration identities. Minimal CentAdmin publication, activation and archival routes support the lifecycle. Archival changes new-start availability only; it does not change issued attempts.
- Existing `CentAttempt` and `CentAttemptQuestion` storage is reused. New companion rows retain the resolved rules, syllabus/content references, selected ordered questions/options/keys, passage/group snapshots, section configuration, runtime state, receipts and terminal result. Shared passages occur once in the rules snapshot and are referenced by child questions. No existing question/content ID, import or published lesson is changed.
- A reviewed manifest explicitly maps eligible revisions to version/section. Assembly validates five distinct options/one key, identities, dependencies, group membership and exact quotas before persistence. Atomic group selection uses exact subset assembly; it never splits a group to fill a quota or substitutes four-option legacy items. Existing questions are not automatically certified eligible.
- Section deadlines are server UTC values. Timeout activates the successor at the previous effective deadline, including repeated catch-up after disconnection. Confirmed early advancement forfeits unused time; there is no backtracking or time transfer. Full-answer completion alone never advances a section. Browser closure, reconnect and reload do not reset time.
- SQL Server transactions and per-attempt `UPDLOCK` serialization protect state across instances. Owner/request serialization protects start idempotency. Revision checks and payload-bound command receipts prevent stale writes and duplicate effects. Answers and receipts commit before success is returned. Rejected late inputs still commit due timeout reconciliation. Prior active sections close before the filtered unique active-section index permits successor activation, within the same transaction.
- A five-second deadline worker supplements reconciliation on every authoritative state/read command. Its registration is explicitly opt-in. Clock rollback relative to persisted activation/transition/receipt anchors rejects unsafe operations; deployment still needs sound server clock monitoring.
- Exact integer quarter-points and decimal formatting implement +1/−0.25/0. Accuracy uses answered questions; completion uses assigned questions. Zero answers produce null accuracy and zero completion. Terminal result JSON is retained without recalculation; official normalised scores remain null. Final closure and result commit atomically. Recovery can also finish a retained `SUBMITTING` intent without reopening answers.
- Active responses omit keys/explanations and future question content. Result/review resources are owner-scoped and terminal-only. Legacy submit/result handlers reject the reserved new `mock` kind. New mock parents keep legacy `SubmittedAt`/`ResultJson` null, so existing history and mastery readers do not deserialize new-format payloads. Legacy diagnostic/Practice/simulator scoring and 60-minute behavior remain unchanged.

## New persisted entities and migration

| Entity | New table | Role |
| --- | --- | --- |
| CentExamVersion | cent_exam_versions | Immutable blueprint/rules JSON, syllabus/content references, publication/availability and revision |
| CentSyllabusRevision | cent_syllabus_revisions | Immutable sourced syllabus evidence; no invented historical mapping |
| CentExamContentRelease | cent_exam_content_releases | Reviewed immutable manifest over existing question/topic identities and passage/group revisions |
| CentMockAttempt | cent_mock_attempts | One-to-one companion to existing CentAttempt; private rules/passage snapshots, state/revision/result |
| CentAttemptSection | cent_attempt_sections | Snapshotted section identity/quota/duration, state and effective/processed timing |
| CentExamCommandReceipt | cent_exam_command_receipts | Unique attempt/command acknowledgment and canonical payload hash |

Migration: [20261120134304_VersionedMockExams.cs](../Backend/backend/Cent.Module/Migrations/20261120134304_VersionedMockExams.cs). Review SQL: [cent-versioned-mock-exams.sql](../Backend/backend/Cent.Module/Deployment/cent-versioned-mock-exams.sql).

Generated offline using only `Cent.Module` as both migration and startup project, with an explicitly nonresolving placeholder connection. The forward migration creates six `cent_*` tables/indexes/NoAction foreign keys, inserts two **disabled-for-new-starts** blueprint rows, and records its entry in `cent_migrations_history`. There are no existing-table alterations, legacy updates/backfills/deletes or Lerona objects. Existing migrations were neither deleted nor renamed. Only the Cent model snapshot was extended.

**No migration or SQL script was applied, and no database was connected.** The review SQL assumes the existing last Cent migration/history already exists; it is not a fresh-database bootstrap script. Exact deployed target, schema/history, provider permissions, backup/restore and SQL Server lock/index behavior require a later explicitly authorized isolated rehearsal. The generated Down drops the six new tables and must not be used as an application rollback after attempts exist. Retain schema and compatible readers; archive/disable new starts instead.

## API surface

All new learner paths use `/api/cent/v1/assessment` and the existing Cent authentication/ownership conventions:

| Method | Relative path | Behavior |
| --- | --- | --- |
| GET | /exam-versions | Public published/archived blueprint metadata and availability |
| GET | /exam-versions/{versionId}/configuration | Public ordered rules; no question keys |
| POST | /mock-attempts/ | Owner/request-id start, 201 new / 200 original retry |
| GET | /mock-attempts/{id} | Reconciled state and section metadata |
| GET | /mock-attempts/{id}/active-section | Active content and accepted selections only |
| PUT | /mock-attempts/{id}/answers | Revision-guarded durable answer/explicit-null clear acknowledgment |
| POST | /mock-attempts/{id}/advance | Confirmed irreversible non-final section closure |
| POST | /mock-attempts/{id}/complete | Final-section-only participant completion |
| GET | /mock-attempts/{id}/result | Stored terminal counts/exact raw metrics; flattened A6 contract |
| GET | /mock-attempts/{id}/review | Frozen terminal questions/passages/options/keys, subject to approved review policy |
| GET | /mock-attempts/?cursor=...&limit=... | Owner-only new-format history, separate from legacy history |

Minimal admin routes under `/api/cent/v1/admin/exam-versions` are `POST /`, `POST /{versionId}/activate` and `POST /{versionId}/archive`, requiring existing `CentAdmin` and audit events. No authentication, account or payment routes changed. New command errors can include safe current state. Foreign/missing attempts return the same 404. Missing `selectedOptionId` is invalid; explicit null clears an answer. Existing private/no-store response handling applies.

## Activation gates and explicit limitations

1. **T11-D02 remains pending:** final-timeout raw feedback versus counts-only expiry. The engine implements separately identified `expired-feedback-v1` and `expired-counts-only-v1` profiles and snapshots the selected profile. Tests exercise both; no production default is chosen. Published blueprint seeds have null submission policy and cannot start. An approval question was raised during implementation; no unanswered question was treated as approval.
2. **P1-C05/C12 remain pending:** full Mock Exam benefits/admission, mid-attempt entitlement expiry and post-expiry review. `ICentMockAdmission` is the integration boundary; its production default deliberately rejects new admission/review. It does not reuse the old simulator subscription gate or implement commerce. Already-issued start retries and state reconciliation use their stored rules, not current availability.
3. **Content is not ready:** the existing four-option bank is ineligible and no Reading production release was created. A later reviewed content/publication task must supply immutable syllabus/manifest evidence, actual existing subject/topic/question mappings, licensed passages and exact eligible quotas. No importer/CMS/content migration is included here.
4. **Database execution is not authorized:** migration artifacts and model/SQL generation are verified offline; no real SQL Server transaction, contention, migration-apply, restore or deployed-data test was performed. The SQL Server store intentionally rejects unsupported providers for new attempt operations. The existing SQLite preview schema/upgrade path is unchanged and has not been started.
5. New routes/worker require **`Cent:Enabled` and `Cent:Exams:Enabled`**; no configuration file or running host was changed. The exam flag defaults off. Later enabling must follow migration/policy/content review. Once attempts have been issued, keep their routes/worker and compatible code available; use per-version availability/archival to stop starts rather than removing the engine flag.
6. Comparison cohort approval is still pending; new results make no compatible-trend/official-equivalence claim and do not feed mastery. Operational clock health, retention and multi-instance SQL Server assurance remain release validation, not claims established by unit tests.

## Validation

- `dotnet build backend/Cent.Module/Cent.Module.csproj --no-restore --verbosity minimal`: succeeded, zero warnings/errors on the dedicated module build.
- `dotnet test backend/Cent.Exam.Tests/Cent.Exam.Tests.csproj --no-restore --verbosity minimal`: **40 passed, 0 failed, 0 skipped**. The test project references only `Cent.Module`, not the shared API host or Lerona projects.
- Tests cover both blueprints, ordered quotas, exact/zero/negative scoring, mixed T1.1 result 37.50/74.55%/84.62%, frozen rules/content, atomic passages, shortfall rejection, timing/deadline equality, catch-up/reconnect, acknowledgment/clear/replay/commit failure, revision conflicts, early forfeiture, invalid transitions, final submission/expiry profiles, recovery, clock rollback, active-key privacy, owner/auth HTTP behavior, immutable terminal payloads and legacy 60% scoring preservation.
- HTTP tests use ASP.NET TestServer and a transactional memory store/test-only authentication. No production host, provider, account, database or stored historical record is accessed. SQL Server model/migration checks, including lock-query/history-cursor translation, generate SQL without opening a connection and verify six additive Cent tables, two disabled seeds, NoAction relations, no pending model drift and no existing-table/data mutation.
- The existing `Cent.Tests` project was not run because it references `Flashcards.Api` and would build/start protected shared-host dependencies. This is an explicit boundary, not a full legacy integration-suite pass.
- A temporary assembly copy retry occurred when offline EF SQL generation overlapped a test build; both commands completed successfully. The final sequential test build/run completed without that warning.

## File-boundary verification

SHA256 comparison of the 106 pre-existing Cent.Module files (excluding bin/obj) found **102 unchanged** and exactly the four expected existing-file changes listed below. All original migration files, content packages/sources, payment/access/authentication code and published assets in that baseline are unchanged. Repository diff/untracked-path review contains only `backend/Cent.Module` and the new `backend/Cent.Exam.Tests` project; no Lerona or shared-host source/configuration paths are changed. This is source integrity evidence, not a database-history audit.

## Complete changed-file inventory

Paths below are relative to `D:/Lerona/Backend/backend` unless noted.

| Existing files updated | Purpose |
| --- | --- |
| Cent.Module/CentDbContext.cs | New companion sets/model and immutable-evidence save guards |
| Cent.Module/CentModule.cs | Cent-only opt-in service/route registration |
| Cent.Module/CentPractice.cs | Reserved new-kind exclusion from legacy submission/result handlers |
| Cent.Module/Migrations/CentDbContextModelSnapshot.cs | Six additive Cent entities; existing model preserved |

| New files | Purpose |
| --- | --- |
| Cent.Module/Exams/CentExamDefinitions.cs | Blueprints, ordered value objects and exact scoring |
| Cent.Module/Exams/CentExamEntities.cs | Six companions and Cent EF mapping |
| Cent.Module/Exams/CentExamAssembly.cs | Reviewed manifests, atomic selection and immutable snapshots |
| Cent.Module/Exams/CentExamEngine.cs | Section lifecycle, receipts, catch-up and terminal results |
| Cent.Module/Exams/CentExamIntegrity.cs | Published/attempt/result/content mutation protection |
| Cent.Module/Exams/CentExamStore.cs | SQL Server transactional serialization and persistence |
| Cent.Module/Exams/CentExamService.cs | Contract projections, owner operations and pending admission boundary |
| Cent.Module/Exams/CentExamEndpoints.cs | Learner/admin routes and deadline worker |
| Cent.Module/Migrations/20261120134304_VersionedMockExams.cs | Additive unapplied migration |
| Cent.Module/Migrations/20261120134304_VersionedMockExams.Designer.cs | Generated Cent target model |
| Cent.Module/Deployment/cent-versioned-mock-exams.sql | Unapplied idempotent forward review script |
| Cent.Exam.Tests/Cent.Exam.Tests.csproj | Isolated module-only test project; existing cached package versions |
| Cent.Exam.Tests/ExamFixture.cs | Synthetic content, deterministic clock and transactional memory store |
| Cent.Exam.Tests/ExamEngineTests.cs | Blueprint, assembly, timing, privacy and metric cases |
| Cent.Exam.Tests/ExamServiceTests.cs | Acknowledgment/concurrency/retry/legacy/immutability cases |
| Cent.Exam.Tests/ExamApiTests.cs | In-process HTTP contract/ownership cases |
| Cent.Exam.Tests/ExamMigrationTests.cs | Offline migration/model, recovery and clock cases |

Itatest documentation updated: this report (new), `DECISION_LOG.md`, `PHASE_EXECUTION_PLAN_REVISED.md` and `PHASE_1_DECISION_REGISTER.md` (historical entries preserved, current scoped authorization/status linked).

No frontend source, UI/styles/assets, content/importer, purchases/entitlements, payment adapter, authentication/session/watermark behavior, package upgrade or deployment changed. No existing database record or historical result was accessed or modified. **No Lerona project, code, configuration, database or functionality was modified. No Lerona build/test/migration ran; nothing under `D:/Lerona/Frontend` was touched.** No content migration, Reading content production, commerce implementation, visual redesign or subsequent implementation slice was begun.
