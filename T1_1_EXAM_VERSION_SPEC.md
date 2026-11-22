# T1.1 — Exam version specification

Prepared and sources reverified: **2026-11-20**. Phase 1 revision: **approved product requirements incorporated; remaining policies explicit; no implementation approval implied**. Current authority and partial approval of earlier `T11-Dxx` proposals are recorded in [PHASE_1_DECISION_REGISTER.md](PHASE_1_DECISION_REGISTER.md). The historical T1.1 log remains preserved.

## Scope and evidence

This package specifies full-length CEnT-S **Mock Exams**. **Practice** means subject-level or topic-level practice. Existing diagnostic and Practice behavior remains protected; legacy `simulator` is an internal historical kind, not proof of either official blueprint. It creates no database, API, content, authentication, entitlement or visual changes. The established root audit directory is used; `docs/refinement` belongs to the earlier visual programme.

All nine required Phase 0 documents were located and read: [PHASE_0_AUDIT](PHASE_0_AUDIT.md), [OFFICIAL_CISIA_REFERENCE](OFFICIAL_CISIA_REFERENCE.md), [EXAM_VERSION_COMPARISON](EXAM_VERSION_COMPARISON.md), [AFFECTED_MODULES](AFFECTED_MODULES.md), [FEATURE_INVENTORY](FEATURE_INVENTORY.md), [DATA_MIGRATION_RISKS](DATA_MIGRATION_RISKS.md), [DECISION_LOG](DECISION_LOG.md), [PHASE_EXECUTION_PLAN_REVISED](PHASE_EXECUTION_PLAN_REVISED.md), and [MONETIZATION_AND_ENTITLEMENTS_AUDIT_REVISED](MONETIZATION_AND_ENTITLEMENTS_AUDIT_REVISED.md). None is missing. Revised deferrals override older recommendations about Google/device/session changes; they remain outside T1.1.

Direct static inspection was limited to the Itatest frontend and demonstrably Cent-specific files under `D:/Lerona/Backend/backend/Cent.Module`. No shared host, Lerona source or `D:/Lerona/Frontend` inspection was needed. Deployment parity, database contents, and actual historical cohorts remain unknown. No database connection was made.

## Official source register and precedence

