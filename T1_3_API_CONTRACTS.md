# T1.3 — Proposed API contracts

Date: **2026-11-20**. **Specification only: none of the proposed endpoints exists by virtue of this document.** Existing `/api/cent/v1/attempts`, `/checkout`, `/catalog`, `/me/orders`, `/me/library`, authentication and callback contracts remain compatible. Examples are synthetic; UUIDs, content releases, active availability and prices are not deployed records. Pending policy branches are controlled by [Phase 1 decisions](PHASE_1_DECISION_REGISTER.md).

## Conventions and compatibility

Proposed assessment base: **`/api/cent/v1/assessment`**. Relative `/mock-attempts` examples in T1.1 use this base. New commerce projections use **`/api/cent/v1/commerce`** while reusing the existing payment/access services. These namespaces discriminate new contracts; they do not create independent stacks. Proposed payload `contractVersion=1` is distinct from exam/rules/content/commercial revision identity.

Use existing CentUser authentication, CentAdmin where applicable, owner-scoped resource checks, existing error/session handling and root/subpath routing. No Lerona JWT reuse, Google transition, device registration or study lease. Foreign and unknown owned resources return404; unauthenticated401. Active attempt/result/review/owner commerce responses are private/no-store; public metadata contains no keys, personal rights or payment evidence.

Identifiers resolve immutable stored records. New requestId/commandId are nonempty UUIDs; illustrative `example-` tokens in older T1.1 fixtures are symbolic. Datetimes use UTC ISO8601 with offsets; date-only calendar fields retain date precision/timezone separately. Scores use exact decimal strings/quarter integers, money uses bounded integer IRR (within existing safe accepted amount range), ratios contain integer numerator/denominator and nullable decimal-string displayPercent. Missing versus null is explicitly defined; selectedOptionId=null clears an answer.

### Endpoint inventory

| Method / path relative to assessment base | Authorization | Request / success |
| --- | --- | --- |
| GET `/exam-versions` | Public | Public metadata/availability, both known blueprints; unavailable/retired labels explicit |
| GET `/exam-versions/{versionId}/configuration` | Public | Complete ordered public rules, policies/readiness; no questions/keys |
| POST `/mock-attempts` | CentUser | `{requestId,examVersionId,configurationRevision}`;201 new state,200 same-request existing state |
| GET `/mock-attempts/{id}` | Owner |200 authoritative reconciled state, all section metadata, no future questions |
| GET `/mock-attempts/{id}/active-section` | Owner |200 state + active-section content/accepted answers; activeSection=null after finalisation; no later-section content |
| PUT `/mock-attempts/{id}/answers` | Owner | `{commandId,sectionId,expectedRevision,questionId,selectedOptionId}`;200 durable acknowledgment + current state |
| POST `/mock-attempts/{id}/advance` | Owner | `{commandId,sectionId,expectedRevision,confirmForfeitRemainingTime:true}`;200 receipt/state; final section invalid |
| POST `/mock-attempts/{id}/complete` | Owner | `{commandId,sectionId,expectedRevision}`;200 completed/result reference,202 durable finalisation processing |
| GET `/mock-attempts/{id}/result` | Owner |200 immutable terminal outcome;202 SUBMITTING;409 ACTIVE |
| GET `/mock-attempts/{id}/review` | Owner |200 immutable questions/passages/selected/key/explanation after terminal result; cursor paging permitted by frozen order |
| GET `/mock-attempts?cursor=...&limit=...` | CentUser | Owner history, version/status/metric/comparison identity; no retroactive legacy conversion |

Proposed admin definition/release publication uses existing CentAdmin role and audit: draft revision editing, validation report, explicit publish/retire/activate commands; published revisions cannot be updated in place. Exact admin route design is future bounded work; this contract does not authorize broad administration redesign.

## A1 — Version catalog and configuration

GET `/exam-versions` example:

```json
{
  "contractVersion": 1,
  "versions": [
    { "examVersionId": "cent-s-2025-2026-r1", "label": "CEnT-S 2025–2026", "totalQuestions": 55, "totalDurationSeconds": 6600, "availableForNewStarts": false, "availabilityReason": "historical_release_not_activated" },
    { "examVersionId": "cent-s-2026-2027-r1", "label": "CEnT-S 2026–2027", "totalQuestions": 65, "totalDurationSeconds": 8400, "availableForNewStarts": false, "availabilityReason": "policies_and_content_pending" }
  ]
}
```

