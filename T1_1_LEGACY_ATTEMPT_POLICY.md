# T1.1 — Historical and legacy attempt policy

Prepared and revised **2026-11-20**. Phase 1 approves unchanged historical values, original running-attempt rules/snapshots and comparisons only between compatible structures/scoring. Internal labels, exact release mechanics, incident policy and strict comparison signatures remain recommendations; see [current decisions](PHASE_1_DECISION_REGISTER.md). No record is classified, migrated or rewritten by this document.

## What the existing assessments represent

Phase 0 [audit](PHASE_0_AUDIT.md), [comparison](EXAM_VERSION_COMPARISON.md), [feature inventory](FEATURE_INVENTORY.md) and [migration risks](DATA_MIGRATION_RISKS.md) describe educational assessments. T1.1 static inspection of `D:/Lerona/Backend/backend/Cent.Module/CentPractice.cs` and the corresponding frontend confirms:

| Evidence | Historical meaning / limitation |
| --- | --- |
| Start accepts diagnostic, simulator and practice; optionally filters a course/topic | A route/kind name is not proof of an official blueprint |
| Randomised subject/topic round-robin, at most 20 active matching questions; any positive number accepted | Educational sample, not a proven 55-question five-section official exam |
| Start/Submit use CreatedAt + 60 minutes | One global allowance; not the historical 110-minute section blueprint |
| `CentAttemptQuestion.SnapshotJson` includes stem/options/key/explanation/topic/media provenance | Strong question-level preservation; not a complete exam-version/rules snapshot |
| CentAttempt has Kind, scope, DurationMinutes, timestamps and ResultJson | DurationMinutes defaults to 60, but deadline paths hardcode 60; it does not prove other historical runtimes |
| Answers are persisted during submission; client retains pending answers in sessionStorage | No established server answer autosave/resume mechanism for running attempts |
| Stored Percentage is rounded correct/total | Preserve educational metric; no official negative raw scoring proved |
| Submission after the global deadline is rejected; submitted retry returns stored result | No automatic scored-expiry path established |

No database was queried. Local source and audit findings do not prove that every deployed historical attempt used exactly this implementation. Existing attempts cannot automatically be declared “CEnT-S 2025–2026.” Their stored evidence must decide what is known, and unknowns remain explicit.

## Evidence-based classification

| Classification | Sufficient evidence | Required action in a future authorised transition |
| --- | --- | --- |
| Versioned historical attempt | Reliable immutable rule/version snapshot or immutable reference resolving the original complete blueprint, timing, scoring and question/passage content | Retain original version/rules and stored outcome, including versions outside these two blueprints; never normalise to the latest version |
| Legacy educational assessment / unversioned | Question snapshots/results exist but original full rule/version evidence is missing | Proposed `classification=legacy_unversioned`, `examVersionId=null`; preserve any known kind/scope/metric without inferring sections |
| Partial/contradictory historical evidence | Missing snapshots, corrupt/unsupported result, inconsistent count or unresolvable rule reference | Legacy/unversioned plus explicit integrity/evidence limitation; preserve original bytes. Do not fabricate a key, question or score |

A timestamp in the old cycle, five subject names, `kind=simulator`, question count, filename, current source branch or UI copy is insufficient version evidence. Even a matching 55-question count cannot prove section order/timers/scoring. A complete trustworthy snapshot may establish original rules, but never an official CISIA sitting or admission validity.

Classification metadata is conceptually separate from stored results. A future additive mapping must retain source/provenance, evidence status and reviewer; if existing storage cannot represent it safely, defer the write rather than changing historical ResultJson. This is a policy specification, not a migration design.

## Preservation invariants