| ID and URL | Document/announcement date | Effective scope | Retrieval | Verified use |
| --- | --- | --- | --- | --- |
| S1 — [CEnT-S changes](https://www.cisiaonline.it/en/news/cent-s-changes-test-structure-and-macro-periods) | 2026-11-02 | First tests in November 2026 | 2026-11-20 | New initial Reading section, 65 questions/140 minutes, five macro-periods |
| S2 — [Structure and syllabus](https://www.cisiaonline.it/en/cent/cent-s/structure-and-syllabus) | Publication/revision date not displayed | Current published structure; no independent effective date shown | 2026-11-20 | Current blueprint, section navigation, raw scoring, normalisation and syllabus |
| S3 — [CEnT rules](https://www.cisiaonline.it/en/cent/all-about-CEnT/CEnT-rules) | Opening amendment labelled October 2026; exact day unspecified; body issue date not established | Amendment: 2026-11-01 through 2027-10-31; older body describes 2025–2026 | 2026-11-20 | Amendment scope, historical structure, five options/one correct answer, scoring and submission clauses |

Precedence: apply S3's **October 2026 amendment** to its stated administration period, corroborated by S1/S2. Retained 2025–2026 text is historical evidence, not a competing current blueprint. Publication, effective and retrieval dates must never substitute for each other.

| Conflict or limitation | Required interpretation |
| --- | --- |
| S3 opening amendment has six sections/five macro-periods; §§1.2/1.2.1 retain five sections/four windows | Preserve both with their cycles; amendment controls the current format |
| S3 body still mentions admissions 2026/27 and old session dates | Do not copy those into the current academic-year or session fields |
| S3 §4.1.2 describes final timeout ending the test; §§4.1.5 and 4.2.3 require participant submission for recording/validation | Unresolved official submission semantics; see [state machine](T1_1_SECTION_STATE_MACHINE.md). Simulator timeout behavior requires owner decision |
| S2 provides specific result-release month/day deadlines; S3 §4.2.5 retains old dates and a generic subsequent-year month-end rule | Do not generate a release scheduler from either wording. Official normalisation is a macro-period-end process, not an immediate simulator calculation. September's printed deadline also prevents assuming calendar month-end |
| Prior audit says the linked PDF retains the old format | Historical audit evidence only: PDF was not re-fetched in T1.1; the current HTML amendment governs structure |
| Complete historical syllabus revision unavailable | Historical section structure is established; identical detailed syllabuses across years are not established |

S2 currently prints result availability by January 29, March 31, May 31, July 30 and September 17. These are result-publication statements, **not exam session dates**; no year-expanded calendar or operational deadline is created here.

## Identity model

| Concept | Meaning | Example / constraint |
| --- | --- | --- |
| Exam family | Stable test identity | `CEnT-S` |
| Exam version | Immutable ordered blueprint and rules revision | Proposed `cent-s-2026-2027-r1`; never a mutable alias |
| Academic year | University admissions/enrolment context | Phase 0 records 2026/27 for the old cycle and 2027/28 for the current cycle; current mapping is historical audit evidence, not newly reverified here. University acceptance remains separate |
| Administration cycle | Period during which CISIA administers a format | 2026-11-01–2027-10-31 inclusive |
| Macro-period | A results/administration grouping within a cycle | Current macro-period 1: November–January; not an exam version |
| Individual session | One published dated administration, with its own location/format | Nullable until verified from a dated official session source; no fabricated date |
| Syllabus version | Independently evidenced scope of assessed skills | A dated immutable revision; historical completeness can be unknown |
| Content release | Reviewed local question/passage revision set | Separate from official syllabus and rules |

Proposed version keys and `reading` as the new subject key require T11-D01 approval. Existing keys `math`, `logic`, `biology`, `chemistry`, `physics` remain stable; `logic` displays “Reasoning on texts and data.” Reading is distinct from reasoning and the existing lesson reader.

## Official blueprints

Historical **CEnT-S 2025–2026**: administration period **2025-11-01–2026-10-31 inclusive**, supported by S3's retained historical body. Proposed key `cent-s-2025-2026-r1`.

| Order | Section | Subject key | Questions | Minutes | Seconds |
| --- | --- | --- | ---: | ---: | ---: |
| 1 | Mathematics | math | 15 | 30 | 1800 |
| 2 | Reasoning on texts and data | logic | 15 | 30 | 1800 |
| 3 | Biology | biology | 10 | 20 | 1200 |
| 4 | Chemistry | chemistry | 10 | 20 | 1200 |
| 5 | Physics | physics | 5 | 10 | 600 |
| **Total** | | | **55** | **110** | **6600** |

Current **CEnT-S 2026–2027**: administration period **2026-11-01–2027-10-31 inclusive**, supported by S3 amendment and S1/S2. Proposed key `cent-s-2026-2027-r1`.

| Order | Section | Subject key | Questions | Minutes | Seconds |
| --- | --- | --- | ---: | ---: | ---: |
| 1 | Reading and comprehension | reading | 10 | 30 | 1800 |
| 2 | Mathematics | math | 15 | 30 | 1800 |
| 3 | Reasoning on texts and data | logic | 15 | 30 | 1800 |
| 4 | Biology | biology | 10 | 20 | 1200 |
| 5 | Chemistry | chemistry | 10 | 20 | 1200 |
| 6 | Physics | physics | 5 | 10 | 600 |
| **Total** | | | **65** | **140** | **8400** |

Both blueprints use five options and one correct response per question (S3 §1.2.1). Totals are sums of independent maximum section times, not a fungible time allowance. Early closure can shorten actual elapsed duration. These dates describe official applicability, not when a local historical practice version must be disabled.

## Macro-periods and sessions

| Cycle | Macro-period | Month window |
| --- | ---: | --- |
| 2025–2026, historical S3 body | 1 | November 2025–January 2026 |
| 2025–2026, historical S3 body | 2 | February–March 2026 |
| 2025–2026, historical S3 body | 3 | April–June 2026 |
| 2025–2026, historical S3 body | 4 | September–October 2026 |
| 2026–2027, S3 amendment/S1 | 1 | November 2026–January 2027 |
| 2026–2027, S3 amendment/S1 | 2 | February–March 2027 |
| 2026–2027, S3 amendment/S1 | 3 | April–May 2027 |
| 2026–2027, S3 amendment/S1 | 4 | June–July 2027 |
| 2026–2027, S3 amendment/S1 | 5 | August–September 2027 |

Year expansion follows the stated cycles. A month window does not guarantee daily availability. October 2027 falls within the administration cycle but outside the five listed windows; leave the macro-period unknown rather than invent a sixth window or October sessions. Historical July–August likewise has no listed macro-period. No individual future exam date is specified by this package.

Local self-paced mocks need no official session or macro-period: use null references, not a fabricated CISIA booking. Proposed selection policy: default new full mocks to the explicitly activated current release; allow historical practice only when separately enabled and content-qualified. Current date, macro-period or academic-year changes never mutate an attempt. This proposal awaits T11-D01; no default has been activated.

## Immutable new-attempt snapshot

Every future versioned start must atomically capture the resolved version ID/revision, rules snapshot ID/integrity reference, exam family, administration-cycle provenance, optional academic year/session/macro-period, ordered section IDs/quotas/durations, scoring rules, timing/submission policy revision, syllabus revision/evidence status, content-release ID, and the selected ordered question/passage/group revisions. Capture answer options in their presented order and a server-only scoring key. Runtime state changes; rules and content snapshots do not.

A hash alone is not the snapshot: original payloads or immutable retrievable revisions must remain available. Corrections create a new revision for future starts. A version alias cannot rewrite a stored attempt. Idempotent start retries resolve to the same attempt and original rules even after activation changes.

## Content relationships and eligibility

| Object | Relationship and required evidence |
| --- | --- |
| Exam version | Orders sections and references a syllabus revision and reviewed eligibility release |
| Subject | Stable domain identity reused across versions; presence alone does not establish question eligibility |
| Syllabus version | Maps official skills to local topics with source URL/retrieval date and reviewer evidence; unknown historical mapping stays unknown |
| Topic | Stable ID with explicit many-to-many syllabus mappings, including supplementary/out-of-scope status |
| Lesson | Learning resource linked to topics and applicable syllabus revisions; lesson eligibility does not certify its exercises for exams |
| Question revision | Immutable stem/options/key/explanation/media, subject/topic provenance and explicit version/section eligibility |
| Shared Reading passage revision | Immutable text/media, source/rights/genre/level and publication metadata; referenced by question revisions |
| Question group revision | Ordered related questions plus one compatible passage revision; membership and permitted assembly behavior are frozen |

Proposed eligibility states per version/section/revision: `unreviewed`, `eligible`, `ineligible`, `retired-for-new-starts`. Only `eligible` content in an activated reviewed release enters new full mocks. A question can be eligible for multiple versions through explicit reviewed mappings; no inheritance from subject code, `Kind=both`, lesson publication, four-option legacy status or current date.

Eligibility requires syllabus alignment, scientific/key/distractor review, English-language suitability, exactly five distinct options/one correct key, usable media, provenance/rights, and compatible passage/group dependencies. Reading uses B2 comprehension expectations; source-selection details remain linked to S2 and the Phase 0 reference. Existing reasoning passages cannot be reclassified as Reading without review.

Proposed grouping rule: each declared group is atomic for assembly, with a frozen internal order and one shared passage revision. Do not split or duplicate groups to fill a quota. Official sources do not establish a fixed number of passages or questions per passage; these are content design decisions (T11-D06). Group sizes must permit exactly ten Reading questions. Any independently usable subset requires a separately reviewed group definition, never an on-the-fly split.

Validate all sections and dependencies before starting a timer. If any quota cannot be filled with distinct eligible questions/groups, reject the full mock as unavailable; do not substitute old content, shrink quotas or open a partial “official-format” mock. Four-option material may remain in existing practice with its original meaning.

No content ID, import record, source bytes or published lesson changes occur here. New metadata/revisions and any future importer work require separate authorization. Content eligibility must not change historical snapshots, mastery evidence or purchased scope.

## Implementation conflicts and review gates

| Directly inspected evidence | Conflict with this specification |
| --- | --- |
| `Backend/backend/Cent.Module/CentPractice.cs`, Start/Submit/Score | Up to 20 questions, random subject round-robin, hardcoded global 60 minutes, submission-only answer persistence, correct/total integer percentage, late-submit rejection |
| `Cent.Module/Entities.cs`, CentAttempt/CentAttemptQuestion | Question snapshots and stored results exist; no complete exam-rules/section snapshot. DurationMinutes exists but is not used by Start/Submit deadlines |
| `Cent.Module/CurriculumPackage.cs`, `CentCurriculumImporter.cs` | Five subject constants; importer requires 39 sources/five subjects/four options and changes active content on reimport |
| `itatest/src/services/cent.ts`, `pages/PracticePages.tsx`, `components/ExamExperience.tsx` | Flat attempt contract, browser-local answers, 3600-second display, no version storage key, unrestricted navigation, null-valued answer keys inflate answered meter |
| `itatest/src/pages/PersonalResults.tsx` | Comparison considers kind and topic counts, without version/scoring/timing compatibility |
| `Cent.Module/CentLearning.cs` | Live mastery depends on submitted snapshots, active question IDs and all imported topics; changing content can alter displayed mastery without new answers |

No dependency required entering protected Lerona code. Shared infrastructure details from Phase 0 remain attributed evidence, not an invitation to inspect or change them. Runtime/deployed history cannot be established from local source.

Review package: [state machine](T1_1_SECTION_STATE_MACHINE.md), [scoring](T1_1_SCORING_AND_RESULTS_SPEC.md), [legacy policy](T1_1_LEGACY_ATTEMPT_POLICY.md), [examples and fixtures](T1_1_API_EXAMPLES_AND_FIXTURES.md). Phase 1 includes [T1.2 commerce](T1_2_COMMERCE_ARCHITECTURE.md) and [T1.3 architecture](T1_3_TARGET_ARCHITECTURE.md); both are documentation only. Version quotas, approved section behavior, metrics and preservation are fixed; internal keys/defaults, final-timeout result recording and other remaining policies follow the current decision register. No policy approval authorizes implementation.