GET `/exam-versions/cent-s-2026-2027-r1/configuration` hypothetical **post-approval** configuration example:

```json
{
  "contractVersion": 1,
  "examVersionId": "cent-s-2026-2027-r1",
  "configurationRevision": "example-configuration-01",
  "administrationCycle": { "startDate": "2026-11-01", "endDateInclusive": "2027-10-31" },
  "academicYear": null,
  "sections": [
    { "sectionKey": "reading", "order": 1, "subjectId": "reading", "questionCount": 10, "durationSeconds": 1800 },
    { "sectionKey": "math", "order": 2, "subjectId": "math", "questionCount": 15, "durationSeconds": 1800 },
    { "sectionKey": "logic", "order": 3, "subjectId": "logic", "questionCount": 15, "durationSeconds": 1800 },
    { "sectionKey": "biology", "order": 4, "subjectId": "biology", "questionCount": 10, "durationSeconds": 1200 },
    { "sectionKey": "chemistry", "order": 5, "subjectId": "chemistry", "questionCount": 10, "durationSeconds": 1200 },
    { "sectionKey": "physics", "order": 6, "subjectId": "physics", "questionCount": 5, "durationSeconds": 600 }
  ],
  "totalQuestions": 65,
  "totalDurationSeconds": 8400,
  "optionCount": 5,
  "scoring": { "policyId": "raw-quarter-point-v1", "correct": "1.00", "incorrect": "-0.25", "unanswered": "0.00" },
  "timingPolicyId": "continuous-v1",
  "submissionPolicyId": "expired-feedback-v1",
  "syllabusRevisionId": "example-current-syllabus-01",
  "contentReleaseId": "example-reviewed-content-01",
  "availableForNewStarts": true
}
```

The first example represents unavailable configurations; the second is a separate hypothetical activated fixture, not a claim that current content is ready. Before approval, pending submission/benefit policy is unavailable and start is blocked. Historical configuration uses the exact five rows in T1.1,55/6600; no Reading. Academic year is nullable provenance, not parsed from version ID. Official session/macro-period definitions are separate calendar resources.

## A2 — Initialization and authoritative state

POST `/mock-attempts` request:

```json
{
  "requestId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
  "examVersionId": "cent-s-2026-2027-r1",
  "configurationRevision": "example-configuration-01"
}
```

New committed state response (section list shown fully in T1.1 F02; this envelope is a compact projection):

```json
{
  "contractVersion": 1,
  "attemptId": "11111111-1111-4111-8111-111111111111",
  "examVersionId": "cent-s-2026-2027-r1",
  "configurationRevision": "example-configuration-01",
  "rulesSnapshotId": "example-rules-01",
  "contentReleaseId": "example-reviewed-content-01",
  "status": "ACTIVE",
  "revision": 1,
  "serverNow": "2026-11-20T09:00:00Z",
  "activeSectionId": "22222222-2222-4222-8222-222222222222",
  "activeSection": { "order": 1, "subjectId": "reading", "questionCount": 10, "durationSeconds": 1800, "state": "ACTIVE", "activatedAt": "2026-11-20T09:00:00Z", "deadline": "2026-11-20T09:30:00Z" },
  "officialSessionId": null,
  "macroPeriodId": null
}
```

All sections/questions/groups/passage payloads and policies are frozen privately before this response. A full state read adds the ordered section metadata, with pending activatedAt/deadline null. Start checks available supported revision, approved access, quotas/options/eligibility/dependencies and idempotency. No partial timed attempt on failure. A changed configuration with the same requestId conflicts; a retry returns the original even if current default changes. A new request whose configuration revision was withdrawn gets409 configuration_changed/exam_unavailable, never a silent new default.

GET state and active-section reconcile every due timeout before projection. Exactly one active section exists or the attempt is SUBMITTING/terminal. On delayed reconnection, later activation time is the previous **effective deadline**, not processing time. Approved P1-A03 forbids resetting/extending deadlines. Return serverNow for display; browser clocks do not authorize changes.

## A3 — Active content and shared passage projection

An active-section response contains the full ordered question set and a deduplicated passage/group collection. This example is explicitly a **one-question excerpt**, not a playable ten-question section. Its private key is omitted; content is original synthetic text, not reviewed publishable material.

