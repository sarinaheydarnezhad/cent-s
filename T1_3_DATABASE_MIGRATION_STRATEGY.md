# T1.3 — Conceptual data model, compatibility and migration strategy

Date: **2026-11-20**. **No database connection, executable SQL, migration file, schema change or data operation is authorized or performed.** Table names below are conceptual candidates within Cent, not instructions to run them. All later work needs separately approved scope and deployment evidence. Shared Lerona objects/configuration are protected without exception.

## Existing model to preserve

Direct Cent-only evidence: `Entities.cs`, `CurriculumEntities.cs`, `CentDbContext.cs`, `CentPractice.cs`, `CentPayments.cs`, `CentContent.cs` and importer. Existing `cent_*` courses/content/questions/attempts/results/notes/progress/products/orders/payment events/grants/audit remain the foundation. Most relations use NoAction; AttemptQuestion retains QuestionId without a live-question FK to preserve snapshots. Unique `(UserId,RequestId)` on orders/attempts, unique authority and filtered `(Provider,Reference)`, and unique Entitlement.OrderId are important constraints.

Prior audit records SQL Server Cent persistence, separate `cent_migrations_history` and possible shared physical FlashcardsDb fallback. Those are source-audit findings, **not verification of actual target/schema/applied history**. Phase 1 does not inspect shared-host composition, connection secrets or Lerona migrations. If isolation cannot be established through Cent-specific evidence and an authorized operator report, future execution is blocked at that boundary.

## Conceptual target inventory

| Reuse/extend/new candidate | Relationships / preserved behavior |
| --- | --- |
| Reuse CentCourse/Training/Document/Topic/Source | Existing stable identifiers, FKs, import keys and note coordinates; additive Reading only after reviewed content work |
| Extend CentQuestion through revision companion | Existing ID remains; immutable QuestionRevision(s), option IDs/key/explanation/media/provenance; old four-option snapshots untouched |
| New SyllabusVersion/Node/TopicMapping and ContentRelease/Eligibility | Published source-backed skill scope and reviewed version/section eligibility; explicit status/reviewer |
| New Passage/PassageRevision and QuestionGroupRevision/Membership | One immutable required passage per group; ordered child revisions; no orphan dependent items |
| New ExamVersion/ExamSection/SectionRules revision | Ordered quotas/durations and immutable scoring/timing/submission policies; no reuse of document CentSection |
| New AdministrationCycle/MacroPeriod/ExamSession/RegistrationPeriod/ResultPublication/SourceReference | Optional sourced dates and verification status; separate year/window/session concepts |
| Extend CentAttempt via nullable version discriminator + snapshot companion | Legacy rows keep null version and old ResultJson; new complete rules/content snapshot and runtime state/revision/admission if approved |
| New AttemptSection/AttemptPassageSnapshot and command receipts | Deadline/state/closure metadata, unique active-section invariant; idempotent state commands; no device/study-session records |
| Extend AttemptQuestion through section/revision companion and accepted answer metadata | Preserve existing position/QuestionId/SnapshotJson/Answer; new answer protocol can map to existing field plus acknowledgment metadata without writing old rows |
| New Result snapshot companion | Exact quarter integer/decimal fields and ratios/status/schema/comparison identity; old ResultJson never rewritten or rescored |
| Extend CentProduct using explicit subject-offer companion/revisions | Preserve TRAINING/SUBSCRIPTION branches/semantics; deliberately add a reviewed SUBJECT_12_MONTH branch and subject/12-month companion, never masquerade as legacy |
| New PricePolicyRevision/Tier, BundleRevision/Membership, Quote/QuoteLine | Server-only approved prices/rates/rounding/terms, canonical selection, owner/expiry, one accepted-order link |
| Extend CentOrder with contract companion; new OrderLine | New Kind=SUBJECT_ORDER header permits null legacy ProductId/TrainingId/DurationDays; required line ProductId+offer revisions carry subjects. Old headers retain original ProductId/amount/provider/evidence; no historical line fabrication |
| Reuse CentEntitlement aggregate; new EntitlementItem | Keep one aggregate per order; unique item per order line/subject; per-subject finite intervals; old grant resolver unchanged |
| Reuse CentPaymentEvent/CentAuditEvent with compatible event companions if needed | Existing evidence remains; retained-record reconciliation provenance only if needed; no launch grandfathering entity/workflow or fake paid orders |

