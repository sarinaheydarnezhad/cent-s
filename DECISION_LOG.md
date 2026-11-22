# Phase 0 decision log

> **Current scoped execution authorization (2026-11-20):** The owner's Execution Phase 1 instruction authorizes the CEnT exam infrastructure implementation described in [the implementation report](EXECUTION_PHASE_1_EXAM_INFRASTRUCTURE.md). Earlier documentation-only statements remain historical. Database connection/application, deployment, commerce, content production/migration, visual redesign and Lerona changes remain unauthorized. Pending final-timeout/admission decisions have not been approved by this instruction.

Date: 2026-11-20. This log belongs to the **CEnT update audit**, not `docs/refinement/DECISION_LOG.md`. “Fixed” records explicit user requirements; “recommended” is not approval. No implementation was authorized or performed.

| ID | Status | Decision / rationale | Dependency or approval needed |
| --- | --- | --- | --- |
| D01 | Fixed | Phase 0 is read-only except these requested documentation files. No code/style/data/import/migration/deployment. | None; applied. |
| D02 | Fixed | Monetisation is one-time individual subjects/custom progressive-discount bundles/recommended goal bundles, 12-month access, Google-based accounts, two devices, one study session, controlled changes, nontransferability, watermark. Existing subscriptions/permanent grants are implementation deltas. | Model is not reopened for approval. |
| D03 | Verified fact | Current official structure begins November2026 and adds Reading; O2 opening amendment governs current cycle while older body/PDF remains historical. | Recheck sources before release. |
| D04 | Recommended; pending details | Distinguish exam family, administration cycle, admissions year, syllabus revision and content release. Pin attempts and purchased scope; label current attempts legacy educational assessments. | Owner approves version keys/default labels and legacy policy in T1.1. |
| D05 | Recommended; pending | Preserve old result JSON/accuracy; add raw official-format points only to new rule version. No local “official normalised” score. Define expiry/auto-submit/offline/recovery behavior explicitly. | T1.1; authoritative timer/attempt transitions and UX acceptance. |
| D06 | Required evidence; unavailable | Obtain deployed schema/version, actual products/customer grants and external/manual bundle inventory through authorized read-only reporting. Local package/preview is not production. | Operator access/report; blocks live data migration and old-customer conversion, not documentation. |
| D07 | Pending commercial transition | Preserve purchase evidence; approve legacy permanent/subscription cohort treatment and Reading coverage for previously purchased subject sets. Exam upgrades must not silently revoke rights/reset clocks/charge. | User approves concrete transition after T1.2 evidence; no automatic truncation or grant assumed. |
| D08 | Pending policy details | Base prices, progressive tier rates beginning at two subjects, goal-bundle subject sets, quote expiry/rounding, purchased learning/practice/mock benefits and duplicate/overlap treatment. | Product input in T1.3; no rates invented. |
| D09 | Pending policy details | Define twelve-calendar-month arithmetic/start/end boundary, leap/month-end handling, repeat purchases and renewals. Recommendation: verified-payment start, end exclusive, no auto billing. | Product approval; 12-month duration itself is fixed. |
| D10 | Pending policy details | Two-device registration/proof and controlled replacements, lost-device recovery, support exceptions/retention; one study lease with multi-tab/network recovery rules. Clarify Google-only entry versus Google-supported existing accounts. | Product/security implementation review; fixed limits remain mandatory. |
| D11 | Pending product scope | Factual source-dated calendar is useful; planner, reminders and saved-question collections are separate unimplemented capabilities. | Select scope/maintenance owner before T3.5/T5.3; no external booking assumed. |
| D12 | Recommended architecture | Extend Cent entities/importer/payment/access/mastery/UI, preserve stable GUID namespace and cent_* isolation; no parallel systems. | Approve detailed additive schema and API plan before T2.*. |
| D13 | Required review; incomplete | Chemistry is draft; all subjects need subtopic mapping, independent keys/distractors/license review and semantic template-family assessment. Current four-option bank cannot be declared faithful official-format content. | Qualified reviewers/rights evidence; gates content publication. |
| D14 | Verified local status | Prior visual programme reached Phase7 locally; Phase7 owner visual review pending; Phase8 administration unstarted. Keep brand/tokens/assets. | New functional states receive separate visual review; no old approval inferred beyond written evidence. |
| D15 | Applied reporting decision | Final response Persian as explicitly requested; docs English for repository continuity. Current request takes precedence over historical English-only reporting text. | None. |
| D16 | Applied evidence policy | Static source observations and historical runtime reports labelled separately. No mutation-producing browser/backend test/build/start/import in Phase0; only file/JSON/hash checks performed. | Later implementation tasks own appropriate fresh tests. |

