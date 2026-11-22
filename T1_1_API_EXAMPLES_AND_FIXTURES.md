# T1.1 — Illustrative API examples and acceptance fixtures

Prepared and revised **2026-11-20**. These are documentation examples, **not implemented routes, generated contracts, real accounts or database fixtures**. IDs beginning `example-`, policy IDs and version keys are illustrative. Dates/times below are synthetic local Mock Exam timestamps, never CISIA session dates. Current approvals/remaining alternatives are in [PHASE_1_DECISION_REGISTER.md](PHASE_1_DECISION_REGISTER.md). [T1.3 API contracts](T1_3_API_CONTRACTS.md) finalize the proposed route namespace and production contract shapes; compact T1.1 arrays/excerpts remain labeled fixtures.

The current API has flat Start/Submit/Result contracts. All proposed relative routes below use the T1.3 base `/api/cent/v1/assessment`; legacy `/attempts` stays unchanged. They do not authorize implementation. Section timing, acknowledgment saving, scoring formulas and preservation are approved; examples additionally assume proposed strict timing/revision semantics and the still-pending expired-feedback profile (`T11-D02/D03`). Full requirements: [versions/content](T1_1_EXAM_VERSION_SPEC.md), [states](T1_1_SECTION_STATE_MACHINE.md), [scoring](T1_1_SCORING_AND_RESULTS_SPEC.md), [legacy](T1_1_LEGACY_ATTEMPT_POLICY.md).

## F01 — Both version definitions

This reference catalogue is projected public metadata, not a complete private attempt snapshot. Academic-year values are intentionally omitted here; those are separate provenance fields, not derived by parsing a version key.

```json
{
  "versions": [
    {
      "examFamily": "CEnT-S",
      "examVersionId": "cent-s-2025-2026-r1",
      "administrationCycle": { "startDate": "2025-11-01", "endDateInclusive": "2026-10-31" },
      "sectionDefinitions": [
        { "order": 1, "subjectId": "math", "questionCount": 15, "durationSeconds": 1800 },
        { "order": 2, "subjectId": "logic", "questionCount": 15, "durationSeconds": 1800 },
        { "order": 3, "subjectId": "biology", "questionCount": 10, "durationSeconds": 1200 },
        { "order": 4, "subjectId": "chemistry", "questionCount": 10, "durationSeconds": 1200 },
        { "order": 5, "subjectId": "physics", "questionCount": 5, "durationSeconds": 600 }
      ],
      "totalQuestions": 55,
      "totalDurationSeconds": 6600,
      "optionCount": 5,
      "scoringPolicyId": "raw-quarter-point-v1"
    },
    {
      "examFamily": "CEnT-S",
      "examVersionId": "cent-s-2026-2027-r1",
      "administrationCycle": { "startDate": "2026-11-01", "endDateInclusive": "2027-10-31" },
      "sectionDefinitions": [
        { "order": 1, "subjectId": "reading", "questionCount": 10, "durationSeconds": 1800 },
        { "order": 2, "subjectId": "math", "questionCount": 15, "durationSeconds": 1800 },
        { "order": 3, "subjectId": "logic", "questionCount": 15, "durationSeconds": 1800 },
        { "order": 4, "subjectId": "biology", "questionCount": 10, "durationSeconds": 1200 },
        { "order": 5, "subjectId": "chemistry", "questionCount": 10, "durationSeconds": 1200 },
        { "order": 6, "subjectId": "physics", "questionCount": 5, "durationSeconds": 600 }
      ],
      "totalQuestions": 65,
      "totalDurationSeconds": 8400,
      "optionCount": 5,
      "scoringPolicyId": "raw-quarter-point-v1",
      "macroPeriods": [
        { "number": 1, "months": [11, 12, 1] },
        { "number": 2, "months": [2, 3] },
        { "number": 3, "months": [4, 5] },
        { "number": 4, "months": [6, 7] },
        { "number": 5, "months": [8, 9] }
      ]
    }
  ]
}
```

Expected: exact sums, contiguous order, unique section identities on expansion; 110/140 minutes. Month numbers are cycle windows, not session dates or activation commands. Scoring weights resolve to the immutable policy containing correct `1.00`, incorrect `-0.25`, unanswered `0.00`. Official and local revision IDs are distinct: CISIA did not publish these internal keys.

