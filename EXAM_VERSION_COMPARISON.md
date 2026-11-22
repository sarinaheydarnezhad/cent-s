# Exam version comparison

Audit: 2026-11-20. Official references and dates: [reference register](OFFICIAL_CISIA_REFERENCE.md). Internal keys below are proposals.

| Dimension | Historical CISIA cycle | Current CISIA cycle | Actual local implementation |
| --- | --- | --- | --- |
| Administration period | 2025-11-01–2026-10-31 | 2026-11-01–2027-10-31 | No exam-version entity or effective-date selection |
| Admissions academic year | 2026/27 in old rules body | 2027/28 in current overview | No separate academic-year field |
| Structure | Five sections | Six; Reading precedes the other subjects | Five course identities; variable mixed selection |
| Total | 55 questions / 110 minutes | 65 / 140 | At most 20 questions / 60 minutes |
| Assembly | Section quotas | Section quotas | Random subject/topic round-robin; not official order |
| Navigation | Section boundaries | Section boundaries | Any question can be reopened |
| Answer options | Five | Five | All 819 bundled items have four; admin accepts 2–6 |
| Timing | Per section | Per section | Global deadline; DurationMinutes exists but Start/Submit hardcode 60 |
| Scoring | Raw points plus official normalisation | Same raw rule; official cohort normalisation | Rounded correct/total accuracy; no negative raw points |
| Macro-periods | Four | Five | No calendar model, sessions feed or planner |
| Version persistence | Official cycle-specific rules | New amendment | Question snapshots and stored ResultJson exist, but no rule/version snapshot |

Source evidence: `B/Cent.Module/CentPractice.cs`, `Entities.cs`, `CurriculumPackage.cs`; `src/types.ts`, `src/components/ExamExperience.tsx`, `src/pages/PracticePages.tsx`. `B` means `D:/Lerona/Backend/backend` throughout these documents.

The current mixed assessment is useful educational practice. It is not established as a faithful simulator of either official cycle. Do not relabel existing attempts as the old official exam merely because they contain five subjects.

## Recommended version semantics

- Preserve existing attempts under a distinct **legacy educational assessment** identity; retain their question snapshots, answers, ResultJson and accuracy definition.
- Model exam family, administration-cycle version, admissions academic year, syllabus revision and content release separately. A filename or current date is not sufficient provenance.
- Keep stable subject identities (`logic` may retain its identifier while displaying the official reasoning label). Choose a stable Reading identifier once, before content/import or checkout contracts depend on it.
- New attempts snapshot rule identity, ordered sections/quotas, timer policy, scoring version, passage revision and questions. Never reinterpret a running attempt when a new release activates.
- Keep accuracy, raw exam points and provisional mastery separate. No locally derived number may claim official normalisation. Compare history only when exam/scoring versions and scope are compatible; current `PersonalResults.comparable()` checks kind and topic counts only.
- Associate a subject purchase with explicit coverage rules across exam/content versions; updating an exam must not itself expire or replace paid access. Reading is a new subject, not a rename of reasoning or the text-reader feature.

## Decisions needed before implementation

Approve version naming/default-selection rules, legacy labels, running-attempt handling, access coverage for updated material and the Reading purchase policy. The fixed monetisation requirement remains individual subjects/bundles with 12-month purchases; see [monetisation audit](MONETIZATION_AND_ENTITLEMENTS_AUDIT.md). No old result conversion, automatic Reading grant or extra charge is assumed.