## Evidence limitations / blockers

- **Backend source access is available:** `D:/Lerona/Backend`, commit `9134cf84fae970a166f1d3401e16dd0afc324fe8`; tracked source clean, pre-existing untracked `artifacts/`. Backend conclusions below source level are not blocked. Git ownership warning was handled with per-command `-c safe.directory=...` for read-only metadata; no persistent Git configuration changed.
- **Production schema, customer cohorts and running versions are unknown:** no production connection or deployment inspection performed. This blocks a safe executable live migration/retroactive purchase transition, not this audit.
- **CISIA detailed exceptions:** current HTML amendment and old downloadable PDF coexist; updated credit-expiry and other cycle-dependent registration exceptions need reconfirmation. Future individual sessions beyond the currently listed dates are unknown. No complete historical syllabus snapshot supports an exhaustive before/after subtopic diff.
- **Provider/runtime acceptance unknown:** current deployed Google sign-in mode/real round trip, live/sandbox Zarinpal, SQL Server multi-instance races and physical-device enforcement acceptance were not tested.
- **Content assurance incomplete:** counts/checksums/mappings and selected content observations are verified. Full scientific/semantic/license review is not complete and is not implied by manifest validity.

## Approval sequence

Complete this Phase 0 package → owner reviews T1 specifications and requests operator evidence → approve detailed version/commerce/device/legacy policies → approve scoped Cent backend/schema work with shared Lerona impact → implement/review functional and content changes → review affected UI separately → rehearse on clones → present concrete release artifacts for explicit deployment approval. This sequence does not ask for approval again for already fixed product requirements and does not authorize a later phase automatically.

## T1.1 addendum — exam versioning, scoring and legacy attempts

Added **2026-11-20**. The Phase 0 entries above remain historical records. This addendum records the present English-language, documentation-only T1.1 request. It does **not** approve implementation or begin T1.2.

Current scope corrections: D15's Persian final-report decision applied to an earlier request; the current T1.1 request requires **English throughout, including the final report**. The revised execution/monetisation audits explicitly defer Google sign-in changes and device/study-session/sharing/watermark enhancements. D02/D10/D12 and the earlier approval sequence do not reactivate that work or authorise any shared/Lerona changes. Some residual task prose in the revised documents still mentions deferred items; its explicit deferral controls. No such work is needed for T1.1.

### Deliverable register

| Document | Review scope |
| --- | --- |
| [T1_1_EXAM_VERSION_SPEC.md](T1_1_EXAM_VERSION_SPEC.md) | Source register/conflicts; historical/current blueprints; version/cycle/year/macro-period/session separation; content eligibility |
| [T1_1_SECTION_STATE_MACHINE.md](T1_1_SECTION_STATE_MACHINE.md) | Authoritative deadlines, transitions, locking, persistence, recovery and final timeout alternatives |
| [T1_1_SCORING_AND_RESULTS_SPEC.md](T1_1_SCORING_AND_RESULTS_SPEC.md) | Exact raw scores, independent ratios, normalisation boundary, mastery and comparison semantics |
| [T1_1_LEGACY_ATTEMPT_POLICY.md](T1_1_LEGACY_ATTEMPT_POLICY.md) | Evidence-based classification, unchanged values, running-attempt continuation and rollback |
| [T1_1_API_EXAMPLES_AND_FIXTURES.md](T1_1_API_EXAMPLES_AND_FIXTURES.md) | Illustrative JSON and F01–F21 acceptance scenarios; no live API/schema promise |

