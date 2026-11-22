# CEnT update execution plan — Revised Phases 1–6

> **Latest execution state, 2026-11-22:** Phase 4 exam/Practice/results/history code is implemented and verified with isolated tests. Phase 3 has a new additive original-content revision and expanded audits; full legacy academic, English, rights and optical acceptance remains incomplete. The owner's Phase 3/4 instruction supersedes earlier implementation prohibitions and pending timeout/interim admission choices below. No commerce implementation, production connection/migration/deployment/activation or Lerona change occurred. See the current delivery record in `CONTENT_GAP_ANALYSIS.md`.

> **Current scoped execution authorization (2026-11-20):** The owner's Execution Phase 1 instruction authorizes the CEnT exam infrastructure implementation described in [the implementation report](EXECUTION_PHASE_1_EXAM_INFRASTRUCTURE.md). Earlier documentation-only statements remain historical. Database connection/application, deployment, commerce, content production/migration, visual redesign and Lerona changes remain unauthorized. Pending final-timeout/admission decisions have not been approved by this instruction.

> **Latest commercial authority (2026-11-20):** [Commercial finalization and current gates](#commercial-finalization-and-current-gates) supersedes all conflicting price/rate/Reading/customer-cohort statuses below. APPROVED:490,000 Toman (4,900,000 IRR) per subject; distinct-count tiers0/5/10/15/20/25%; independent paid Reading; owner-confirmed zero customers, so no customer-grandfathering/migration programme. Existing records remain protected. Unrelated approvals and all implementation remain pending.


> **Current Phase 1 authority (2026-11-20):** The [Phase 1 reconciliation and active backlog](#phase-1-reconciliation-and-active-backlog) at the end of this document supersedes conflicting task meanings/dependencies and residual device/Google/Lerona-test requirements below. Earlier plan text is preserved as history. T1.2 now means commerce reconciliation/specifications; T1.3 means target architecture/contracts. Operational cohort reporting is a future separately authorized evidence gate, not database access in Phase 1. No implementation is authorized.

> **Revision note (2026-11-20):** This is the active proposed backlog after the user's latest scope decisions. Google sign-in changes and enhanced access-sharing controls are deferred. Existing authentication, session, and watermark behavior are protected and must not be modified. The approved commercial baseline remains one-time individual-subject purchases, customizable and recommended bundles, progressive discounts from two subjects, and 12-month access for new purchases. Unresolved commercial details must be decided before dependent implementation tasks begin.

Prepared 2026-11-20. **This is a proposed implementation backlog, not authorization to execute it.** Phase 0 creates documentation only. The separate old visual programme's Phase 7/8 numbering is preserved in `docs/refinement`.

The product model is fixed: one-time individual-subject purchases, user-selectable multi-subject bundles with progressive discounts beginning at two distinct subjects, recommended degree/goal bundles, and 12-month access for each new purchase. Do not substitute subscriptions, lifetime offers or PDF-only sales. Google sign-in changes and enhanced device/session/account-sharing/watermark controls are deferred; preserve their current behavior.

## Global task contract

Every task below inherits these protected areas: production databases/data/deployment; existing financial/order/grant evidence; historical attempt snapshots/answers/ResultJson; user IDs and identity proofs; existing authentication/session behavior; current watermark behavior; note IDs/pages/revisions/drafts; existing content IDs and source bytes; Lerona flashcards/JWT/subscriptions/Myket/SMS/sync/backup infrastructure. Changes to those areas require a separately approved migration/transition plan. Scope entries below are the explicit allowed subset after task approval; they do not permit incidental cleanup, dependency upgrades or branding replacement.

Functional and visual tasks must be separate changes when practical. Existing services, cent_* isolation, UI tokens/components and root/subpath routing are the starting point. No parallel commerce/auth/progress/content stack. Required validation uses isolated fixtures/clones and avoids live accounts/payments until a specifically authorized integration gate.

| Phase | Purpose | Exit gate |
| --- | --- | --- |
| 1 | Resolve version, commercial and operational specifications | Approved decision records, real legacy-cohort evidence and testable contracts |
| 2 | Add compatible data/contracts for versions, passages, and purchases | Reviewed SQL/schema and old/new reader compatibility on clone |
| 3 | Implement server behavior and policies using existing systems | Engine, pricing/grants, account/device/study enforcement pass invariants |
| 4 | Validate/extend content and publish versioned packages in isolation | Reviewed coverage, licenses, keys, distinct skills and stable IDs |
| 5 | Align existing UI with functional contracts and approved visual system | Separate functional wiring and visual review; all required states supported |
| 6 | Rehearse migration/integrations, acceptance and controlled release | Evidence, verified restoration, explicit deployment approval |

Phases 2–3 may use synthetic content only in isolated test fixtures. Their completion must not expose unreviewed bank items or create a false official-format offer. Content work can begin after Phase 1 decisions, but package integration depends on T2.1/T3.1.

## Phase 1 — contracts and reconciliation

### Phase 1 decision gate

Before dependent schema or service implementation begins, record approved decisions for: exam-version identity and section rules; scoring vocabulary and legacy-result interpretation; production legacy purchase cohorts; base subject prices; progressive discount rates and rounding; degree/goal bundle mappings; included learning, practice, and mock-exam benefits; 12-calendar-month start/end and renewal rules; and Reading/legacy-purchase transition. Do not invent unresolved values. Google/device/access-sharing policy is explicitly deferred and must not block the current roadmap.

### T1.1 — Approve version, scoring and legacy-attempt specification

- **Objective/rationale:** define the new official blueprint and truthful legacy educational identity before changing timing or interpreting results.
- **Allowed scope:** documentation/specifications, fixtures and API examples; version naming, section-state machine, score vocabulary, incomplete-attempt/expiry handling and content-scope rules.
- **Protected:** global contract plus current diagnostic/practice semantics and all existing result values; no code/data migration.
- **Dependencies:** official O1–O9 references and decisions D03–D05/D11; preserve assumptions explicitly.
- **Required tests:** specification examples for section order/early advance, boundary expiry, negative raw points, missing answers, legacy history and non-comparable scores; reviewers reconcile them with sources.
- **Acceptance:** cycle versus academic-year labels distinguished; all simulator quotas/options/timers/locks defined; accuracy/raw/mastery separated; no promise of CISIA normalisation; legacy/running-attempt policy explicit.
- **Rollback:** revert unimplemented spec revisions; preserve dated official references and rejected decision history.

### T1.2 — Reconcile deployed schema, content and purchased cohorts

- **Objective/rationale:** determine what production actually runs and what existing customers own before migration or commercial conversion.
- **Allowed scope:** an explicitly authorized, sanitized read-only operational report: deployed hashes, schema/migration history, item/grant counts and terms, pending orders, external/manual bundles and backup evidence. No secrets/customer records in repository docs.
- **Protected:** all production data, sessions and financial state; no checkout, provider verification, test-user creation or import.
- **Dependencies:** operator-authorized environment/access; D06/D07; local source is not a substitute.
- **Required tests:** source/deployment diff, total reconciliation, FK/orphan/duplicate-key read-only checks, documented report completeness and data minimization.
- **Acceptance:** legacy permanent/subscription/manual cohorts quantified, schema/provider identified, unknowns assigned owners, financial totals reconciled without alteration.
- **Rollback:** revoke temporary read-only access and remove only approved sensitive exports under a separate retention policy; keep sanitized report.

### T1.3 — Finalize fixed-model pricing, access and device policy details

- **Objective/rationale:** make the fixed model executable without inventing prices, renewal terms or device-change limits.
- **Allowed scope:** specifications of base prices/discount tiers, goal bundles, 12-calendar-month boundaries, included learning/practice/mock benefits, overlap/renewal, Reading/legacy transition, device replacement/recovery and Google entry posture.
- **Protected:** fixed model; existing customer terms and user identities; no offers/configuration changes.
- **Dependencies:** T1.2 commercial evidence; D06–D10.
- **Required tests:** worked quotes for one/two/all subjects, repeated/owned subjects, discount thresholds/rounding, payment-start/end examples including leap dates, Reading additions, device loss/recovery and two-tab scenarios.
- **Acceptance:** all policy branches have expected outcomes; rates increase progressively from two subjects; recommended bundles specify actual subject sets; unresolved exceptions prevent only dependent work.
- **Rollback:** version policy documents; no customer-visible effect before activation.

## Phase 2 — compatible schema and API contracts

### T2.1 — Add exam/syllabus versions, ordered sections and immutable passages

- **Objective/rationale:** persist rule/content provenance and shared passage context while retaining current history.
- **Allowed scope:** Cent-specific additive entities/migrations/contracts; rule/section snapshots; passage/revision and grouping; stable subject-to-version/topic coverage mappings; compatible result readers.
- **Protected:** global contract; original ResultJson, question options and content/import keys; no live content replacement or broad API-host changes.
- **Dependencies:** T1.1; SQL plan based on T1.2; stable Reading key and review schema approved.
- **Required tests:** old JSON deserializes; snapshots survive source edits; passage/group integrity; mixed versions rejected; SQL Server and SQLite model behavior; migration creates only reviewed Cent objects.
- **Acceptance:** legacy and new attempts are unambiguous; section/rule/content snapshots immutable; current clients safely read compatible responses or receive an explicit unsupported-format boundary.
- **Rollback:** disable creation of new-format attempts while retaining additive schema and old reader paths; no destructive Down migration.

### T2.2 — Add subject offers, bundle quotes/order lines and finite grant scope

- **Objective/rationale:** represent the required purchases atomically; one-grant-per-order cannot encode several independent subjects by simple duplication.
- **Allowed scope:** Cent offer/subject mapping, versioned progressive price rules, degree/goal presets, immutable quote/order items, purchased coverage and entitlement items, explicit term/start/end fields; additive legacy discriminators and APIs.
- **Protected:** gateway authority/reference/amount evidence, existing order/grant rows, historical permanent/subscription terms and current verification endpoints.
- **Dependencies:** T1.2/T1.3; T2.1 subject/version mapping.
- **Required tests:** line/grant uniqueness, FK validity, duplicate subjects, complete grant set per settlement, old order readers, idempotency bound to selected set/quote; SQL Server migration/replay on clone.
- **Acceptance:** one paid order can describe the immutable selected subjects, discount-policy revision and 12-month term; no mutation of old money or scope; existing constraints handled deliberately.
- **Rollback:** stop new quotes/checkouts, retain old settlement paths and all additive records; maintain readers for new orders already created.

### Deferred — Device registration and study-lease contracts (not in current roadmap)

**Status: deferred by explicit product decision. Do not implement, audit further, or include in current release acceptance. Preserve existing authentication, session, and watermark behavior.**

- **Objective/rationale:** provide durable server data for two devices, controlled changes and one study session.
- **Allowed scope:** Cent device/proof/replacement-audit records, study lease/revocation concurrency fields, enrollment/status/recovery contracts, privacy/retention documentation.
- **Protected:** GoogleSubject/UserId/session proof correctness, existing notes/orders and shared Lerona identity/device systems; no browser fingerprint dependency by default.
- **Dependencies:** T1.3; chosen multi-instance atomicity/privacy design; T1.2 production provider.
- **Required tests:** uniqueness/atomic lease admission, stale/replayed proofs, max-device concurrent enrollment, replacement audit, old session transition, SQL Server locking/constraints.
- **Acceptance:** a device is distinguishable from a tab/session token; concurrency semantics and recovery are explicit; no blanket account recreation.
- **Rollback:** stage enforcement independently from schema; retain device/audit records and viable auth recovery; never drop evidence to unlock accounts.

## Phase 3 — functional services

### T3.1 — Implement versioned assessment assembly, timing and raw results

- **Objective/rationale:** turn the current short mixed simulator into a separately identified full official-format mock while preserving short practice.
- **Allowed scope:** CentPractice and version contracts, selection quotas/passage groups, server section transitions/deadlines/answer persistence, raw scoring and compatible outcome metadata; minimal controller wiring only.
- **Protected:** existing snapshots/legacy scoring/results, deterministic mastery meaning, auth/commerce and approved visual styling.
- **Dependencies:** T2.1; T1.1 expiry/submit policy; validated content gate before learner activation.
- **Required tests:** exact ordered blueprint, no duplicates/shortfall fallback, five choices, passage integrity, no answer-key leak; fake-clock early advance/no time transfer/no backtracking; reload/network loss/multi-tab races; submit idempotency, ownership and negative/blank scoring; legacy regression.
- **Acceptance:** current-format mock cannot start with insufficient valid items; server enforces all section rules; expired behavior follows approved policy; separate accuracy/raw labels; legacy practice unchanged unless explicitly approved.
- **Rollback:** prevent new-format starts and allow pinned old/new in-flight attempts to complete via compatible handlers; retain stored snapshots.

### T3.2 — Implement required pricing, one-time checkout and 12-month subject grants

- **Objective/rationale:** satisfy individual/custom/recommended purchases using existing payment reliability.
- **Allowed scope:** server quote/tier resolution, selected-subject validation, existing CentPayments settlement to complete grant set, CanRead/eligibility finite subject rules, benefits checks, compatible library/history fields; no style changes.
- **Protected:** verified provider result, stored IRR amount/provider/reference, user/request idempotency, legacy paid/pending order snapshots; no new subscription/lifetime/PDF-only offering.
- **Dependencies:** T2.2, T1.3, explicit legacy/Reading policy; T2.1 version coverage.
- **Required tests:** discount starts at two distinct subjects; all tier boundaries and tampering; expired quote; conflicting retry set; same-key concurrency; partial-grant failure rollback; unknown provider/reference replay; end-exclusive 12-month dates/renewals; expiration repurchase; direct URL denial; legacy and Reading access regression.
- **Acceptance:** server alone prices/settles; one bundle payment yields exactly its reviewed subject set atomically; every new purchase has approved 12-month interval; no stale permanent/subscription guard prevents correct access/renewal.
- **Rollback:** stop new offers/quotes while honoring stored order terms and callbacks; retain grants/line readers; reconcile provider crash windows before any database restore.

### Deferred — Enforce two devices and one concurrent study session (not in current roadmap)

**Status: deferred by explicit product decision. Do not implement, audit further, or include in current release acceptance. Preserve existing authentication, session, and watermark behavior.**

- **Objective/rationale:** apply nontransferable study access with controlled, recoverable enforcement.
- **Allowed scope:** enrollment/replacement, atomic study admission/heartbeat/expiry/takeover, per-request checks for protected lessons/passages/practice as policy defines, audit and minimal client state integration; watermark consistency improvements through existing readers.
- **Protected:** public browsing, account recovery/payment reconciliation, saved answers/notes, Google validation; no claim of screenshot-proof content.
- **Dependencies:** T1.3 and approved protected-resource boundaries; existing authentication/session behavior remains unchanged.
- **Required tests:** first/second/third device; concurrent enrollments and lease acquisitions across API instances; same-device tabs, network partition/heartbeat timeout, stale lease/proof, replacement cooldown/recovery, revoked/expired grants, no foreign-user takeover; watermark in image/source/passage contexts.
- **Acceptance:** no more than two registered devices and one active study lease; support policy is auditable; content requests enforce the server decision; device transitions preserve attempts/notes and do not double-charge.
- **Rollback:** controlled enforcement gate rollback with explicit owner sign-off; preserve audits/registry and account recovery, not silent token or grant deletion.

### Deferred — Align Google-based entry and preserve existing accounts (not in current roadmap)

**Status: deferred by explicit product decision. Do not implement, audit further, or include in current release acceptance. Preserve existing authentication, session, and watermark behavior.**

- **Objective/rationale:** fulfill the Google account requirement without losing current purchase/progress ownership.
- **Allowed scope:** approved customer entry policy, compatible existing GIS/code modes, verified existing-account transition/recovery and device proof binding; no new identity provider.
- **Protected:** no automatic email-based account linking; existing UserId/grants; OAuth state/PKCE/nonce/replay/headers, admin bootstrap and shared Lerona auth.
- **Dependencies:** Deferred; no dependency in the current release plan.
- **Required tests:** new/returning Google identity, email conflict, disabled mode, proof/replay/origin, existing password-customer preservation, cancellation/session expiry/logout, exact callback at root/subpath, recovery with registered-device loss.
- **Acceptance:** supported customer accounts retain all history/purchases; production Google behavior is separately evidenced; no unchecked email merge or frontend-only auth rule.
- **Rollback:** retain previous validated login mode/recovery under approved policy while preserving identity IDs/device audits; no account deletion.

### T3.5 — Add source-dated factual calendar; planner only if selected

- **Objective/rationale:** expose verified sessions separately from macro-periods; avoid fabricated deadlines or implying booking through Itatest.
- **Allowed scope:** if approved, Cent calendar records/read API with official URL/retrieval/effective dates, timezone, session/university/format/deadline/status; independently scoped planner CRUD only after an explicit product decision.
- **Protected:** official registration/payment sites, personal study data and fixed monetisation model; no automatic booking or reminder integration assumed.
- **Dependencies:** D11, calendar maintenance owner, source freshness policy, T2.1 cycle identity.
- **Required tests:** dynamic seats/stale data, no dates for unknown future windows, Italy DST conversions/Tehran display, result versus registration deadlines; planner owner isolation if included.
- **Acceptance:** stale/unknown status is visible, official links retained; personal targets are never labelled official sessions. Planner remains absent if unselected.
- **Rollback:** disable factual calendar/read model; retain optional personal records/export policy; core learning unaffected.

## Phase 4 — reviewed content

### T4.1 — Validate Chemistry draft and close its syllabus gaps

- **Objective/rationale:** current five local chapters are a draft covering mainly one official nucleus.
- **Allowed scope:** separately reviewed content branches, scientific key/explanation/distractor review, missing Chemistry nuclei, item-to-syllabus evidence, review metadata and proposed immutable revisions.
- **Protected:** existing source bytes/IDs, published lessons, attempt snapshots, notes/grants; no live replacement or unsupervised fifth-option generation.
- **Dependencies:** T1.1 taxonomy and qualified reviewer; T2.1 revision model for packaging.
- **Required tests:** independent calculation/unit/key checks, one correct option, five plausible choices for official-format items, explanation completeness, duplicate/template-family review and coverage checklist.
- **Acceptance:** each required subtopic has reviewed coverage or an explicit unreleased gap; reviewer/date/source/license recorded; no “complete Chemistry” claim based on five draft chapters.
- **Rollback:** retain original draft/release; deactivate a new revision for future starts without changing historical snapshots/anchors.

### T4.2 — Validate and map Mathematics, Reasoning, Biology and Physics

- **Objective/rationale:** turn structural source coverage into reviewed skills/questions; remove false confidence from raw item counts.
- **Allowed scope:** all existing topics queued in content annex; scientific/distractor/difficulty/language review; mark supplementary content; versioned new official-format items and semantic-duplicate families.
- **Protected:** original corpus/quarantine findings/IDs; no automatic deletion of overlapping content or reset of mastery.
- **Dependencies:** T1.1/T2.1; reviewers and licensing evidence.
- **Required tests:** independent keys/solutions, source/topic references, all official subtopic mapping, five choices, scientific notation, sufficient independent skill examples rather than parameter-only variants.
- **Acceptance:** published coverage claims match reviewed evidence; all math-medium labels are reassessed or explicitly uncalibrated; existing practice can remain separately labelled.
- **Rollback:** restore previous content activation/map release while retaining old question/review identities and progress evidence.

### T4.3 — Author and validate Reading passages/questions

- **Objective/rationale:** supply missing B2 comprehension content and coherent shared passages.
- **Allowed scope:** licensed/original passages, source/genre/level/skill metadata, grouped questions, independent answer/explanation review and publication readiness.
- **Protected:** reasoning identity/content and existing reader/PDF grants; no copied confidential official question bank.
- **Dependencies:** T2.1/T3.1; reviewer/rights owner; T1.3 Reading sales/coverage decision.
- **Required tests:** passage revision snapshot, group completeness, no orphan questions, consistent level/language, one correct/five plausible options, passage rights and source attribution.
- **Acceptance:** enough independently reviewed material for the approved blueprint and practice/reuse policy; no artificial item duplication to satisfy quota.
- **Rollback:** disable new Reading starts/sales if not ready; retain sold scope and already-created passage snapshots for support/completion.

### T4.4 — Integrate versioned content import and admin review

- **Objective/rationale:** replace hardcoded completeness assumptions without replacing the existing import/provenance system.
- **Allowed scope:** approved schema-aware package manifest, dynamic version completeness validation, immutable revision/upsert strategy, dry-run diffs, review/publish controls and authorized isolated import; minimal admin functional controls for options/passages/versions.
- **Protected:** same-hash idempotency, raw checksum enforcement, stable filenames/namespace, manual/legacy content, note positions, historical results; no production import in this task.
- **Dependencies:** T2.1 and T4.1–T4.3; approved mastery denominator/retirement policy.
- **Required tests:** raw checksums, duplicate/broken mapping/option rejection, repeated import idempotency, omitted question behavior, old package readability, changed section order and note anchors, mastery active-filter regression, no unintended auto-publication.
- **Acceptance:** source count/five-subject/four-option constants are replaced by reviewed release definitions; dry run lists every publish/retire/update; importing cannot silently overwrite published revisions.
- **Rollback:** restore activation pointers/manifest to prior release; retain new immutable records; do not rerun the current destructive-in-effect upsert as a rollback shortcut.

## Phase 5 — existing UI alignment, separate visual review

### T5.1 — Expose new assessment/content state in the approved design system

- **Objective/rationale:** make section timing, Reading passages and version-safe results understandable and usable.
- **Allowed scope:** typed contract consumers, minimal functional wiring followed by separate presentation changes in ExamExperience/AssessmentUI/results/readiness/dashboard/catalog; approved version labels and English LTR passage layout.
- **Protected:** server scoring/timers/permissions, controller request identities, legacy reader/results, brand assets/tokens; no new metrics or fake progress.
- **Dependencies:** T3.1/T4.4 and T1.1 labels; existing authentication/session behavior remains unchanged.
- **Required tests:** section transition/lock/expiry/reload, clear-null answered meter, keyboard/focus, long passages/media/notation, raw versus accuracy/legacy labels, incompatible comparison suppression, both themes, reduced motion, 320–1440px and study-return regressions.
- **Acceptance:** UI reflects authoritative section/rule state and supported content; old results still render; visual review is distinct from functional acceptance.
- **Rollback:** revert presentation independently; route new attempts only to compatible readers and retain old result screens.

### T5.2 — Replace old offer presentation with subject/bundle/12-month flows

- **Objective/rationale:** align catalog/checkout/account with the mandatory model, reusing verified payment recovery.
- **Allowed scope:** individual subject selection, custom bundle selection/discount quote, degree/goal recommendations, term/coverage/expiry display, existing account/access feedback and existing admin price-policy/offer controls; split functional wiring from visual refinement.
- **Protected:** same-order recovery/IRR snapshot/provider proof, legacy purchase history and account IDs; no substitution with subscription/permanent/PDF-only labels or prices.
- **Dependencies:** T3.2, T1.3 policies; reviewed Reading offer readiness.
- **Required tests:** selection/quote recalculation, two-subject discount visibility, expired/tampered quote, selected versus owned scopes, 12-month dates, duplicate clicks/lost response/429, old pending order recovery, expired repurchase, existing authentication/access regression and both theme/base-path journeys.
- **Acceptance:** new storefront sells only approved subjects/bundles with explicit finite terms; recommendations are real configured sets; trusted server access remains separate from payment history.
- **Rollback:** disable new checkout entry while retaining verification/history/read access; old offers are not automatically reactivated as the fallback product strategy.

### T5.3 — Optional calendar/planner and separate admin presentation

- **Objective/rationale:** apply approved UI patterns to separately selected capabilities; keep old visual Phase 8 distinct.
- **Allowed scope:** only approved T3.5 routes and functional admin views needed by T4.4/T5.2; broad administration rework requires its own scope.
- **Protected:** route/auth boundaries, official-source metadata, content/commerce services and approved foundations.
- **Dependencies:** T3.5 if selected, T4.4/T5.2 data contracts, owner visual scope approval.
- **Required tests:** no stale-date assertions, access/role isolation, keyboard/native forms, both themes/RTL/LTR, responsive screens, no destructive action invoked by visual tests.
- **Acceptance:** no inspiration-only features are presented as implemented; functional permissions and values remain authoritative.
- **Rollback:** revert optional route/presentation independently, preserve records and main learning/checkout access.

## Phase 6 — operational acceptance and release

### T6.1 — Rehearse migration, compatibility and restoration on isolated clones

- **Objective/rationale:** verify production-provider behavior and full regression before asking to deploy.
- **Allowed scope:** explicitly authorized isolated SQL Server restore/clone, dry-run migration/import, disposable accounts/provider sandbox, builds/tests and evidence; agreed backup/RPO/RTO rehearsal.
- **Protected:** actual production DB/provider/customer accounts; shared host/Lerona data; no real financial transaction by default.
- **Dependencies:** T1.2 and required T2–T5 tasks, reviewed SQL/release manifests and operator test configuration.
- **Required tests:** before/after hashes/counts of results/orders/grants/notes; old/new/in-flight readers; SQL constraints/multi-instance pricing concurrency; Cent API/curriculum/commerce/gateway suites; existing authentication regression; Lerona regression; frontend unit/type/build root+subpath; browser assessment/courses/curriculum/progress/notes/study-return/commerce/auth; cross-browser/accessibility and controlled real Google/sandbox checks.
- **Acceptance:** all required invariants pass with connected versus injected evidence labelled; known lint debt and any failures are explicitly dispositioned; restoration is demonstrated, not just a backup file listed.
- **Rollback:** discard only approved disposable clones using operator controls; rehearse application rollback with additive schema and reconcile simulated post-backup purchases.

### T6.2 — Prepare reviewable release and obtain deployment approval

- **Objective/rationale:** provide a concrete go/no-go package with bounded activation and rollback.
- **Allowed scope:** release notes, signed-off artifacts/SQL/import diffs, operator runbook, monitoring/abort criteria and approval request; actual deployment only under a later explicit instruction.
- **Protected:** all live systems until approval; callback/verification continuity and legacy customer evidence during any later rollout.
- **Dependencies:** T6.1 passing evidence, product/science/visual acceptance, source freshness recheck, named release/rollback owners.
- **Required tests:** artifact/hash parity, configuration checklist without secrets, rehearsed staged activation/disable sequence, rollback/new-payment reconciliation tabletop and acceptance traceability.
- **Acceptance:** reviewer can see exactly which database/content/app changes are proposed and how to stop/recover; no unsupported official-compliance, zero-downtime or screenshot-prevention claim.
- **Rollback:** if approval is withheld, leave production unchanged. If later approved, execute the rehearsed application-first rollback and preserve new financial/identity/content evidence; destructive schema rollback is not automatic.

## Explicitly deferred scope — do not implement in Phases 1–6

- Google sign-in mode changes, Google-only account transitions, and account migration.
- Two-device registration, device proofs, device replacement/cooldown/recovery, and device administration.
- One-concurrent-study-session leases, heartbeats, takeover, and related enforcement.
- New nontransferability enforcement and watermark expansion.

Existing authentication, session, account, and watermark behavior is protected. Regression tests may verify that these existing behaviors remain intact, but no new functionality or policy changes are authorized.

## Deferred product choices

Independent saved-question collections, personal planner/reminders, automated AI advice, richer mathematical rendering, refunds/reconciliation automation and broad administration redesign are inventoried but not automatically required for exam/monetisation alignment. Add a task with all seven contract fields before any such implementation. No new feature is authorized by appearing in an inspiration image or an audit table.


## Revision history

- 2026-11-20: Superseded earlier Google/device enforcement requirements with an explicit deferral. Removed those items from current release acceptance while preserving existing authentication/session/watermark behavior. Clarified Phase 1 decision gates for pricing, bundle composition, 12-month term details, benefits, and Reading/legacy transitions.

## Phase 1 reconciliation and active backlog

Added2026-11-20 for the current comprehensive Phase1 instruction. This section is the active scope/dependency correction; all earlier task prose remains a historical record. No phase number from the older visual programme is renamed. [Phase 1 decision register](PHASE_1_DECISION_REGISTER.md) is authoritative for approved versus pending details and links all sixteen deliverables.

### Current task meaning and status

| Task | Current objective and allowed documentation scope | Protected areas | Dependencies | Validation | Acceptance / current status | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| T1.1 | Finalize five exam/version/state/score/legacy/fixture specifications with explicit approved decisions | Existing code, attempts/results/mastery/Practice/auth/data | Three official sources and current product instruction | Blueprint sums, exact scoring, state/zero/legacy fixtures | Approved timing/metric/preservation requirements incorporated; final-timeout result profile and precise technical recommendations still flagged | Preserve historical log and dated source evidence; document any later policy revision |
| T1.2 | Audit local Cent commerce; specify one-time subjects/bundles,12month items, pricing and legacy/Reading reconciliation in four docs | All prices/products/purchases/grants/callbacks/identities; no DB query | Phase0 audits, safe Cent-specific source, fixed model | Candidate quotes/line sums, term fixtures, duplicate/retry/legacy scenarios | Documentation prepared; prices/rates/benefits/term/refund/Reading decisions pending; actual customer cohorts explicitly unknown | No customer effect; retain original financial/history evidence |
| T1.3 | Specify target architecture/API/content/data-model/migration in four docs plus risk/visual/decision coordination | Source/schema/runtime/visual/Lerona unchanged | T1.1/T1.2 contracts; explicit unresolved branches | JSON/links/arithmetic/decision/path consistency and file integrity | Implementation contracts prepared for review; dependent configuration/activation blocked until decisions/evidence | Revise documents through decision history; no schema to roll back |

The previous T1.2 operational-report task becomes evidence gate **P1-T03**. It was not performed and is not needed to invent customer counts. The previous T1.3 commercial/device task is superseded: commercial decisions now live in P1-C01–C13, architecture in T1.3, and device/Google/session/sharing/watermark work remains fully deferred.

### Bounded future backlog — no execution authorization

Every row inherits strict Cent-only scope, preservation of current auth/session/watermark and all historical rights/results/content/note IDs, no dependency upgrades/refactoring, and no Lerona changes/tests/DB commands. Earlier residual “Lerona regression” or shared-host modification instructions do not authorize them. External assurance, if needed, must come from the authorized host owner; inability to obtain it is a release limitation.

| Task | Objective / allowed future scope after explicit authorization | Protected | Dependencies | Required validation | Acceptance | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| Evidence gate P1-T03 | Operator supplies sanitized deployed Cent version/schema/cohort/pending-payment/restore report | No database operation under Phase1; no secrets/PII or Lerona inspection | Explicit operator authorization and isolation boundary | Completeness, legacy/manual scopes, financial totals, schema parity | Known facts distinguished from unresolved records; no guessed rights | Retain sanitized findings; sensitive handling only under separate retention policy |
| T2.1 | Additive Cent exam/rule/content/passage/section and calendar metadata schema/contracts | Original results/IDs/notes/content and shared objects | Reviewed T1.3 model, selected T11 policies, target/provider evidence | Authorized clone-only old/new readers, snapshots, dependencies/indexes | No semantic legacy changes; complete new snapshots | Disable new starts; retain issued readers/data; no destructive Down |
| T2.2 | Additive offers/price policies/presets/quotes/order lines/subject items | Old amounts/provider/authority/grants/terms | Approved dependent P1-C policies, actual legacy/target evidence | Unique constraints, exact sums, all-or-none settlement on clone | One order supports distinct independent subject terms without changing old grants | Stop new offers, keep callbacks/history/item readers |
| T3.1 | Versioned Mock Exam assembly, acknowledgment/transition/finalisation services within existing Cent | Legacy diagnostic/Practice/60min handlers and mastery | T2.1, selected final timeout, eligible content before activation | F01–F21, server clocks/races/keys/owner/idempotency | All approved rules enforced; no shortfall fallback | Stop new starts; continue original issued rules |
| T3.2 | Server quote/pricing/settlement/access extension within existing Cent services | Financial proofs, old rights, auth | T2.2, all sale-dependent commercial decisions | CP01–CP12, dates, references, crash recovery/SQL concurrency | Approved one-time subject/bundle model; no silent conversion | Preserve original pending/paid orders and item-aware readers |
| T3.5 | Source-verified factual calendar only if UI/maintenance scope approved | Official booking/providers/personal data | P1-T04 owner/freshness, T2.1 metadata | Unknown/date precision/DST/conflict/stale source scenarios | No fabricated sessions or planner/reminder promise | Disable projection without losing source evidence |
| T4.1–T4.3 | Independent Chemistry/other-subject review and new licensed Reading groups | Existing bytes/IDs/lessons/snapshots/rights | Reviewed content model, qualified reviewers/licenses | Keys/options/skills/semantic families/dependency completeness | Review-backed eligible release, truthful coverage | Retain old release; withdraw only future activation |
| T4.4 | Extend existing importer/admin for immutable release/dry-run/review | Import namespace/history/published anchors/mastery | T2.1 and reviewed content, denominator decision | Same-hash idempotency, stable IDs, no omission republish/retire | Approved manifest can publish without overwriting old evidence | Activation-pointer rollback with old payloads retained |
| T5.1 | New assessment/Reading/result state consumers, then separate visual refinement | Server authority/legacy results/brand/auth | T3.1/T4.4, approved labels and benefit rules | Acknowledgment/locks/RTL-LTR/mobile/theme/focus/legacy history | UI reflects actual contract; visual acceptance separate | Revert presentation while retaining compatible readers |
| T5.2 | Subject/bundle/term checkout/history consumers, then separate visual review | Payment recovery, legacy rights, brand | T3.2/approved offer readiness | Quote/retry/expiry/access states, IRR/root/subpath journeys | No permanent/subscription new-sale substitution | Disable new entry, retain verification/history/access |
| T5.3 | Optional calendar/minimal required admin presentation | Scope/auth/publication boundaries | Selected T3.5 and functional admin contracts | Stale/unknown/owner/admin/focus/theme states | No unapproved planner/bookmark/broad visual Phase8 | Revert optional presentation independently |
| T6.1 | Explicitly authorized Cent-only clone/integration/restore rehearsal | Live systems/Lerona; no live purchases by default | Reviewed artifacts and resolved release gates | Financial/history/notes hashes, SQL races, old/new/inflight reads, Cent/client regression | Provider/restore/compatibility evidence labeled with limitations | Operator-controlled clone disposal; compatible app-first recovery |
| T6.2 | Concrete release/runbook and later approval package | No deployment until separate explicit authorization | T6.1, product/content/visual approval, operator owners | Artifact/allowlist/source freshness/rollback tabletop | Bounded go/no-go package, no readiness claim from docs alone | Withhold activation if incomplete; retain all paid/history evidence |

Phase1 documentation can be reviewed now. Unanswered commercial/final-timeout choices block only dependent implementation/activation; unknown production cohorts block executable migration/legacy conversion. The approved fixed model and deferred-feature list are not reopened. No Phase2 task, build, runtime test, database operation, migration, visual change or deployment was begun by this update.

## Commercial finalization and current gates

Added **2026-11-20** after the Phase 1 package. This section and the latest [decision register](PHASE_1_DECISION_REGISTER.md) supersede conflicting earlier plan/status rows, including the earlier active-backlog description of pending prices/rates/Reading and unknown customer cohorts. Earlier task prose, dependencies and revision entries remain historical.

| Area | Current approved baseline / future dependency |
| --- | --- |
| T1.2 prices/currency | **APPROVED P1-C01:** all six initial subject reference prices490,000 Toman =4,900,000 integer IRR. Display Toman at IRR/10; canonical/provider amounts IRR. Earlier490,000IRR proposal is superseded |
| T1.2 discount tiers | **APPROVED P1-C02:** n=1..6 distinct subjects0/5/10/15/20/25%; same custom/recommended schedule, no extra preset discount. Exact table/fixtures recalculated |
| Launch customers/Reading | **APPROVED P1-C09:** owner confirms zero registered users/customers/buyers and no historical customer entitlements needing grandfathering. No customer cohort transition, compensatory/free Reading grants or grandfathering workflow. Reading is independently purchasable with own subject/syllabus/content and12month item, available in custom/recommended selections at same price/tier rules |
| P1-T03 / E0 evidence | Future authorized Cent deployment/schema/provider/isolation/backup and retained development/test/financial-record evidence only. Remove historical-customer cohort reporting/conversion from launch dependencies; no DB audit has been performed |
| T2.2 / T3.2 future commerce | Approved prices/tiers can inform later reviewed configuration; still blocked on dependent rounding, benefits, term/renewal, quote/checkout, refund and other pending policies plus explicit implementation authorization. Preserve all existing records; no old Rial amount multiplied or silently converted |
| T4 / T5 Reading/content/UI | Independent sixth subject and price/tier scope fixed. Reviewed licensed content, specific academic presets, benefits and functional contracts still required; display Toman accurately. No legacy grandfathering UI/data path needed |
| Scope | Documentation only; no Phase2, schema/source/UI/payment/deployment work authorized. Google/device/session/sharing/watermark enhancements remain deferred; no Lerona operations |

Remaining commercial gates are **P1-C03** rounding/allocation/fractional-Toman formatting/tax-fees; **P1-C04** academic preset compositions; **P1-C05** benefits/full-mock coverage; **P1-C06/C07** exact12month start/end and renewal/overlap; unresolved **P1-C08** normalization/owned-subject checkout; **P1-C10** refunds/cancellations; **P1-C11** quote expiry/checkout; **P1-C12** access expiry during a mock and later review; **P1-C13** content-update coverage. Final-timeout T11-D02 and unrelated technical review gates remain pending. No automatic approval or production readiness follows from this update.

Preserve historical attempts/results/content IDs/notes/mastery and existing development/test/financial evidence. No customer-migration workflow or database cleanup is introduced. Static document validation only; no application code or database change and no Lerona project/code/configuration/database/functionality change.

## Execution Phase 1 — scoped implementation status

Added **2026-11-20** after the owner's explicit exam-infrastructure implementation instruction. This section supersedes earlier blanket no-implementation authorization only for this slice. Historical roadmap numbering is retained; this does not start the remaining content, commerce, calendar, visual or deployment tasks.

| Scope | Current status |
| --- | --- |
| Exam-only portions of T2.1/T3.1 | Implemented in Cent.Module: version definitions, immutable snapshots, section timing/progression, acknowledged answers, exact scoring, owner APIs and deadline worker |
| Compatibility | Reuse existing attempt/question storage; separate companions/results and legacy handlers/mastery; no historical result recalculation or content ID changes |
| Migration artifacts | Six additive Cent tables and two disabled blueprint seeds; one migration/designer/snapshot and idempotent forward SQL generated offline, reviewed and NOT APPLIED |
| Verification | Cent.Module build succeeded; 40 isolated module-only tests passed, including HTTP and offline migration/model validation; no shared API/Lerona builds/tests or DB connections |
| Start/review activation | BLOCKED pending T11-D02, P1-C05/C12, reviewed eligible content and later authorized target/migration/SQL Server rehearsal; flags/configuration not changed |
| Unstarted work | Reading production/content migration/importer, commerce/payment/entitlement implementation, frontend/visual redesign, calendar and deployment; deferred auth/device/session/watermark features remain untouched |

See [complete implementation report and file inventory](EXECUTION_PHASE_1_EXAM_INFRASTRUCTURE.md). Later operator review must establish actual Cent target/history/backup and exercise SQL Server transactions/filtered-index contention on an explicitly authorized isolated database. Migration generation/testing here does not authorize application. Keep issued-attempt readers/worker available on rollback; archive versions to stop starts. No Lerona code, configuration, database or functionality was modified.