1. Preserve original attempt/user/question IDs, ordering, snapshots, selected answers, submitted/created timestamps, ResultJson and stored analysis values exactly. No fifth option, Reading section, inferred deadline or new negative score is inserted retrospectively.
2. Preserve existing educational percentage, maximum/question count and rounding meaning. New raw score fields are unavailable for legacy records unless originally and reliably stored; do not derive a replacement from old counts.
3. Preserve historical mastery records/evidence. Source inspection establishes live computed mastery rather than immutable historical mastery snapshots; do not claim such snapshots exist. No version transition may silently recalculate or reset old learning meaning.
4. Later question corrections or retirements apply to future content releases. They do not rewrite a submitted result/key. If a correction notice is needed, attach separate provenance without overwriting original evidence.
5. Keep historical readers available, including unknown-schema fallback that reports the limitation rather than substituting zero. Do not parse and reserialise stored JSON merely to add a version label.
6. History labels distinguish educational legacy results, historical-format practice and current-format practice. No official normalised-result or format-equivalence claim is inferred.

## Existing and running attempts at a future transition

Proposed release policy: preserve each attempt's original handler/contract and permit already-started legacy attempts to drain under their original rules. New full mocks use a separate explicit version-aware start contract. Existing diagnostic/practice starts retain their behavior; activating a full-mock version does not convert those modes.

| Situation at activation | Required behavior |
| --- | --- |
| Submitted legacy result | Return original stored result and analysis through a compatible reader; additive display classification only if separately approved |
| Running unversioned assessment under inspected legacy contract | Preserve original global CreatedAt + 60-minute deadline, client answer flow and submission behavior. Do not convert to section timers or autosubmit |
| Legacy attempt still in time, original browser answers available | Existing authorised submit path remains available; no storage-key cleanup or forced restart |
| Legacy attempt expired or local answers lost | Retain original evidence; do not invent recovery/answers or generate a new score. Offer a distinct new attempt only through the existing/new authorised flow |
| Running attempt with reliable rule snapshot | Continue the exact original policy, even if its version is retired for new starts |
| Start retry arrives after default version switches | Same request identity returns original attempt; a changed semantic request fails rather than creating a new version under the same identity |
| New versioned full-mock start after activation | Resolve an explicitly available, eligible version; atomically freeze rules/content before timing starts |
| Version retired or content removed for new starts | Prevent new starts under it; retain snapshot payloads/readers for running and historical attempts |
| Rollback after new starts exist | Disable further new starts if needed; retain compatible execution/readers for attempts already issued. Do not route them into legacy 60-minute behavior |

The inspected legacy path still checks current subscription on simulator submission. Preserve that legacy behavior. Phase 1 documents a separate proposal for new Mock Exam start admission and post-expiry review (P1-C05/P1-C12 in the current register); it is not approved and never changes an old attempt or auth session. Do not introduce an access bypass through a documentation policy.

A future release must demonstrate that old and new start identities, browser caches and handlers cannot be confused. Retain existing legacy storage keys until attempts drain; any future new cache key must include owner, attempt ID and rules identity. No cache-clearing operation is performed now.

## Comparability and examples

| Example | Classification / comparison |
| --- | --- |
| Old mixed assessment, 20 questions, 12 correct, 4 incorrect, 4 blank, stored Percentage=60 | Legacy/unversioned; preserve 60. Do not add 11.00 as an official-format raw score or relabel it as 2025–2026 |
| Old record dated December 2025 with Mathematics and Biology only | Date/subjects establish no complete exam version; retain original scope and unknown version |
| Complete reliable 55-question/110-minute rules snapshot, with stored result | Retain that historical version/rules; do not add Reading or rescore |
| 55-question result and 65-question result, each “60%” in different metrics | Separate labelled results; no improvement delta or equivalence |
| New version becomes active while section 2 of a versioned exam is running | All later sections/questions/times/scoring remain from the original snapshot |

Comparison requirements are in [scoring specification](T1_1_SCORING_AND_RESULTS_SPEC.md#comparability-policy). They are proposed future filters, not changes to today's PersonalResults behavior.

## Review gate and operational limitation

Owner approval remains needed for proposed labels/defaults, precise rollback mechanics, incident compensation and comparison signature details; preservation itself is approved. Actual cohort classification requires separately authorized operational evidence; [T1.2](T1_2_LEGACY_PURCHASE_RECONCILIATION.md) now specifies purchase compatibility without accessing any database. No deployment, host changes, migration or historical write is included. If future compatibility depends on shared/Lerona code, report that dependency as a limitation; no Lerona inspection or change is authorized.