## F02 — Proposed start and section-state projection

Illustrative `POST /mock-attempts` request:

```json
{
  "requestId": "example-start-01",
  "examVersionId": "cent-s-2026-2027-r1"
}
```

Proposed public response projection (questions are retrieved only for the active section). The server privately retains the complete immutable snapshot and all 65 question revisions; this projection is not its replacement.

```json
{
  "attemptId": "example-attempt-01",
  "examVersionId": "cent-s-2026-2027-r1",
  "rulesSnapshotId": "example-rules-01",
  "scoringPolicyId": "raw-quarter-point-v1",
  "timingPolicyId": "continuous-v1",
  "submissionPolicyId": "expired-feedback-v1",
  "contentReleaseId": "example-reviewed-content-01",
  "syllabusRevisionId": "example-current-syllabus-01",
  "officialSessionId": null,
  "macroPeriodId": null,
  "status": "ACTIVE",
  "revision": 1,
  "serverNow": "2026-11-20T09:00:00Z",
  "activeSectionId": "example-section-reading",
  "sections": [
    { "sectionId": "example-section-reading", "order": 1, "subjectId": "reading", "questionCount": 10, "durationSeconds": 1800, "state": "ACTIVE", "activatedAt": "2026-11-20T09:00:00Z", "deadline": "2026-11-20T09:30:00Z" },
    { "sectionId": "example-section-math", "order": 2, "subjectId": "math", "questionCount": 15, "durationSeconds": 1800, "state": "PENDING", "activatedAt": null, "deadline": null },
    { "sectionId": "example-section-logic", "order": 3, "subjectId": "logic", "questionCount": 15, "durationSeconds": 1800, "state": "PENDING", "activatedAt": null, "deadline": null },
    { "sectionId": "example-section-biology", "order": 4, "subjectId": "biology", "questionCount": 10, "durationSeconds": 1200, "state": "PENDING", "activatedAt": null, "deadline": null },
    { "sectionId": "example-section-chemistry", "order": 5, "subjectId": "chemistry", "questionCount": 10, "durationSeconds": 1200, "state": "PENDING", "activatedAt": null, "deadline": null },
    { "sectionId": "example-section-physics", "order": 6, "subjectId": "physics", "questionCount": 5, "durationSeconds": 600, "state": "PENDING", "activatedAt": null, "deadline": null }
  ]
}
```

Expected: no answer key/explanation in an active response; no usable future-section content. Starting again with the same request ID after a version-default switch returns this original attempt. A changed version under the same ID conflicts. Different IDs may start distinct attempts only under existing authorised admission rules; no new account concurrency policy is implied.

## F03 — Active-section question/passage projection

One-question excerpt of a fictional five-question atomic group. This is original synthetic text and is not content to import. In a complete assembly, all five declared question revisions and a second compatible five-question group would satisfy the ten-question Reading quota. The excerpt alone is deliberately **not** a valid complete mock.

```json
{
  "sectionId": "example-section-reading",
  "groupId": "example-group-r1",
  "groupRevision": 1,
  "declaredQuestionCount": 5,
  "passage": {
    "passageId": "example-passage",
    "revision": 1,
    "text": "The library extended its opening hours. Visitor numbers then increased, but the report did not establish what caused the increase."
  },
  "questionExcerpt": {
    "questionId": "example-reading-q1",
    "revision": 1,
    "passageId": "example-passage",
    "passageRevision": 1,
    "stem": "Which statement is supported by the report?",
    "options": [
      { "id": "a", "text": "Longer hours certainly caused the increase." },
      { "id": "b", "text": "Visitor numbers rose after the hours changed." },
      { "id": "c", "text": "Every visitor preferred the new hours." },
      { "id": "d", "text": "The library had fewer visitors afterward." },
      { "id": "e", "text": "The report proved that hours had no effect." }
    ]
  }
}
```

The private frozen key is `b`; it must not appear in the learner projection until finalisation. Eligibility/review is unproven for this illustrative text. If passage revision 2 is published later, this attempt continues to show revision 1. An incompatible question/passage revision, incomplete group or repeated question makes assembly fail before any timer starts.

## F04 — Save, clear, advance and stale commands

Illustrative `PUT /mock-attempts/example-attempt-01/answers`:

