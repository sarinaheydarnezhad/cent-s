# ITATEST — Phase 0 comprehensive audit

Audit date: **2026-11-20**. Objective: establish the evidence and bounded Phases 1–6 backlog for the CEnT-S update, mandatory monetisation model and existing redesign. **Documentation only; application behavior, appearance and data were not changed.**

## Deliverables

| Document | Purpose |
| --- | --- |
| [Official CISIA reference](OFFICIAL_CISIA_REFERENCE.md) | Official URLs, document/verification dates, versions, syllabus index, scoring, registration and calendars; uncertainties identified |
| [Exam version comparison](EXAM_VERSION_COMPARISON.md) | Old/current official cycles versus actual implementation and version semantics |
| [Affected modules](AFFECTED_MODULES.md) | Concrete frontend/backend paths, relationships, protected integrations and tests |
| [Feature inventory](FEATURE_INVENTORY.md) | Implemented, partial, missing, refactoring and investigation classifications |
| [Content gap analysis](CONTENT_GAP_ANALYSIS.md) | Recomputed subject counts, all 39 sources and 190 topics, official mapping, Chemistry review queue |
| [Visual redesign alignment](VISUAL_REDESIGN_ALIGNMENT.md) | Existing assets/decisions/implementation versus new functional/commercial requirements |
| [Migration risks](DATA_MIGRATION_RISKS.md) | Historical results/progress/purchases/content/identity safety and migration/rollback requirements |
| [Execution plan](PHASE_EXECUTION_PLAN.md) | Individually scoped tasks across six phases; objective, allowed/protected scope, dependencies, tests, acceptance and rollback |
| [Decision log](DECISION_LOG.md) | Fixed requirements, verified facts, proposed decisions, unknowns and approval gates |
| [Monetisation and entitlements](MONETIZATION_AND_ENTITLEMENTS_AUDIT.md) | Mandatory one-time 12-month subject/bundle model; pricing, checkout, legacy purchases, Reading, Google, devices and concurrency |

## Evidence baseline and method

- Frontend checkout: `D:/app/itatest`; HEAD `dfa97e4da9aa310b47f85ad7865f36f5cfd80ad4`; working tree initially clean. No applicable AGENTS.md found in the checkout or checked ancestors.
- Backend source: `D:/Lerona/Backend`; HEAD `9134cf84fae970a166f1d3401e16dd0afc324fe8`; tracked source clean, existing untracked `artifacts/` left untouched. Read-only inspection included Cent.Module, Cent.Curriculum, Cent.Tests, Cent.Preview and shared-host composition. No .env secrets were read. The per-command Git ownership exception changed no persistent Git configuration.
- Official CISIA pages/PDF and the linked testcisia calendars were retrieved on the audit date. Their publication dates, applicable cycle and retrieval date are distinguished in the reference. The online amendment is newer than retained body/PDF wording.
- Read actual routing/services/controllers/entities/FK constraints/migrations/importer/generator/tests and source manifest; parsed the complete bundled JSON, independently checked source hashes and exact duplicate/mapping conditions; counted legacy frontend samples by TypeScript AST.
- Reviewed current brand/theme/component source and prior redesign decisions/reports; visually inspected the saved brand board, Phase7 Light desktop catalog and Phase6 Dark mobile reader. Existing runtime/test reports are historical evidence, not newly executed acceptance.
- A SHA256 baseline covers **510 existing files**: 373 frontend source/assets/test/tool/config files and 137 backend module/curriculum/preview/test files (bin/obj excluded). Final verification compares those same files. Source package SHA and full source/topic inventory are recorded in content analysis.

Evidence labels used throughout: **verified source** = directly read code/package; **officially confirmed** = linked primary CISIA source; **historical evidence** = saved earlier report/test/screenshot; **recommendation** = future proposal; **unknown/blocked** = no adequate source/runtime/operational access. Absence in local code is not proof of absence in an unknown deployed extension or manual sales system.

## Principal findings

### Official changes — confirmed

The November2026 amendment adds the initial Reading and comprehension section. The new ordered blueprint and five macro-periods are documented with dates and official URLs in the reference; old/current cycle versus academic-year labels must not be conflated. Raw score and official cohort-normalised score are different concepts. Current future sessions visible in the official calendar are individually listed; later dates are not extrapolated from macro-periods.

### Current architecture — verified source

Frontend is React/TypeScript/Vite/React Router with Persian RTL, existing typed Cent API/session state, approved themes/shared components and separate scoped visual layers. Most catalog/readiness/progress subject lists come from backend curriculum metadata. Five-subject assumptions remain in types, icon/sample mappings and the backend's static course identity/validation. No new router/state/UI framework is needed.

Backend is the existing opt-in Cent module in the shared .NET10 Lerona API host. Cent has independent users/bearer sessions/CORS/policies, cent_* entities and migration history, with SQL Server registration and a separate Development SQLite preview. CentDb may fall back to the shared physical FlashcardsDb connection. Exam attempts snapshot questions and persist results; content, reader notes/progress, verified payments/grants, question administration and source imports already exist. Reuse these systems.

Current assessments select at most 20 questions under one 60-minute deadline, with free question navigation and correct/total accuracy. There is no versioned official blueprint, per-section transition/timer, shared passage model or official raw-points result. Expiry rejects submission; cleared null answers inflate the visual answered meter. Existing history is an educational assessment history, not proof of either official format.

### Content — verified counts, validation incomplete