Companions are preferred for immutable revisions and new state, while two explicit core changes require review: extend the Cent product-kind constraint for SUBJECT_12_MONTH, and make order.ProductId nullable **only for a new SUBJECT_ORDER header** with required line-level products. Preserve legacy constraint branches and non-null legacy order product identity; never create a synthetic paid bundle product or rewrite old headers to fill this gap. New subject product duration is12 calendar months in its companion, with legacy DurationDays null. Final physical naming/EF layout needs a later reviewed Cent-only design; no alteration is authorized now.

For new entitlement aggregates, Kind=SUBJECT_ORDER, TrainingId=null, StartsAt=PaidAt and aggregate ExpiresAt=null are audit metadata, **not a permanent access right**. Every child item has its own finite interval/benefits. Existing CanRead kind checks continue to recognize only their original legacy kinds; the future extension resolves subject items explicitly. Legacy `/catalog` and `/checkout` must not expose/settle unsupported new product kinds; new `/commerce` contracts handle them. Legacy `/attempts` history/readers must not emit new Mock Exam payloads to old clients. Current mastery queries all submitted attempts: later implementation must explicitly exclude new mock-contract rows unless T11-D08 is approved, preserving the contribution of every existing legacy diagnostic/Practice/simulator row. Adding new entities alone would not ensure these compatibility properties.

## Constraints and index requirements

| Area | Proposed constraints | Required index/access path |
| --- | --- | --- |
| Definitions | Unique version/revision; unique section order and subject per version; positive quota/duration; totals agree with blueprint | Published/available version lookup; version/order unique |
| Syllabus/content | Unique revision identity/hash; valid subject/topic mapping; published payload immutable; group membership unique question/order; exact passage compatibility | Eligibility `(release,version,section,status)`; topic/revision lookup; passage/group references |
| Attempts | Owner/request uniqueness; null version legal only for legacy; one rules snapshot/new attempt; consistent section prefix/active pointer | Owner/created history; `(status,activeDeadline)` due work; revision concurrency token |
| Sections | Unique `(attempt,order)` and `(attempt,sectionIdentity)`; positive duration; stored deadline=activation+duration; ≤one active | Filtered active uniqueness if provider supports, otherwise enforce via attempt pointer/transaction; no assumed cross-provider parity |
| Answers/receipts | One accepted value per assigned question; option belongs to frozen question; unique `(attempt,commandId)` and canonical payload hash | `(attempt,section,position)`; command replay lookup; no client timestamp authority |
| Results | One result/final intent per new attempt; C+I+U=N, A=C+I; quarter=4C−I; no updates after finalisation | Owner/attempt; comparison signature/status/date |
| Commerce definitions | Unique subject/offer revision; complete approved tiers; positive checked integer IRR; benefit/term references | Active offers by subject, policy revision, preset membership |
| Quotes/orders | Unique owner/request; unique quote accepted order; one subject per new order; sums list−discount=net and header total; immutable currency/provider/terms | Owner/order detail and keyset history; quote owner/expiry; pending provider/authority recovery |
| Rights | Keep existing unique grant.OrderId; unique `(aggregate,line)` and `(aggregate,subject)`; finite end>start for new items; preserve legacy null expiry | `(owner,subject,start,end,revoked)`; line/grant uniqueness and current access lookup |
| Payments | Preserve unique authority/provider-reference and original events; paid+complete item set atomic | Pending order/reconciliation correlation; no raw provider secrets in new indexes/logs |
| Calendar | Source/precision/status with nullable dates; session belongs to matching cycle; macro optional | Cycle/window/date/status and source freshness; no fabricated dates to satisfy non-null constraints |

Cross-row sums, complete item sets and state prefix/deadline invariants require transactional application validation; CHECK constraints alone cannot establish them. A passage child dependency needs a proper relation plus publication/assembly validation. Retain NoAction/restrict semantics for historical evidence; no cascade delete across attempts, orders, notes or immutable revisions. SQL Server filtered indexes/collations/UTC handling must be rehearsed separately; SQLite success alone is insufficient.