```json
{
  "attemptId": "11111111-1111-4111-8111-111111111111",
  "revision": 1,
  "serverNow": "2026-11-20T09:01:00Z",
  "sectionId": "22222222-2222-4222-8222-222222222222",
  "deadline": "2026-11-20T09:30:00Z",
  "excerptOnly": true,
  "passages": [{ "passageSnapshotId": "example-passage-snapshot-01", "passageRevisionId": "example-passage-r1", "text": "The library extended its hours. Visits increased, but the report did not identify the cause." }],
  "groups": [{ "groupRevisionId": "example-group-r1", "passageSnapshotId": "example-passage-snapshot-01", "declaredQuestionCount": 5 }],
  "questions": [{
    "questionId": "33333333-3333-4333-8333-333333333333",
    "questionRevisionId": "example-reading-q1-r1",
    "position": 1,
    "groupRevisionId": "example-group-r1",
    "passageSnapshotId": "example-passage-snapshot-01",
    "stem": "Which statement is supported?",
    "options": [
      { "id": "a", "text": "Longer hours certainly caused the increase." },
      { "id": "b", "text": "Visits increased after the hours changed." },
      { "id": "c", "text": "Every visitor preferred the new hours." },
      { "id": "d", "text": "Visits decreased." },
      { "id": "e", "text": "The report proved hours had no effect." }
    ],
    "selectedOptionId": null
  }]
}
```

Production responses do not include `excerptOnly`; they include all declared active content. Never serialize scoring keys, explanations or future-section content into an active payload. Independent questions have groupRevisionId/passageSnapshotId null. Group membership must resolve completely; a missing dependency is a readiness error, not a request for the browser to fetch arbitrary live content.

## A4 — Answer acknowledgment and concurrency

PUT `/mock-attempts/{id}/answers`:

```json
{
  "commandId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
  "sectionId": "22222222-2222-4222-8222-222222222222",
  "expectedRevision": 1,
  "questionId": "33333333-3333-4333-8333-333333333333",
  "selectedOptionId": "b"
}
```

Durable200 response:

```json
{
  "receipt": {
    "commandId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    "accepted": true,
    "appliedRevision": 2,
    "acceptedAt": "2026-11-20T09:02:00Z",
    "questionId": "33333333-3333-4333-8333-333333333333",
    "selectedOptionId": "b"
  },
  "currentState": { "status": "ACTIVE", "revision": 2, "activeSectionId": "22222222-2222-4222-8222-222222222222", "serverNow": "2026-11-20T09:02:00Z", "deadline": "2026-11-20T09:30:00Z" }
}
```

Clear sends a new commandId, expectedRevision2 and selectedOptionId=null. Success increments to3 and that question becomes unanswered. UUID/field/option validation is strict; no map-key answered counting. A timeout/lost response means **unknown to the client**, not rejected: retry the exact command or GET state. Only receipt accepted=true after commit proves saved. The original receipt's appliedRevision/time never changes; currentState can be later on replay.

Proposed processing order: authenticate/owner lookup → under serialized state operation check matching command receipt/hash → reconcile due deadlines → return known receipt with current state, or validate new command revision/current section/options/time → commit mutation+receipt. A reused command ID with different canonical semantic payload conflicts. Canonical hashes ignore JSON property order, not semantic values. Unknown stale/late commands do not apply input; reconciliation may still advance state. Same-ID retries cannot reopen sections or reapply answers after timeout.

## A5 — Advance, warnings and completion

Before advance, display the irreversible warning and wait for confirmation; cancel sends nothing. Disable advance while answers are unsaved/pending. POST `/mock-attempts/{id}/advance`:

```json
{
  "commandId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
  "sectionId": "22222222-2222-4222-8222-222222222222",
  "expectedRevision": 3,
  "confirmForfeitRemainingTime": true
}
```

At09:20Z response receipt identifies closure and next state: Reading CLOSED_EARLY at09:20, Math ACTIVE from09:20 with09:50 deadline, revision4. Ten unused minutes are lost. False/missing confirmation fails400 confirmation_required without early closure. At/after09:30 first reconcile timeout; stale command cannot skip Math. `advance` is invalid in final section. No whole unacknowledged answer map is accepted by advance/complete.