```json
{
  "commandId": "example-save-01",
  "sectionId": "example-section-reading",
  "expectedRevision": 1,
  "questionId": "example-reading-q1",
  "selectedOptionId": "b"
}
```

Acknowledgment projection:

```json
{
  "commandId": "example-save-01",
  "accepted": true,
  "appliedRevision": 2,
  "acceptedAt": "2026-11-20T09:02:00Z",
  "selectedOptionId": "b"
}
```

Clear uses a new command ID, expectedRevision 2 and selectedOptionId null; accepted clear produces revision 3, unanswered=1 and answered=0 for this question. It does not count as answered merely because its key remains present. An unknown option ID produces validation failure, not an incorrect answer.

Illustrative `POST /mock-attempts/example-attempt-01/advance` after confirming forfeiture:

```json
{
  "commandId": "example-advance-01",
  "sectionId": "example-section-reading",
  "expectedRevision": 3,
  "confirmForfeitRemainingTime": true
}
```

Before this command the UI warns that remaining time and return access are lost; cancel sends no command and time continues. At 09:20:00Z, expected confirmed outcome is Reading CLOSED_EARLY, Mathematics ACTIVE from 09:20:00Z through deadline 09:50:00Z. The unused ten Reading minutes vanish. Reopening Reading fails. Two concurrent advances cannot skip Mathematics: one commits, the other gets stale/closed state. A semantically equivalent retry returns the original acknowledgment plus the now-reconciled state; a changed payload under that command ID conflicts.

Proposed error vocabulary for later API design:

| Condition | Illustrative HTTP / error code | State effect |
| --- | --- | --- |
| Short eligible bank, wrong option count or broken group | 409 `exam_not_ready` | No timed attempt created |
| Unknown question or invalid option | 400 `invalid_answer` | No answer stored |
| Stale revision / changed idempotent payload | 409 `stale_revision` / `command_conflict` | Return current state; no overwrite |
| Old/future section mutation | 409 `section_not_active` | No backtrack or jump |
| Submit before final section | 409 `final_section_required` | Remain ACTIVE |
| Command first evaluated at/after deadline | 409 `section_closed` | Due timeouts reconciled first |
| Foreign/unavailable attempt | 404 `attempt_not_found` | No data exposure; existing authentication remains required |
| Unsupported rule/contract revision | 409 `unsupported_exam_contract` | No fallback into legacy behavior |

## F05 — Complete mixed raw result

Synthetic independent example; it does not continue F04's cleared-answer timeline. The six ordered arrays below are `[subjectId, N, C, I, U, A, rawScore]`. The real contract may use objects; array positions are explicitly defined only to keep the fixture compact.

```json
{
  "attemptId": "example-result-01",
  "examVersionId": "cent-s-2026-2027-r1",
  "rulesSnapshotId": "example-rules-01",
  "scoringPolicyId": "raw-quarter-point-v1",
  "status": "COMPLETED",
  "finalizationReason": "participant_submit",
  "resultBasis": "itatest_raw_mock",
  "sections": [
    ["reading", 10, 8, 1, 1, 9, "7.75"],
    ["math", 15, 10, 3, 2, 13, "9.25"],
    ["logic", 15, 9, 4, 2, 13, "8.00"],
    ["biology", 10, 6, 2, 2, 8, "5.50"],
    ["chemistry", 10, 5, 3, 2, 8, "4.25"],
    ["physics", 5, 3, 1, 1, 4, "2.75"]
  ],
  "questionCount": 65,
  "correctCount": 41,
  "incorrectCount": 14,
  "unansweredCount": 10,
  "answeredCount": 55,
  "rawQuarterPoints": 150,
  "rawScore": "37.50",
  "maximumRawScore": "65.00",
  "accuracy": { "numerator": 41, "denominator": 55, "displayPercent": "74.55" },
  "completionRate": { "numerator": 55, "denominator": 65, "displayPercent": "84.62" },
  "officialNormalisedScore": null,
  "normalisationStatus": "not_available_to_itatest"
}
```

Expected: exact quarter-point arithmetic, summed counts, ratios from total counts, no normalisation coefficient or invented pass mark. A terminal retry returns the same stored result even after a key/content/version update.

## F06–F21 — Timing, preservation and content scenarios

