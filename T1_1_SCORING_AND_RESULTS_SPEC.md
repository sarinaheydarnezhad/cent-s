# T1.1 — Scoring and results specification

Prepared and revised **2026-11-20**. Official raw weights and Phase 1-approved formulas are fixed: `Raw Score = Correct - (Incorrect × 0.25)`, `Accuracy = Correct / Answered × 100`, `Completion Rate = Answered / Total Questions × 100`. Existing diagnostics, Practice, result values and mastery are preserved. Exact encoding/rounding and strict comparison signatures are technical recommendations; see [current decision status](PHASE_1_DECISION_REGISTER.md).

## Official raw points

[CISIA structure and syllabus](https://www.cisiaonline.it/en/cent/cent-s/structure-and-syllabus) and [CEnT rules](https://www.cisiaonline.it/en/cent/all-about-CEnT/CEnT-rules), §1.4, verified 2026-11-20: correct **+1**, incorrect **−0.25**, unanswered **0**. Each question has one correct option. Use the attempt's frozen key and presented options, never the current live question record.

For each section let `N` be its full snapshotted quota, `C` correct, `I` incorrect, `U` unanswered, and `A` answered. Every question contributes exactly once. Missing selections and explicit null are unanswered; an invalid option or foreign question is rejected before persistence, never silently treated as incorrect.

| Field | Definition | Unit / edge behavior |
| --- | --- | --- |
| correctCount, C | Accepted non-null selection matches frozen key | Integer ≥ 0 |
| incorrectCount, I | Accepted non-null selection differs from frozen key | Integer ≥ 0 |
| unansweredCount, U | No accepted selection, including cleared or never-viewed questions | Integer ≥ 0 |
| answeredCount, A | `C + I = N − U` | Count actual selections, not dictionary keys or save events |
| questionCount, N | Full assigned section quota | Invariant `C + I + U = N`; never shrink to viewed questions |
| rawScore | `C − 0.25 × I` | Exact decimal points; negative allowed; no clamp |
| maximumRawScore | `N` | Points |
| minimumRawScore | `−0.25 × N` | Points; all incorrect |
| accuracy | `C / A`, if `A > 0` | Answer accuracy ratio; null when nothing answered |
| completionRate | `A / N`, if `N > 0` | Answer coverage ratio; zero for a valid all-blank section |
| correctOfTotalRate | `C / N`, if `N > 0` | Optional explicitly named metric; never silently substituted for accuracy |

Accuracy means correctness **among answered questions** in the approved product contract. The table expresses ratios; displayed percentages multiply those ratios by 100. It is not an official CISIA score definition. “Completion rate” means answer coverage, not whether an attempt was formally submitted. Zero answers yield null accuracy and zero completion for valid N>0; no division by zero. Zero-question sections are invalid for these blueprints; a generic empty aggregate has null ratios, not a fabricated score percentage.

For totals, sum section `N/C/I/U/A/rawScore/maximumRawScore`. Calculate total ratios from total counts; do not average section percentages. Keep attempt terminal state and finalisation reason separate from counts.

## Exact arithmetic and presentation

Proposed representation: calculate `rawQuarterPoints = 4 × C − I` as an integer and represent points as the exact decimal quotient `/ 4`; a fixed decimal type is equally valid. JSON decimal point values are strings such as `"7.50"`, not floating-point approximations or whole percentages. Weights are `"1.00"`, `"-0.25"`, `"0.00"`; maximum/minimum points use the same two-decimal representation.

Ratios may be repeating decimals. Store or expose their integer numerator/denominator; derive percentage displays using decimal arithmetic, round half up to two decimal places, and retain the counts as authority. Undefined accuracy has numerator 0, denominator 0 and display null; do not render it as 0% correct. Do not round sections before summing scores. `10/13` displays 76.92%, while `13/15` displays 86.67%.

Never convert a negative raw score to zero, label `rawScore / maximum` as accuracy, or add a difficulty estimate. A score out of 65 and a score out of 55 must retain their denominators. Dividing by the maximum does not establish equivalence.

## Verified examples

| Example | N | C | I | U | A | Exact raw points | Maximum | Accuracy | Completion |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Current Reading, mixed | 10 | 8 | 1 | 1 | 9 | 7.75 | 10.00 | 88.89% | 90.00% |
| Mathematics, mixed | 15 | 10 | 3 | 2 | 13 | 9.25 | 15.00 | 76.92% | 86.67% |
| Biology, negative | 10 | 1 | 8 | 1 | 9 | −1.00 | 10.00 | 11.11% | 90.00% |
| Physics, all wrong | 5 | 0 | 5 | 0 | 5 | −1.25 | 5.00 | 0.00% | 100.00% |
| Chemistry, all blank | 10 | 0 | 0 | 10 | 0 | 0.00 | 10.00 | Undefined | 0.00% |
| All correct, historical | 55 | 55 | 0 | 0 | 55 | 55.00 | 55.00 | 100.00% | 100.00% |
| All wrong, historical | 55 | 0 | 55 | 0 | 55 | −13.75 | 55.00 | 0.00% | 100.00% |
| All blank, current | 65 | 0 | 0 | 65 | 0 | 0.00 | 65.00 | Undefined | 0.00% |
| All wrong, current | 65 | 0 | 65 | 0 | 65 | −16.25 | 65.00 | 0.00% | 100.00% |
| All correct, current | 65 | 65 | 0 | 0 | 65 | 65.00 | 65.00 | 100.00% | 100.00% |

Full current-version mixed result:

| Section | N | C | I | U | A | Raw points |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Reading | 10 | 8 | 1 | 1 | 9 | 7.75 |
| Mathematics | 15 | 10 | 3 | 2 | 13 | 9.25 |
| Reasoning | 15 | 9 | 4 | 2 | 13 | 8.00 |
| Biology | 10 | 6 | 2 | 2 | 8 | 5.50 |
| Chemistry | 10 | 5 | 3 | 2 | 8 | 4.25 |
| Physics | 5 | 3 | 1 | 1 | 4 | 2.75 |
| **Total** | **65** | **41** | **14** | **10** | **55** | **37.50** |

Check: `4 × 41 − 14 = 150` quarter-points; `150 / 4 = 37.50`. Overall accuracy is `41/55 = 74.55%`, completion is `55/65 = 84.62%`, and optional correct-of-total is `41/65 = 63.08%`. These are three different metrics.

The equivalent five-row arithmetic fixture omitting Reading has 55 questions, C=33, I=13, U=9, A=46, raw=29.75, accuracy=71.74%, completion=83.64%. This is a separate synthetic historical-blueprint example, not a conversion of a current or legacy result.

## Result state and interpretation

| Situation | Recommended result behavior |
| --- | --- |
| Participant submits final section before deadline | COMPLETED; compute full denominator even with blanks; reason `participant_submit` |
| Final timeout | Conditional on T11-D02: EXPIRED; raw feedback from accepted answers, labelled expired; no official-completion claim |
| Interrupted but still ACTIVE | Show saved answer coverage only; do not reveal correctness, keys or partial scored result |
| Finalisation in progress | SUBMITTING; status/retry information, no alternate provisional score |
| Unsupported historical schema or missing evidence | Preserve stored payload and explicit limitation; do not guess a new score |

Result fields must distinguish `examVersionId`, `rulesSnapshotId`, `scoringPolicyId`, `resultBasis`, `status`, `finalizationReason`, counts, exact points, ratios, and comparability metadata. Review uses frozen stem/options/passage/media and key/explanation only after finalisation. Immediate Itatest raw feedback is local educational output. No universal pass/fail threshold, percentile, predicted admission or university-equivalent score is established by these sources. University rules remain external and institution-specific.

## Official normalisation boundary

CISIA computes official section difficulty adjustments from its private question response statistics and produces official normalised section/total results after the relevant macro-period's administrations and statistical processing. The regulations describe section-level coefficients; the public structure page summarises that process. Itatest has neither the private statistics nor a normalisation dataset and cannot reproduce or estimate an official result.

The Itatest result must use `resultBasis=itatest_raw_mock` and `officialNormalisedScore=null`, `normalisationStatus=not_available_to_itatest`. Null means unavailable, not zero. Never generate coefficients, add a guessed offset, use local mastery/difficulty labels as coefficients, or call raw points an official normalised score. A future verified import of an actual official result would need a separate provenance contract; it is not specified as an implemented capability here.

Normalisation is not an immediate per-attempt calculation. Specific publication wording conflicts are recorded in the [source register](T1_1_EXAM_VERSION_SPEC.md#official-source-register-and-precedence); do not equate macro-period end processing with the last calendar day or invent release/session dates.

## Legacy metric and educational mastery separation

Direct source evidence: `CentPractice.Score` stores `Percentage = round(100 × correct / total)`, with midpoint rounding away from zero. Its `Percentage` is neither this proposal's answered-question accuracy nor official raw points. Preserve that field/value and label its historical meaning as “Legacy correct-of-total percentage.” Do not rename its interpretation by passing it through the new accuracy field.

`src/services/scoring.ts` has an optional −1/3 penalty and percentage clamp; the inspected production pages do not use that helper. It is not the official scoring authority and must not be blanket-replaced as part of this task. Legacy samples/tests remain intact.

`CentLearning.cs` reports method `latest-distinct-10-v2`: latest submitted evidence per active question, up to ten distinct items per topic, minimum three for provisional mastery, and all imported topics in the subject progress denominator. This is educational evidence aggregation, not mock scoring or official normalisation. It is a computed view in inspected source; a durable historical mastery snapshot is not established.

No historical result, analysis, answer, mastery record or evidence is recalculated. Future blueprint/content changes must preserve prior evidence and must not silently change the interpretation of historical mastery. Whether new COMPLETED or EXPIRED mocks contribute educational evidence is pending T11-D08; recommended default is no new automatic feed until separately specified and approved. Existing diagnostic/practice contributions remain unchanged. A future scope-aware mastery view must identify its syllabus/method and retain the old interpretation; it cannot reset progress simply because Reading/topics were added.

## Comparability policy

Preservation and comparisons only between compatible structures and scoring are approved requirements P1-A06. Proposed strict comparison filter (remaining T11-D05 detail): allow a descriptive raw-points trend only for COMPLETED Mock Exams sharing the same exam version, rules/scoring/timing revision, section quotas, syllabus/eligibility scope and approved content-comparison cohort. Different forms within that cohort are **uncalibrated practice results**; shared blueprints do not establish statistical difficulty equivalence.

| Pair | Permitted interpretation |
| --- | --- |
| Same approved comparison signature | Descriptive practice trend with form/difficulty caveat; never official equivalence |
| Historical 55-question and current 65-question versions | Separate labelled history; no total improvement delta or score conversion |
| Legacy/unversioned and either official blueprint | No comparable-exam claim, even if dates/subjects overlap |
| Expired and completed | Separate statuses; no completed-mock trend by default |
| Same subject across different versions | Separate labelled metrics only; no inferred comparability without independently approved scope/timing/content evidence |
| Unknown version/scoring/content provenance | Not comparable; display the reason instead of zero change |

The existing `PersonalResults.comparable()` check of kind and topic counts is insufficient. No current result page or comparison behavior is changed by this specification.