```json
{
  "receipt": { "commandId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3", "accepted": true, "appliedRevision": 4, "acceptedAt": "2026-11-20T09:20:00Z", "closedSectionId": "22222222-2222-4222-8222-222222222222", "closureReason": "early_advance" },
  "currentState": { "status": "ACTIVE", "revision": 4, "activeSectionId": "44444444-4444-4444-8444-444444444444", "subjectId": "math", "activatedAt": "2026-11-20T09:20:00Z", "deadline": "2026-11-20T09:50:00Z", "serverNow": "2026-11-20T09:20:00Z" }
}
```

POST `/mock-attempts/{id}/complete` from the active final section, hypothetical independent timeline:

```json
{
  "commandId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4",
  "sectionId": "66666666-6666-4666-8666-666666666666",
  "expectedRevision": 90
}
```

Before final deadline freeze accepted answers and participant_submit intent;200 returns COMPLETED and result resource (or202 SUBMITTING with status URI and Retry-After if processing remains). While SUBMITTING no edits. Timeout closes final section automatically; **scored EXPIRED versus counts-only EXPIRED is pending T11-D02**. At exact deadline proposed strict profile lets timeout win,409 section_closed with current state. Existing terminal retry returns the frozen outcome, never recalculates. No early global completion/abandon command is proposed; final-section-only submission remains a review item within T11-D02.

Independent successful completion response at11:19Z on the no-early-advance timeline:

```json
{
  "receipt": { "commandId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4", "accepted": true, "appliedRevision": 91, "acceptedAt": "2026-11-20T11:19:00Z" },
  "currentState": { "status": "COMPLETED", "revision": 91, "activeSectionId": null, "effectiveEndedAt": "2026-11-20T11:19:00Z", "finalizationReason": "participant_submit", "serverNow": "2026-11-20T11:19:00Z" },
  "resultPath": "/api/cent/v1/assessment/mock-attempts/11111111-1111-4111-8111-111111111111/result"
}
```

## A6 — Result and review

GET `/mock-attempts/{id}/result` compact current mixed result example:

```json
{
  "contractVersion": 1,
  "attemptId": "11111111-1111-4111-8111-111111111111",
  "examVersionId": "cent-s-2026-2027-r1",
  "rulesSnapshotId": "example-rules-01",
  "scoringPolicyId": "raw-quarter-point-v1",
  "status": "COMPLETED",
  "finalizationReason": "participant_submit",
  "resultBasis": "itatest_raw_mock",
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
  "normalisationStatus": "not_available_to_itatest",
  "comparability": { "signatureId": "example-comparison-cohort-01", "eligibleForCompletedTrend": true, "caveat": "Uncalibrated Itatest practice forms; no official equivalence" }
}
```

Full result additionally supplies ordered per-section object breakdowns, timing/effective end and snapshot/provenance references. T1.1 F05's compact positional arrays are fixtures, not the canonical object DTO. Counts must sum across sections, quarter points=4C−I; zero answers have accuracy displayPercent=null and completion0.00; negatives retain sign. If counts-only expiry is approved, EXPIRED outcome retains counts/status with rawQuarterPoints/rawScore/resultBasis null and a clear no_score_policy reason; never return zero as an unavailable score. Under expired-feedback profile it returns raw values labeled EXPIRED, excluded from completed trends.

GET review uses frozen question/passage/group/option order, selectedOptionId (null for blank), correctOptionId and explanation plus section identity. Example excerpt:

```json
{
  "attemptId": "11111111-1111-4111-8111-111111111111",
  "status": "COMPLETED",
  "excerptOnly": true,
  "passages": [{ "passageSnapshotId": "example-passage-snapshot-01", "text": "The library extended its hours. Visits increased, but the report did not identify the cause." }],
  "questions": [{ "questionId": "33333333-3333-4333-8333-333333333333", "sectionSubjectId": "reading", "position": 1, "passageSnapshotId": "example-passage-snapshot-01", "selectedOptionId": "b", "correctOptionId": "b", "explanation": "The report describes sequence without establishing causation." }],
  "nextCursor": null
}
```

Full review also contains frozen stems/options/media; excerpt omits them to avoid duplication. Access is owner-only and terminal, with post-entitlement-expiry review policy P1-C12 pending. Correctness remains unavailable while ACTIVE/SUBMITTING. Historical review uses original payload/known schema, never a current live key. Unknown schemas produce explicit limitation and preserved raw payload through a safe authorized reader, not fabricated zero results.

## A7 — Existing subject Practice contract, unchanged

