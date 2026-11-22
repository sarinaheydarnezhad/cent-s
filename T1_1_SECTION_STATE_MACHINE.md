# T1.1 — Section state machine

Prepared and revised **2026-11-20**. This is a future Mock Exam contract, not deployed behavior. Official provenance and conflicts are in the [version specification](T1_1_EXAM_VERSION_SPEC.md#official-source-register-and-precedence). Phase 1 explicitly approves independent server deadlines, no carryover/backtracking, confirmed early advancement with warning, acknowledged-answer persistence, intermediate timeout progression and uninterrupted offline time. Exact protocol recommendations and the unresolved final-timeout result policy are distinguished in [PHASE_1_DECISION_REGISTER.md](PHASE_1_DECISION_REGISTER.md).

## Official constraints and simulator boundary

[CISIA structure and syllabus](https://www.cisiaonline.it/en/cent/cent-s/structure-and-syllabus) requires ordered timed sections, advancement at timeout, no reuse of leftover time, and no reopening a prior section. [CEnT rules](https://www.cisiaonline.it/en/cent/all-about-CEnT/CEnT-rules), §§4.1.2/4.1.4/4.2.4, addresses final-section submission and supervised exceptions. These sources were retrieved 2026-11-20.

The rules' §4.1.2 timeout wording and §§4.1.5/4.2.3 explicit-submission requirements do not establish a single unambiguous final-timeout recording policy. Official technical interruptions can involve a commission; browser closure in an unsupervised Itatest Mock Exam has no commission. Approved automatic progression, acknowledgment-based persistence and no-pause/reconnection behavior are **Itatest product decisions**, not claims about CISIA software. Exact deadline boundary and concurrency protocol remain technical recommendations.

Recommended profile for review (`continuous-v1`, T11-D02/D03): start the next section immediately on closure, keep timers running offline, automatically finalise acknowledged answers at final timeout as **EXPIRED**, and distinguish that result from **COMPLETED** participant submission. The alternative explicit-submission-only profile is described below; it is not interchangeable within a running attempt.

## State definitions

| Layer | State | Meaning |
| --- | --- | --- |
| Attempt | INITIALIZING | Transient validation/assembly before an attempt is committed; no timer or usable questions issued |
| Attempt | ACTIVE | Committed immutable snapshot and exactly one active section |
| Attempt | SUBMITTING | Durable finalisation intent; answers locked; retry/recovery must finish this intent, not reopen time |
| Attempt | COMPLETED | Terminal, participant submitted from final section before its deadline; may contain unanswered questions |
| Attempt | EXPIRED | Terminal, final deadline elapsed; recommended profile stores a timeout result from accepted answers |
| Section | PENDING | Snapshot exists; no activation/deadline yet; cannot view or answer its questions |
| Section | ACTIVE | Current section; navigation/editing allowed within this section until deadline |
| Section | CLOSED_EARLY | Terminal section lock caused by confirmed advancement; remaining time forfeited |
| Section | CLOSED_TIMEOUT | Terminal section lock at its deadline |
| Section | CLOSED_SUBMISSION | Final section locked by valid participant submission |
| Connection observation | connected / disconnected / unknown | Informational only; never pauses or extends a server deadline |

“Interrupted” describes loss of interaction with an ACTIVE attempt; it is not a resettable clock state. “Incomplete” describes answer coverage (`unanswered > 0`) or lack of a completed submission; it is not an alternative mutable scoring state. A completed attempt can have zero answers. An expired attempt can have every question answered. Authentication sessions and exam attempts are separate concepts; no session behavior is changed.

## Timing and locking invariants

1. Use server UTC instants with explicit offsets; browser time and device timezone have no authority. Store activation and deadline for each activated section.
2. `deadline = activatedAt + snapshotted durationSeconds`. Editing requires `serverDecisionTime < deadline`. Equality is expired; no grace period, network-latency allowance or client timestamp backdating (proposed T11-D03).
3. State reconciliation and mutation validation occur under the same serialised attempt operation. Check due timeouts before accepting any command. The authoritative decision time is captured when this operation owns the attempt state, not when a browser sends a packet or an ingress proxy receives it. Persistence must durably commit before success is acknowledged.
4. At early closure time `t`, close the current section and activate the next at `t`. At timeout `d`, close at `d` and activate the next at `d`, even if a worker observes it later. Each successor receives its own full allowance, without the previous remainder.
5. Reconcile repeatedly until the current deadline is later than server time or the final section has closed. A delayed worker/reconnection must not grant extra time. Record both effective transition time and processing time.
6. At most one ACTIVE section; all earlier sections terminal; later sections PENDING. Section IDs/order come from the snapshot. No skip, reopen or direct jump command is valid. No ordinary inter-section waiting screen stops the clock.
7. Early advancement requires a visible warning before confirmation: remaining time is forfeited and saved answers lock permanently. Cancel leaves the current section active while its clock runs. Confirm sends the irreversible command; a delayed confirmation after deadline reconciles timeout first. Merely answering every question never advances. Navigation within the active section is allowed (simulator policy). Warning/forfeiture are approved P1-A03.
8. Both browser countdown and background worker are aids. Every authoritative read/mutation reconciles deadlines so correctness does not depend on either remaining alive. Clock health must be monitored; a detected server clock failure rejects unsafe writes and records an incident rather than extending deadlines silently.
9. Once SUBMITTING or terminal, no answer changes. Finalisation records counts/result and reason exactly once, atomically with the final answer/state snapshot. Failure retries use that frozen intent and original effective end time.
10. No scheduled pauses or accommodation offsets are inferred. CISIA supervised exceptions are not simulated. If future accommodations are approved, their durations/policy must be snapshotted before start under a separate scope; never patched into a running standard attempt.

## Transition table — recommended profile

| From | Trigger / guard | Atomic effect | Result |
| --- | --- | --- | --- |
| No attempt | Start with supported version/release; all quotas/dependencies valid | Resolve immutable snapshots, commit all sections/content, activate section 1 at commit decision time | ACTIVE; first deadline initialised |
| INITIALIZING | Validation/assembly fails | No playable attempt or timer committed | Unavailable response; no partial official-format exam |
| Existing attempt | Retry same start identity and same original request | Return existing attempt with reconciled state; do not resolve current alias again | Original version/times preserved |
| ACTIVE | Save/select/change/clear answer; correct current section/revision; time strictly before deadline | Validate option ID or null; persist answer and increment state revision | ACTIVE; same deadline |
| ACTIVE non-final section | Confirm advance; time strictly before deadline | Freeze accepted answers; CLOSED_EARLY at `t`; activate immediate successor at `t` | ACTIVE; successor deadline initialised |
| ACTIVE non-final section | Server time at/after deadline | CLOSED_TIMEOUT at `d`; activate successor at `d`; repeat overdue transitions | ACTIVE or finalisation if entire remainder elapsed |
| ACTIVE final section | Submit; time strictly before deadline | CLOSED_SUBMISSION; freeze answers; durable participant finalisation intent | SUBMITTING, target COMPLETED |
| ACTIVE final section | Server time at/after deadline | CLOSED_TIMEOUT; freeze answers; durable timeout finalisation intent | SUBMITTING, target EXPIRED |
| SUBMITTING | Finalisation succeeds | Persist immutable result/counts/reason and final state together | COMPLETED or EXPIRED as recorded by intent |
| SUBMITTING | Network/process failure | Keep frozen intent; server retries; return processing status if needed | SUBMITTING; never restart deadline |
| COMPLETED / EXPIRED | Retry submit, resume or result read | Return existing outcome/status with original end time; no rescore | Same terminal state |
| ACTIVE | Explicit abandonment request | Recommended profile has no early global submit/abandon command; learner may leave, clock continues | ACTIVE until final deadline; decision T11-D02 |

`Advance` from the final section is invalid: use `Submit`. `Submit` before the final section is invalid, even if the learner wants to quit; they may sequentially close sections early and then submit. Empty sections and blanks require no invented answers. Review/keys are withheld until terminal finalisation; future-section content is not exposed early.

## Answer persistence and concurrent commands

Approved P1-A03: persist each selection or clear (`null`) on the server; only a durable server acknowledgment is a saved answer. Missing and explicit null both score unanswered. Show unsaved status while a request is pending. Local storage is a recoverable cache, not proof of acceptance. Proposed T11-D03 protocol: an acknowledgment returns the attempt revision and server time; serialization/idempotency details below are architecture recommendations.

Mutations carry attempt/section identity, expected revision and an idempotency command ID. A retry with the same ID and same payload returns its recorded acknowledgment without reapplying it, plus current state. Reuse with a different payload fails. Unknown questions, invalid options, wrong section and stale revisions are rejected without partial application. Rejected commands return current authoritative state where permitted. Concurrent tabs use the same revision guard; this is attempt consistency, not a new account/device/study-session policy.

Advance/submit confirms only the last acknowledged revision. Any pending answer must finish saving first; advance/submit cannot upload an unacknowledged whole-answer map. In a race, the serialised operation that commits first determines revision; the other receives a stale-state or section-closed response. At/after deadline, reconciliation takes precedence even when the client still displays time. Already acknowledged content is retained; late queued answers are rejected and remain unsaved.

## Reload, reconnection, browser closure and service interruption

| Event | Proposed behavior |
| --- | --- |
| Reload before deadline | Reconcile on server; restore accepted answers and active section/deadline; do not reset timer |
| Return after one or several deadlines | Apply each overdue boundary at its original effective time; restore the now-current section or EXPIRED result |
| Browser/tab closes | No reliance on unload events; time and automatic transitions continue; unacknowledged selections may be lost |
| Offline editing | Mark unsaved; do not count it as accepted. On reconnect, retry only if the original section remains active and before deadline; never backdate |
| Start/advance response lost | Retry same command ID; return its original effect plus reconciled current state; do not create a new attempt/section clock |
| Submit response lost | Retry/retrieve the same frozen finalisation; never produce a second result |
| Login expires or learner logs out | Existing auth rules apply; timer continues. Resume requires the same authorised owner through existing login; no token lifetime change |
| Backend/worker restarts | Recover snapshots, accepted answers and intents; reconcile effective deadlines. No extra time is awarded automatically |
| Backend outage prevents saving | Acknowledged answers remain authoritative; later local answers cannot be proved timely. Flag a service incident. Any compensation/restart is a separate, linked new attempt under an approved support policy, never rewriting old answers/deadlines (T11-D07) |

No cross-device continuation promise is made. No new device registration, lease, takeover or authentication mechanism is part of this specification.

## Final timeout decision requiring owner approval

**Recommended:** final timeout produces EXPIRED with `finalizationReason=final_section_timeout` and `resultBasis=itatest_raw_mock`. Retain a score using only accepted answers and the full snapshotted denominator, including never-viewed questions as unanswered. Show expiry/interruption and answer coverage. Exclude EXPIRED results from completed-mock improvement comparisons by default. This is local educational feedback, not proof of official completion or validity.

**Alternative requiring explicit selection:** final timeout produces EXPIRED with retained answers/counts but no scored result; only a timely final-section submission produces a result. A later acknowledgment click cannot change deadlines or accept new answers; any proposed post-deadline recording grace policy needs its own explicit revision and fixtures.

These profiles cannot both govern the same attempt. T11-D02's **final-result choice** remains pending in Phase 1; the approval of section timeout progression does not implicitly approve a scored final timeout. Select the result profile before dependent implementation; examples use the recommended profile conditionally. The conflicting official clauses remain unresolved even if the owner selects a local policy. Breaks, proctor overrides and official admission validity are not implied.

Concrete timing/race fixtures are in [API examples and fixtures](T1_1_API_EXAMPLES_AND_FIXTURES.md). Existing unversioned attempts follow the [legacy policy](T1_1_LEGACY_ATTEMPT_POLICY.md), including the current 60-minute expiry rejection; this proposed engine must not retrofit them.