Actual backend package: 5 courses, 39 source documents, 43 chapters, 190 topics, 430 sections, 666 extracted exercises and **819 bank questions**. All sources match checksums; exact duplicate checks found no duplicate keys/normalized stems/byte-identical sources. All 819 questions are four-option, so official-format publication needs reviewed five-option content. Several authored families have little variation; raw distinct-ID counts do not establish independent skill evidence.

No dedicated Reading course/passage/question bank exists. Chemistry has one draft source, five chapters/topics and 31 bank questions, mainly the macroscopic nucleus; nine other Chemistry nuclei lack dedicated coverage. Other subjects show broad structural coverage but full scientific/key/distractor/license and official-subtopic review remains incomplete. The source/topic annex bounds that review; this audit does not certify content quality or official compliance.

### Commercial model — fixed requirement versus verified mismatch

The approved target is one-time subjects and custom/recommended bundles, progressively discounted starting with two subjects, each purchased for 12 months. The current code offers permanent TRAINING grants and finite SUBSCRIPTION grants; these are implementation conflicts, not the product strategy. No custom bundles, progressive pricing, recommended goal bundles or bundle line-item grant scope exists.

Pricing, verified payment, request idempotency, order snapshots and account-scoped access checks provide a reusable foundation. Finite-grant fields exist, but individual grants get no expiry and non-revoked ownership blocks repurchase even if future grants expire. Simulator access currently depends on a subscription. Those rules need an explicit change for the fixed subject/bundle model.

Google modes and personal reader watermarks exist. Device registration, a two-device maximum, controlled replacements and one concurrent study session are absent from Cent. Global request limiting and seven-day login expiry do not meet these requirements. Legacy customer scope and Reading inclusion need a reviewed transition based on actual purchase evidence.

### Redesign alignment — current source and historical evidence

Approved Slate/Sage identity, logo/assets, typography, themes and shared components are implemented. Prior visual programme reached assessment Phase5, reading Phase6 and commerce Phase7 locally. Latest records leave Phase7 visual review pending and administration Phase8 unstarted. Preserve that history and its caveats.

Major conflicts concern behavior/copy rather than brand: 60-minute/free-navigation assessment UI; no passage/section states; permanent/subscription commerce wording and controls. Functional contracts must precede those visual changes. Calendar/planner imagery is inspiration, not an implemented planning feature. No redesign was performed here.

## Main risks and gates

1. Reinterpreting old ResultJson or replacing snapshots would corrupt historical meaning; adding topics/retiring active questions also changes mastery without new user answers.
2. Importer's same-ID upserts/republication and parser/filename-derived IDs can shift source pages and notes; published revisions need a safe migration strategy.
3. Bundle settlement must preserve idempotency and all-or-nothing grants; current unique grant/order constraint prevents naïve multi-grant insertion.
4. Silently shortening legacy grants, adding Reading charges, changing purchased subject sets or resetting clocks could alter customer terms. Actual deployed cohorts are unknown.
5. Device/Google-only transition can lock out valid owners or duplicate accounts. Keep user IDs, purchase ownership and explicit recovery.
6. Shared physical SQL database, provider-specific constraints and asynchronous payment confirmation require isolated SQL Server rehearsal and restore/reconciliation evidence. SQLite reports are insufficient production proof.

## Recommended task order and decisions

**Phase1:** version/scoring policies, sanitized production/cohort reconciliation, fixed-model detail decisions. **Phase2:** compatible exam/passage/subject, bundle/order/grant and device/lease schema/contracts. **Phase3:** authoritative engine, pricing/finite access, device/study enforcement and Google alignment; factual calendar only under selected scope. **Phase4:** independent scientific/content review, Reading and Chemistry expansion, safe versioned import. **Phase5:** functional UI wiring then separate visual alignment using current components. **Phase6:** SQL/provider/browser/accessibility regression, restore/rollback rehearsal and a concrete release approval package.

Decisions required: legacy/Reading access transition; discount rates/base prices and degree/goal sets; purchased practice/mock benefits; month/renewal semantics; device replacement/recovery and Google entry policy; running-attempt/expiry behavior; optional calendar/planner/saved-question scope. The fixed model itself needs no renewed approval. Backend implementation and any eventual deployment remain future explicitly scoped actions.

## Phase 0 verification and boundaries

Performed: source and test-definition inspection, JSON/AST counts, SHA256 source checks, duplicate/reference checks, document link/path/task-contract checks and final Git/source boundary verification. These checks do not invoke application endpoints or mutate fixtures.

Final checks: **11/11 documents present**, zero broken local Markdown links, **20/20 task cards** contain all seven required fields, zero undefined task references, all 39 source rows present, and **510/510 baseline files unchanged** with no additions/removals in those inspected trees. Frontend tracked/staged diffs are empty; its only new files are these eleven documents. Backend tracked source remains unchanged with its pre-existing untracked artifacts retained.

Not performed: npm build/test, browser runtime suites, dotnet build/test/restore, preview startup, registration/checkout/provider verification, imports, database queries/migrations, content publication or deployment. Several existing browser/backend tests create accounts/orders/notes/attempts; running them would violate this phase's no-data-modification restriction. Reported prior pass counts/lint findings remain attributed to their saved historical records.

Only the eleven requested root Markdown deliverables were created; prior docs and application/backend files remain unchanged. No commit, push, configuration change or approval for implementation is implied. Phase 0 is complete as an evidence-based plan with explicitly bounded unknowns; production/content scientific acceptance remains gated as described above.