## Evidence-first expansion sequence — future work only

1. **Gate E0:** before any separately authorized executable schema work, obtain sanitized Cent deployment/schema/provider/target and migration-history confirmation plus operator backup/restoration evidence; inventory retained development/test/financial records only as needed for integrity. The owner confirms zero registered users/customers/buyers and no historical customer entitlements requiring grandfathering. No customer cohort report, conversion/backfill or Reading grandfathering workflow is required. No raw record/credential export belongs here.
2. **Gate E1:** approve pending commercial/final-timeout decisions and review Cent-only additive schema/SQL. Every changed object must have a Cent owner and dependency justification; no shared-host configuration or Lerona object change.
3. **Expand on a disposable authorized clone:** add nullable companions/new entities and compatible readers. Existing rows/results/grants/notes require zero semantic changes. Do not apply new default version or twelve-month expiry to all old records.
4. **Reconcile without guesses:** new classification projections use reliable evidence; unknown attempts remain legacy_unversioned and any unknown retained purchase mappings remain unchanged, without treating test records as real customers or creating a launch conversion task. No ResultJson reserialization, rescore, fifth-option backfill, old subject-set invention or historical line allocation.
5. **Rehearse:** exact before/after hashes, financial counts/sums, grant intervals/scopes, note/page anchors, stable IDs/import manifests, mastery method/evidence and old/new client/handler compatibility; isolated SQL Server races and callback failure injection.
6. **Stage future activation:** capable backend/readers before new client; approved content/price/policies before new starts/sales. Stop only new initiations when withdrawing a release; maintain issued attempts, callbacks, verification and old request recovery.
7. **Release gate:** named Cent operator, bounded artifacts/configuration and rollback plan, source freshness, reviewer acceptance and explicit later deployment authorization. Phase 1 does none of these operations.

APPROVED initial offer amounts for all six subjects are **4,900,000 integer IRR (490,000 Toman displayed)**; tiers n=1..6 =0/5/10/15/20/25%, custom/recommended alike, no extra preset discount. These approvals specify future configuration; they authorize no seeding, update or migration now. Do not multiply existing stored Rial amounts by ten or reinterpret old snapshots when correcting the documentation's earlier price proposal. Display conversion is exactly IRR/10; retain original monetary units/amounts for every existing record. Reading has its own subject/content/offer and independent 12-month item, with no grandfathering mechanism. Exact benefits, term/renewal, rounding, refund, quote/checkout and mid-exam expiry gates remain pending.

Backfill is not automatically required: new definitions can coexist with unchanged legacy rows. If trustworthy metadata cannot be added without altering historical evidence, leave it unknown. Existing published content revisions and sold terms require retention planning before any cleanup; exact retention periods remain an operations decision.

## Rollback and recovery requirements

Prefer disabling new activation/quotes/starts, then application rollback to a **compatible** build that still reads/executes already issued new contracts. A pre-feature binary unable to read subject items/section attempts is not a safe rollback target. Keep additive schema, original payloads, new paid rights and their readers. No automatic destructive Down migration, clearing browser keys or deleting new-format attempts.

For payment/provider crash windows retain same-order evidence and reconcile against the provider through an approved operator process. Database restore is a last resort: enumerate all writes/verified payments since backup and reconcile before access/release. Backup existence does not demonstrate restore safety. RPO/RTO are unknown until operator rehearsal. Content rollback changes activation pointers, not source bytes or historical snapshots; note anchor corrections require separate mappings while retaining original coordinates.

No Lerona build/test/migration/database operation is included in validation or recovery. Future shared-host assurance must be provided by its authorized owner without expanding this Cent task. If that assurance is unavailable, report it as a release limitation. [Risk register](PHASE_1_RISK_REGISTER.md) defines preventive/validation/recovery checks; none were run against data in Phase 1.

## Superseded commercial migration assumption

Commercial finalization2026-11-20 replaces the earlier unknown-customer-cohort/Reading grandfathering launch gate with the owner's zero-customer confirmation. Existing generic record-preservation, callback compatibility and rollback requirements remain safeguards; they do not imply a customer migration. No development/test/financial record cleanup is authorized. Infrastructure/deployed-record evidence is still unverified and needs separate authorization before schema execution.