Each scenario is independent unless explicitly stated. All use server decision time, not browser time.

| ID | Given / event | Expected outcome |
| --- | --- | --- |
| F06 | Start current mock at 09:00Z, no early closure | Reading deadline 09:30; Mathematics 10:00; Reasoning 10:30; Biology 10:50; Chemistry 11:10; Physics 11:20 |
| F07 | Reading deadline 09:30:00Z; answer decision at 09:29:59.999Z, durable success | Answer accepted and retained; subsequent timeout cannot discard it |
| F08 | Same deadline; answer decision at exactly 09:30:00Z or later | Reading closes first; answer rejected; no grace time even if browser says one second left |
| F09 | Reading early closes at 09:20Z; later sections use full allowances | Mathematics deadline 09:50; final deadline 11:10; total maximum elapsed now 130 minutes |
| F10 | Continuous F06 schedule; disconnect at 09:10Z, return 10:35Z | Reading/Math/Reasoning closed at original deadlines; Biology ACTIVE until 10:50; no timer reset |
| F11 | Continuous F06 schedule; close browser and return 11:21Z; no answers saved | All sections CLOSED_TIMEOUT, EXPIRED; 65 blanks, raw 0.00, accuracy null, completion 0.00%; no completed-mock comparison |
| F12 | Submit from Physics at 11:19Z on F06 schedule | CLOSED_SUBMISSION then COMPLETED from acknowledged answers; response loss/retry yields same result |
| F13 | Submit at 11:20Z on F06 schedule | Timeout wins; EXPIRED under recommended policy; no answer payload accepted after deadline |
| F14 | Two tabs save different options with same expected revision | One serialised commit; other stale. Retry cannot revert accepted state or extend time |
| F15 | Old legacy attempt starts 08:00Z; new format activates 08:30Z | Original global 09:00Z deadline/handler/score preserved; no Reading added; late submit remains rejected under legacy behavior |
| F16 | Versioned attempt starts under r1; r2/default changes while active | Original ordered sections, durations, content and raw rules persist; same start request resolves original attempt |
| F17 | Bank has only four-option items or nine eligible Reading questions | Full new-format start unavailable; no partial or legacy fallback; diagnostic/practice behavior unchanged |
| F18 | Shared passage group broken, orphaned, cross-revision or cannot fit quota atomically | Start unavailable before timer creation; no group splitting/duplication |
| F19 | Stored legacy result: N=20/C=12/I=4/U=4/Percentage=60 | Preserve 60 and exact stored payload; examVersionId null; no retroactive 11.00 raw result; incompatible with full mocks |
| F20 | New full mock all wrong or all blank | Current all wrong raw −16.25 with completion 100%; all blank raw 0.00/accuracy null/completion 0%; no zero clamp |
| F21 | Backend saves finalisation intent then restarts before result commit | Recover same intent/end reason/frozen answers; commit one result, no restored editing time |

Under the alternative explicit-submission-only policy, F11/F13 retain EXPIRED and saved counts but produce no raw result. They must be revised together with the snapshotted submission policy if the owner chooses that alternative; do not implement both outcomes for one policy ID.

## Review and static validation record

Acceptance review must reconcile F01 totals/order with official blueprints, F05 and scoring tables with exact integer/decimal arithmetic, F06–F14 with timing invariants, and F15–F19 with preservation/eligibility policy. New implementation tests belong to a later authorised task. T1.1 validation uses only Markdown/JSON/arithmetic/link checks and source-file integrity comparisons; it does not run the application, tests that create accounts/attempts, importers, database commands or deployment.

Phase 1 incorporates approved section progression/offline timing/acknowledgment, metric formulas, terminology and historical/running-attempt preservation. Remaining review concerns internal keys/defaults, final-timeout scored feedback, strict boundary/revision/rounding details, comparison signatures, group/publication policy, incident compensation and new mastery inputs. Approval is tracked per decision rather than inferred for the whole package.

Historical T1.1 validation on 2026-11-20 parsed eight JSON blocks, both blueprints, ten scoring rows, the mixed result and 37 local links/anchors; all passed. Phase 1 repeats and extends static contract/link/arithmetic/integrity validation; its current record is in [Phase 1 risks](PHASE_1_RISK_REGISTER.md#phase-1-validation-record). Neither record is an application engine test or production certification.