These routes are **existing**, relative to `/api/cent/v1`, not the new assessment base. CentUser required.

| Method / path | Contract and validation |
| --- | --- |
| POST `/attempts/` | StartInput Kind,RequestId,optional Course,TopicId; `kind=practice`, valid subject/topic relationship; existing server selects at most20/global60min |
| POST `/attempts/{id}/submit` | `{answers:{questionUuid:zeroBasedOptionIndexOrNull}}`; existing deadline/access/scoring and idempotent result behavior |
| GET `/attempts/{id}` | Existing submitted result, analysis and review key/explanation/topic; no new full-passage/section promise |

Practice start request and compact legacy response projection:

```json
{
  "kind": "practice",
  "requestId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
  "course": "math",
  "topicId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2"
}
```

```json
{
  "id": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3",
  "kind": "practice",
  "createdAt": "2026-11-20T09:00:00Z",
  "expiresAt": "2026-11-20T10:00:00Z",
  "questionsExcerpt": [{ "id": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4", "subject": "math", "topic": "Synthetic topic", "difficulty": "medium", "text": "Synthetic practice question", "options": ["First", "Second", "Third", "Fourth"], "topicId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2", "sourceSectionId": null, "figureSvg": null }]
}
```

The actual existing field is `questions`, not `questionsExcerpt`; this labeled projection avoids claiming an exact selected count. Submit example:

```json
{ "answers": { "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4": 1 } }
```

Existing result/review projection:

```json
{
  "resultExcerpt": { "attemptId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3", "total": 20, "correct": 12, "incorrect": 4, "unanswered": 4, "percentage": 60 },
  "reviewExcerpt": [{ "id": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4", "correctAnswer": 1, "explanation": "Synthetic explanation", "topic": "Synthetic topic" }]
}
```

Actual fields are `result`, `analysis`, `review` with existing breakdowns, not the excerpt aliases. This separate synthetic result is not computed from the one-question start excerpt. Preserve legacy percentage60; do not inject new raw11.00, answered accuracy75%, version labels or section timing. A future passage-capable Practice contract must be explicitly versioned; no new entitlement gate is applied to existing Practice here.

## A8 — Proposed commerce contracts

All proposed paths below are relative to `/api/cent/v1/commerce` and use the existing Cent payment/access infrastructure. P1-C01/C02 prices/tiers and independent Reading sales are APPROVED requirements, not implemented endpoints. Reading uses its own subjectId/offer, syllabus/content scope and independent 12-month item. It is valid alone or in custom/recommended selections; no extra preset discount or duplicate subject count. Recommended academic compositions, benefits, exact term/renewal, refunds, mid-attempt expiry, rounding and quote/checkout behavior remain approval gates. The owner confirms zero users/customers/buyers and no historical customer entitlements needing grandfathering: there is no grandfather-grant/customer-migration API for launch. Existing test/financial records and compatible legacy callbacks remain protected.

| Method / path | Auth | Request / response |
| --- | --- | --- |
| GET `/offers` | Public | Subject offers, approved price/term/benefit/coverage revisions and availability; pending proposals never purchasable |
| GET `/recommended-bundles?goal=...` | Public | Versioned editorial subject sets/rationale; no computed admissions guarantee |
| POST `/quotes` | CentUser | Distinct subjectIds+intent,optional preset revision; owner-bound immutable server quote |
| POST `/orders` | CentUser | `{quoteId,requestId}`; order/lines snapshot and provider redirect;200 retry/201 creation |
| GET `/orders/{id}` | Owner | Dedicated full snapshot, item terms, paid status/provider-safe evidence and current access separately |
| GET `/orders?cursor=...&limit=...` | CentUser | Keyset owner history beyond old200 cap; original order schemas retained |
| GET `/entitlements` | CentUser | Legacy grants plus new subject items/interval states and readable benefits |

Existing POST `/api/cent/v1/me/orders/{id}/verify` and public GET `/api/cent/v1/payments/callback` continue to dispatch by order contract. No second gateway callback is required. Reuse original stored provider/amount. The new order detail should support recovery even when the row is older than the old history cap.

Synthetic quote request:

```json
{ "subjectIds": ["math", "physics"], "intent": "purchase", "recommendedBundleRevisionId": null }
```