### T11 confirmed facts and fixed constraints

| ID | Authority/status | Record |
| --- | --- | --- |
| T11-F01 | Officially reverified 2026-11-20 | [October 2026 amendment](https://www.cisiaonline.it/en/cent/all-about-CEnT/CEnT-rules) applies 2026-11-01–2027-10-31; current six-section 65-question/140-minute structure overrides retained old structural text. Historical body establishes five sections/55 questions/110 minutes |
| T11-F02 | Officially reverified 2026-11-20 | [Announcement](https://www.cisiaonline.it/en/news/cent-s-changes-test-structure-and-macro-periods), dated 2026-11-02, corroborates initial Reading and five macro-periods. These are windows, not versions or invented sessions |
| T11-F03 | Officially reverified 2026-11-20 | [Structure/syllabus](https://www.cisiaonline.it/en/cent/cent-s/structure-and-syllabus) supports section timing/one-way progression, +1/−0.25/0 raw weights and macro-period-end normalisation. Itatest has no private CISIA normalisation dataset |
| T11-F04 | Source conflict; unresolved officially | Regulations §4.1.2 describes final timeout ending the test; §§4.1.5/4.2.3 require explicit submission for recorded/valid results. Syllabus release dates and old/general regulation release wording also differ. Do not invent an official resolution |
| T11-F05 | Static Cent-specific source confirmed | Current educational assessment has at most 20 questions, global hardcoded 60 minutes, question snapshots and correct/total integer Percentage; no complete version/section rules snapshot or server answer autosave established. Local source does not prove every deployed historical rule |
| T11-F06 | Fixed preservation requirement | Reliable historical version/rule snapshots retain original identity; otherwise explicitly legacy/unversioned. Preserve original results/answers/mastery meaning; no inferred old sections or retrospective scoring/comparability |
| T11-F07 | Fixed new-attempt requirement | New versioned full mocks freeze complete rules and content snapshots. Activation changes never alter already-started attempts |
| T11-F08 | Fixed boundary | Documentation outputs only; no application code, DB connection/data operation/migration, imports, purchases/entitlements/auth/session changes, redesign, Lerona/shared changes or T1.2 work |

### T11 decision register

All rows below are **proposals awaiting product-owner approval**, not fixed official facts or implementation permission. The detailed recommended behavior is specified in the linked deliverables; each policy must be versioned once selected. Decisions can be approved individually; only dependent future work waits.

| ID | Proposed policy | Unresolved choice / owner action | Dependent acceptance |
| --- | --- | --- | --- |
| T11-D01 | Internal keys `cent-s-2025-2026-r1`/`cent-s-2026-2027-r1`; preserve existing subject keys; new `reading`; default to explicitly activated current release; optional labelled historical practice | Approve naming, historical availability, display labels and `legacy_unversioned` classification label. No missing academic-year provenance is inferred | F01/F02/F15/F16; future version-aware start/history |
| T11-D02 | Continuous section activation with no ordinary pauses; final timeout freezes and scores acknowledged answers as EXPIRED, distinct from timely COMPLETED submission; no early global-submit command | **Select final timeout policy:** recommended expired raw feedback, or explicit-submission-only with no scored expired result. Official clauses remain ambiguous. Confirm continuous offline progression and absence of a pause/abandon shortcut | State table; F06/F09–F13/F21. Examples are conditional on recommended profile |
| T11-D03 | Server UTC decision under serialised attempt operation; strict `< deadline`; no grace; each answer/clear durably saved; revision/idempotency guards; advance/submit only acknowledged revision | Approve exact boundary, pending-answer handling, no offline backdating and no automatic outage time extension | F04/F07/F08/F14; future persistence/timer contract |
| T11-D04 | New `accuracy=C/(C+I)`, null if none answered; `completionRate=(C+I)/N`; optional named correct-of-total; exact quarter-points/decimal strings; half-up two-decimal ratio display | Approve vocabulary/rounding/representation. Legacy Percentage remains unchanged as correct/total, not reinterpreted | F05/F19/F20; scoring vocabulary |
| T11-D05 | Compare completed practice mocks only under same version/rule/timing/scoring/quotas/syllabus and approved content cohort; acknowledge uncalibrated form difficulty | Approve comparison signature/cohort ownership and exclusion of expired/incompatible/unknown attempts; no official equivalence | History comparisons; separate 55/65/legacy results |
| T11-D06 | Explicit per-version eligibility review; five options; frozen passage/group revisions; atomic groups; reject shortfall before start | Approve group assembly and review gate. Reading passage count/group sizes/reuse policy and qualified content reviewers are not established officially; historical full syllabus mapping is incomplete | F03/F17/F18; content activation. No content IDs/import records/lessons changed |
| T11-D07 | Drain existing attempts under original compatible handlers; preserve browser keys; retain new-version readers through rollback; incident compensation only as a separate linked new attempt | Approve release/rollback and support mechanics, including whether service incidents warrant a replacement. Deployed cohort evidence is still unavailable and no operational task is begun | F15/F16/F19; future rollout readiness |
| T11-D08 | Keep existing mastery/diagnostic/practice behavior and all historical evidence; do not automatically feed new mock outcomes into mastery yet | Decide separately whether/how completed or expired new mocks contribute to educational evidence and how syllabus-aware views preserve previous interpretation | Future mastery integration only; not a reason to rewrite old results |

The final-timeout choice has been requested from the product owner during T1.1. Until an explicit answer is recorded, T11-D02 remains pending; silence is not approval. No approval is inferred for any other row.

### T11 limitations, conflicts and validation boundary

- All nine required audit documents were present and read. The established root audit location was reused; the separate `docs/refinement` log was not changed.
- The three required CISIA sources were freshly retrieved on 2026-11-20. Source publication/effective/retrieval dates and retained/outdated wording are recorded in the version specification. Exact amendment day and complete historical syllabus revision remain unknown; no individual future exam dates are fabricated.
- Direct implementation inspection stayed within the Itatest frontend and demonstrably Cent-specific module source. Shared/Lerona code was unnecessary and was not inspected. Actual database records/deployed contracts/cohorts are unverified; reliable row classification requires future separately authorised evidence.
- Main implementation gaps: 20/60 global assessment versus 55/110 or 65/140 section engine; flat contracts/local-only pending answers/free navigation; no complete version/rules snapshot, Reading passage/group eligibility model or authoritative official raw-point result; existing comparison ignores rule version; mastery is a live computed view dependent on active items/topics. Existing question snapshots, stored ResultJson and idempotent submission are preservation foundations.
- T1.1 checks are documentation parsing, exact arithmetic, scenario reconciliation, local links, and permitted-file integrity checks. No application runtime, mutation-producing suite, database, migration, importer or deployment is invoked. This work does not establish production compatibility or approval of any future release.
- Static validation passed: eight JSON examples; two blueprints; ten scoring-table rows; six mixed-result sections; 37 local links/anchors; eight pending decision IDs; and deadline arithmetic/scenario consistency. The file-integrity comparison found exactly the five new T1.1 Markdown documents and this updated log, with the other 487 baseline files unchanged and no baseline deletions. Source/assets/tests/configuration under the scanned Itatest and Cent-only trees remained unchanged; runtime database and generated artifact directories were excluded. This is no claim of database/deployed-state inspection. No Lerona project, code, database or configuration was modified.

## Phase 1 addendum — architecture, commercial reconciliation and contracts

Added **2026-11-20**. All previous records above remain historical and unchanged. The current user request explicitly authorizes **documentation-only T1.1, T1.2, T1.3 and cross-cutting Phase1 work**. Earlier T11-F08/end-of-task “do not begin T1.2” statements applied to the earlier T1.1 task and are superseded for documentation scope only. All reports/final summaries in this task are English. No implementation or database access is authorized.

### Current authority

[PHASE_1_DECISION_REGISTER.md](PHASE_1_DECISION_REGISTER.md) is the current detailed status register. It records P1-A01–A09 approved requirements, reconciles each T11-D01–D08 partially approved proposal, provides recommendations/rationales for pending P1-C01–C13 commercial decisions, and lists P1-T01–T06 architecture/evidence gates. Prior blanket “all proposals pending” wording describes the earlier review state, not current approved metrics/timing/preservation.

| Record | Status / decision |
| --- | --- |
| P1-A02/A03 | Both official blueprints reverified; independent authoritative section timing/one-way locks, warning/forfeiture, server acknowledgment, timeout progression and no offline pause/reset explicitly approved |
| P1-A04/A05 | Raw1/−0.25/0, answered-question accuracy, completion formula and separate mastery approved; Mock Exam versus Practice terminology fixed; no official normalisation simulation |
| P1-A06/A09 | All historical/running-attempt rules/snapshots/result values and historical purchase rights/evidence preserved; incompatible comparisons prohibited; server payable amounts authoritative |
| P1-A07 | One-time individual subjects/custom/recommended editable bundles, progressive discounts from two distinct subjects and independent12month terms approved; no automatic billing |
| P1-A08 | Google/device/study-session/sharing/watermark enhancements deferred; no new device/study-session entities, policy gates or Lerona tests introduced |
| T11-D02 remaining | Final-timeout raw EXPIRED feedback recommended versus EXPIRED counts/no score; section progression approval does not settle this ambiguity. Owner choice requested, no answer assumed |
| P1-C01–C04 | Six subject prices, discount percentages, rounding/allocation/tax-fees and degree/goal bundle compositions pending.490000IRR and candidate0/5/10/15/20/25% tiers are review proposals only |
| P1-C05–C08/C11–C13 | Benefits/full-mock admission, exact calendar-month boundary, renewal/overlap, duplicates/owned selection, quote lifetime, mid-attempt expiry/review and subject-update coverage pending; concrete recommendations documented |
| P1-C09/C10 | Evidence-based Reading grandfathering recommended; exact cohorts/terms and refund/cancellation/access consequences pending. No old records converted |
| P1-T01/T02/T05 | Extend current Cent systems with immutable definitions/revisions/attempt sections and server contracts; retain one entitlement aggregate/order with independent subject items; no parallel CMS/auth/payment system |
| P1-T03 | Actual deployed schema/version/products/prices/customer/manual-bundle cohorts/payment totals unknown. Future authorized sanitized operator report required; source is not production evidence |
| P1-T04/T06 | Source-status/precision calendar architecture specified; UI ownership/freshness and optional planner scope unresolved. Existing brand/visual Phase7 review and unstarted Phase8 preserved |

### Evidence and deliverables

All sixteen mandatory audit/T1.1 documents were located at the established project root; none is missing. Required Phase0 historical audits were reviewed without rewriting. Brand/reference assets, existing guideline extraction/current visual records and Itatest controller/service architecture were reviewed; no redesign/new illustration. Direct backend inspection remained within demonstrably Cent-specific module files; protected shared-host/Lerona code was unnecessary and was not inspected.

The three required official CISIA URLs were freshly retrieved2026-11-20; October2026 amendment effective2026-11-01–2027-10-31 overrides old body structural statements. Announcement date2026-11-02 and undated structure page remain separately identified. Final submission and result-publication wording conflicts remain unresolved officially; no new future sessions or private normalisation coefficients were invented.

Five T1.1 specifications were updated consistently. Created four [T1.2 commerce documents](T1_2_COMMERCE_ARCHITECTURE.md), four [T1.3 architecture documents](T1_3_TARGET_ARCHITECTURE.md), [risk register](PHASE_1_RISK_REGISTER.md), [visual dependency map](PHASE_1_VISUAL_REDESIGN_ALIGNMENT.md) and [decision register](PHASE_1_DECISION_REGISTER.md). The decision register links all sixteen required deliverables. [Revised execution plan](PHASE_EXECUTION_PLAN_REVISED.md#phase-1-reconciliation-and-active-backlog) now explicitly supersedes old T1.2/T1.3 meanings and stale deferred-feature/Lerona-test references while preserving historical text.

Source findings: existing TRAINING grants permanent, SUBSCRIPTION day-based; no current bundle/order-line/tier/preset model; unique grant.OrderId precludes naïve multi-grant bundles; server IRR snapshots/verification/idempotency reusable; repurchase guards ignore future finite training expiry; owner/admin history caps200/500; pending includes uncertainty, no implemented refund workflow. Existing assessments remain at most20/global60min with correct-of-total Percentage, browser-local pending answers/free navigation and no full version/section/passage engine.

Phase1 validation is static only; detailed final evidence is recorded in [risk validation record](PHASE_1_RISK_REGISTER.md#phase-1-validation-record). No application build/test/start, checkout/verification call, database connection/query/write, migration, content generation/import, commit/push or deployment was performed. No application/source/asset/configuration behavior changed. **No Lerona project, code, configuration, database or functionality was modified.** Documentation is prepared for review; unresolved approvals/evidence prevent dependent implementation/release claims. Phase2 has not begun.

## Phase 1 commercial finalization — approved owner decisions

Added **2026-11-20**, following the Phase 1 review package. This later explicit instruction supersedes conflicting earlier commercial proposals and launch-cohort assumptions. Earlier entries remain historical; they are not silently deleted or treated as approved runtime behavior. Current status is in [Phase 1 decision register](PHASE_1_DECISION_REGISTER.md#commercial-decisions--current-approval-status).

| Record | Current status and supersession |
| --- | --- |
| P1-A10 / P1-C01 | **APPROVED:** initial reference price of **490,000 Iranian Toman per subject = 4,900,000 IRR** for all six subjects, including Reading. User-facing currency Toman; canonical integer monetary storage and provider amounts Rial (IRR), 10 IRR per Toman. Earlier 490,000 IRR/49,000 Toman interpretation is superseded and was not approved |
| P1-A11 / P1-C02 | **APPROVED:** one/two/three/four/five/six distinct subjects receive **0%/5%/10%/15%/20%/25%** respectively. Same schedule for custom and recommended bundles; no additional preset discount. Earlier identical percentage proposals now have explicit approval |
| P1-C03 / P1-C08 | **PARTIALLY APPROVED:** Toman display/integer IRR units, distinct-subject counting and no preset stacking. Rounding/allocation/fractional-Toman display, tax-fees, duplicate normalization UX, owned-subject checkout and renewal selection remain pending |
| P1-A12 / P1-C09 | **APPROVED:** owner confirms no registered users, customers, actual buyers or historical customer entitlements needing grandfathering. No customer migration, free historical Reading, compensatory grants or grandfathering mechanism is required for current launch. Supersedes unknown-customer-cohort launch gate and evidence-based Reading-grandfather proposal |
| P1-A13 | **APPROVED:** Reading and Comprehension is an independent sixth subject with own identity, syllabus/content links, standalone purchase, custom/recommended-bundle eligibility and independent12month entitlement. Same initial price/tier rules as others unless a future approved revision changes them |
| P1-T03 | **NARROWED:** later Cent deployment/schema/provider/isolation/backup and retained-record evidence remains necessary before executable schema work. No historical customer-cohort/grandfathering report or customer-conversion workflow is required. Owner confirmation is not a DB audit or proof that development/test/financial tables are empty |

Approved pricing fixtures now give:
one subject **4,900,000 IRR / 490,000 Toman**;
two subjects at5% **9,310,000 IRR / 931,000 Toman**;
three at10% **13,230,000 IRR / 1,323,000 Toman**;
four at15% **16,660,000 IRR / 1,666,000 Toman**;
five at20% **19,600,000 IRR / 1,960,000 Toman**;
six at25% **22,050,000 IRR / 2,205,000 Toman**.
These exact arithmetic totals precede any separately approved tax/fee treatment. No price seed or stored record is changed.

### Remaining approval gates — unchanged

P1-C04 recommended academic bundle compositions; P1-C05 included benefits/full-mock coverage; P1-C06 precise12month start/end boundary; P1-C07 renewal/overlap; P1-C10 refund/cancellation/access effects; P1-C11 quote expiry/checkout; P1-C12 mid-attempt access expiry/post-expiry review; P1-C13 content-update coverage remain PENDING. P1-C03/C08 retain unresolved portions above. Final-timeout T11-D02 and unrelated exam/technical recommendations retain their earlier pending status. Price approval is not sale/deployment readiness.

### Integrity and scope

Updated the ten requested documents and related [content](T1_3_CONTENT_AND_QUESTION_MODEL.md), [migration](T1_3_DATABASE_MIGRATION_STRATEGY.md) and [visual dependency](PHASE_1_VISUAL_REDESIGN_ALIGNMENT.md) specifications to remove stale active launch gates and currency assumptions. Historical Phase0/refinement evidence remains unchanged; earlier log/plan records are preserved and explicitly superseded. Static arithmetic/JSON/local-link and file-integrity checks only; final results appear in the [risk addendum](PHASE_1_RISK_REGISTER.md#commercial-finalization-validation-addendum--2026-11-20).

No application source, configuration, asset, UI, checkout/payment behavior or database changed. No database connection, migration, record deletion/conversion or deployment occurred. **No Lerona project, code, configuration, database or functionality was modified.** No Phase2 work began.

## Execution Phase 1 — exam infrastructure implementation

Added **2026-11-20** under the owner's explicit implementation instruction. This supersedes P1-A01's documentation-only scope solely for the bounded CEnT exam infrastructure slice; it does not approve remaining product policies or authorize database application/deployment. Historical records above are retained.

Implemented central historical/current blueprints, immutable rule/content/section snapshots over existing Cent attempts/questions, serialized SQL Server persistence, acknowledged answers, revision/idempotency receipts, continuous deadline reconciliation/worker, irreversible section progression, exact raw scoring and owner-only API projections. New mock results remain separate from legacy ResultJson/history/mastery. Six Cent companion entities, one unapplied migration and offline review SQL are prepared. No other backend project is changed.

T11-D02 final-timeout feedback remains PENDING; separate scored/counts-only profiles are tested but no default is activated. P1-C05/C12 admission and post-expiry review remain PENDING; the default admission boundary rejects activation/new starts. Existing four-option content is not eligible and no production Reading release was created. All unrelated commercial decisions remain unchanged.

Validation: dedicated Cent.Module build succeeded; isolated Cent.Exam.Tests **40 passed, 0 failed, 0 skipped**, including HTTP contracts and offline model/migration checks. No database connection/application or shared-host/Lerona build/test occurred. SQL Server execution/locking/restore and deployed record parity remain unverified. No frontend, content, commerce, authentication or deployment change. Full inventory, migration status, limits and recovery guidance: [execution report](EXECUTION_PHASE_1_EXAM_INFRASTRUCTURE.md).