Illustrative response using the **APPROVED initial 4,900,000 IRR (490,000 Toman) price per subject and 5% two-subject tier**. Rounding/allocation, 15-minute quote term, benefit and exact entitlement-date policies remain conditional proposals. No quote/checkout behavior is approved or implemented by this example:

```json
{
  "quoteId": "cccccccc-cccc-4ccc-8ccc-ccccccccccc1",
  "currency": "IRR",
  "pricePolicyRevisionId": "example-approved-initial-prices-tiers-01",
  "termPolicyId": "example-12-calendar-months-v1",
  "benefitPolicyId": "example-subject-benefits-v1",
  "createdAt": "2026-11-20T10:00:00Z",
  "expiresAt": "2026-11-20T10:15:00Z",
  "lines": [
    { "subjectId": "math", "offerRevisionId": "example-math-offer-r1", "listAmountRial": 4900000, "discountRial": 245000, "netAmountRial": 4655000, "durationMonths": 12 },
    { "subjectId": "physics", "offerRevisionId": "example-physics-offer-r1", "listAmountRial": 4900000, "discountRial": 245000, "netAmountRial": 4655000, "durationMonths": 12 }
  ],
  "discountPolicy": { "distinctSubjectCount": 2, "discountBasisPoints": 500, "presetAdditionalDiscountBasisPoints": 0 },
  "totals": { "listAmountRial": 9800000, "discountRial": 490000, "taxAndFeesRial": 0, "payableAmountRial": 9310000 },
  "display": { "unit": "TOMAN", "rialPerToman": 10, "payableAmountToman": 931000 }
}
```

Currency contract: every `*Rial` field and provider request uses canonical **integer IRR**; user-facing currency is **Iranian Toman**, at exactly 10 IRR per Toman. `display.unit="TOMAN"` is an explicit display unit, not an ISO payment currency; display fields are derived, never inputs to authorization. Thus list 9,800,000 IRR = 980,000 Toman, discount 490,000 IRR = 49,000 Toman and payable 9,310,000 IRR = 931,000 Toman. Each line lists 4,900,000 IRR (490,000 Toman) and nets 4,655,000 IRR (465,500 Toman). Initial reference price must never be interpreted as 490,000 IRR. Future fractional-Toman display formatting remains pending P1-C03.

Zero tax/fees is a fixture assumption, not an approved tax policy. Server validates prices/rounding/scope and produces the whole quote; frontend amounts never authorize payment. Dates for subject access are not started by quoting. POST `/orders`:

```json
{ "quoteId": "cccccccc-cccc-4ccc-8ccc-ccccccccccc1", "requestId": "cccccccc-cccc-4ccc-8ccc-ccccccccccc2" }
```

Response projection after synthetic verified settlement:

```json
{
  "orderId": "cccccccc-cccc-4ccc-8ccc-ccccccccccc3",
  "commercialContractId": "subject-order-v1",
  "status": "PAID",
  "currency": "IRR",
  "amountRial": 9310000,
  "display": { "unit": "TOMAN", "rialPerToman": 10, "amountToman": 931000 },
  "paidAt": "2026-11-20T10:01:00Z",
  "lines": [
    { "subjectId": "math", "netAmountRial": 4655000, "entitlementItemId": "example-right-math", "startsAt": "2026-11-20T10:01:00Z", "expiresAt": "2027-11-20T10:01:00Z" },
    { "subjectId": "physics", "netAmountRial": 4655000, "entitlementItemId": "example-right-physics", "startsAt": "2026-11-20T10:01:00Z", "expiresAt": "2027-11-20T10:01:00Z" }
  ]
}
```

Actual post-initiation response is PENDING with redirectUrl and immutable amount until verified; this paid example is order detail, not proof that normal checkout settles synchronously. Only approved Development MOCK may do so under existing adapter behavior. New subject item clocks are independent of all old items. Paid state and item set commit together; no partial access. The response contains provider-safe history, never raw gateway body, token or merchant secret.

## A9 — Calendar contract

Proposed GET `/api/cent/v1/assessment/calendar?cycleId=...` returns separate macroPeriods, sessions, registrationPeriods, resultPublications and sources with verification/precision/retrievedAt. Empty future sessions means unannounced/unverified, not no exams. A source-confirmed macro month window can exist while session date/open/close/start are null. The structure page's printed month/day result deadlines remain precision=month_day with cycle-year inference flagged; conflicting regulation wording must be surfaced. Exact live session listings require separate official verification and a maintained freshness policy. No booking/payment endpoint or personal planner contract is added.

## Validation and error vocabulary

Use existing `{code,message}` compatibility with optional currentState/fieldErrors/traceId in new contracts. Localized UI messages are later presentation work; sample English text is not a new localization system.

```json
{
  "code": "section_closed",
  "message": "This section is closed. Saved answers are retained.",
  "currentState": { "status": "ACTIVE", "revision": 4, "activeSectionId": "44444444-4444-4444-8444-444444444444", "serverNow": "2026-11-20T09:30:00Z", "deadline": "2026-11-20T10:00:00Z" }
}
```

| HTTP / code | Trigger | State and recovery |
| --- | --- | --- |
|400 invalid_request / invalid_answer | Missing fields, malformed IDs, foreign question/option in owned attempt, invalid clear encoding | No answer applied; reload accepted state if response uncertain |
|400 duplicate_subject / confirmation_required | Repeated subject ID or missing forfeiture confirmation | No quote/early transition |
|401 framework auth | Existing login expired | Preserve request identity; log in through existing flow; exam clock continues |
|403 access_required | New start lacks approved benefits; protected resource right unavailable | No new attempt/access; legacy rules separate |
|404 attempt_not_found / order_not_found / quote_not_found | Foreign or missing owner resource | No existence leak |
|409 exam_not_ready / exam_unavailable | Shortfall, four-option-only bank, broken group, unavailable release/policies | No timed attempt; no legacy fallback |
|409 configuration_changed / unsupported_exam_contract | Withdrawn/unsupported configuration/client contract | Explicit new selection/compatible reader; no implicit rule substitution |
|409 stale_revision / command_conflict / section_not_active | Race, changed idempotent payload, wrong section | Return current safe state; no input overwrite/skip |
|409 section_closed / final_section_required | Time boundary, completed section, premature complete | Reconcile deadlines, preserve accepted answers; no reopen |
|409 attempt_not_finalized | Result/review while ACTIVE | No correctness leak; use active state |
|202 finalization_pending | Durable SUBMITTING intent | Status location/Retry-After; no alternate score/editing |
|409 quote_expired / requote_required / request_conflict | New order uses expired quote, changed eligibility/policy, reused request with changed quote | No new provider initiation; existing same-request order recovered first |
|409 already_owned / renewal_policy_unavailable | Active/permanent duplicate scope or unapproved renewal | Explicit deselection/review; no silent rebuy/stack |
|409 commercial_policy_unavailable | Missing approved/configured rounding, term, benefit, quote/checkout, tax or other required policy; initial prices/tiers are already approved | No offer/quote/order by inventing remaining policies; no claim approved prices are deployed |
|429 existing rate limit | Too many requests | Respect Retry-After; timer continues; no tight retry loops |
|502 gateway_rejected / gateway_invalid_response | Existing adapter initiation/verification error | Keep same pending order; never infer paid or create replacement |
|503 temporarily_unavailable / payments_not_configured | Backend/provider/config unavailable | Outcome may be uncertain; recover same command/order; no auto time extension |

Provider modes and adapter response codes are **inspected local implementation**, not independently certified latest gateway documentation. No provider call was made. Current legacy error names/statuses remain as implemented; new vocabulary is not retroactively imposed on `/attempts` or `/checkout`.

## Contract acceptance

Later implementation tests must bind every state transition to T1.1 F01–F21, commerce to CP01–CP12, exact score/price arithmetic, idempotency/owner isolation, active-content privacy, deadline equality/catch-up, stale revisions, all-or-nothing rights and legacy readers. Phase 1 validates JSON, arithmetic, local links, document consistency and permitted-file boundaries only. Actual OpenAPI generation, endpoint integration, migrations and runtime tests belong to separately authorized future work.

## Commercial supersession — 2026-11-20

Earlier two-subject fixtures used the incorrect 490,000 IRR base and 931,000 IRR payable total. They are superseded by **4,900,000 IRR (490,000 Toman) per subject** and **9,310,000 IRR (931,000 Toman)** for two subjects at approved 5%. P1-C01/C02 and currency/distinct-count portions of P1-C03/C08 are now approved; the illustrated term timestamps, quote deadline, allocations and benefit scope remain conditional. P1-C09's customer grandfathering proposal is superseded by the approved zero-customer launch and independent paid Reading. Historical log entries are preserved; no runtime payment behavior changed.
