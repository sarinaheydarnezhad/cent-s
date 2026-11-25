# Academic release review

Status: **BLOCKED pending independent specialist sign-off for all six subjects.** Structural verification and a package named "reviewed" do not constitute scientific certification. No specialist approval was invented, and no educational text or mathematics content was rewritten in Phase 5.

| Subject | Imported question bank | Required independent review |
|---|---:|---|
| Mathematics | 201 | Recheck the 49 exact corrections against originals; derivations, domains, boundary cases, notation, four-option keys, explanations and all 121 figure placements. Preserve unmodified teaching and IDs. No new subject mock was supplied. |
| Physics | 281 | Six chapters / 68 teaching lessons; dimensional consistency, sign conventions, idealizing assumptions, vectors, diagram labels, 36 added practice and 25 mock items. |
| Chemistry | 391 | Ten chapters / 50 canonical lessons; chemical conventions, reaction balance, equilibrium assumptions, conditions, numerical precision, distractors and the 50 mock items. The new canonical document remains a draft. |
| Biology | 421 | Five chapters / 41 teaching lessons; biological scope and exceptions, terminology, figure labeling, incorporated supplemental topics, answer explanations and 50 mock items. |
| Logic | 94 | The targeted 27-record patch, complete supplementary lesson and 15 mock items; quantifiers, necessary/sufficient conditions, ambiguity, Venn relationships and the broad combined topic mapping. Keep the quarantined exercise quarantined. |
| Reading | 83 | Ten retained lessons; five canonical historical and ten new passages; the 50 mock items; answer support in the passage, distractor plausibility, inference scope and language/difficulty calibration. |

Each specialist should record reviewer identity, expertise, date, package/catalog hash, scope, question/lesson IDs, defects, resolution and explicit release decision. At least one independent specialist per subject must approve; additional language/accessibility review may be necessary. No sign-off exists in this phase's evidence.

## Checklist for each subject

- [ ] Match the package SHA-256 and compiled catalog hash to `verification/academic-structure.json` and Phase 4 package evidence.
- [ ] Review every teaching lesson and diagram against the approved syllabus, including conditions, units, definitions and omitted prerequisites.
- [ ] Independently solve every question; check answer index, answer text, explanation, unique defensible answer and plausible distinct distractors.
- [ ] Check open-response self-check solutions separately; these are teaching exercises, not automatically graded questions.
- [ ] Verify chapter-review membership and mock scope; intentional chapter/practice reuse is not a second unique question.
- [ ] Confirm passage-dependent questions remain attached to the correct passage/group. Fixed Reading mocks contain two passages and ten questions.
- [ ] Approve syllabus/topic mappings and coverage. Logic's broad supplementary mapping must not be represented as precise legacy-skill calibration.
- [ ] Judge difficulty and timing using independent learner evidence; authored difficulty labels and raw practice scores are not calibrated official exam scores or certified CEFR levels.
- [ ] Resolve each scientific ambiguity with a cited decision and traceable correction, then repeat structural, scoring and regression verification.
- [ ] Approve a new immutable academic/content release using the established authoring/review process. Obtain separate document-publication and subject-offer approvals.

## Evidence and unresolved scope

`verification/academic-structure.json` rechecks 1,471 unique bank IDs, distinct options, answer bounds, explanations, assessment membership/subject consistency and passage relationships. The 42 definitions comprise 21 chapter reviews and 21 mocks; mathematics has no added assessment definition. Structural checks pass. Phase 4 reports no unresolved compiler conflicts or unknown replacement targets; this is not a finding that all scientific ambiguities are resolved.

The remaining scientific risks are specialist interpretation of assumptions and edge cases, ambiguous distractors, diagram semantics, syllabus completeness and difficulty calibration. These are **NOT TESTED** independently. No new verified scientific defect was established during Phase 5, so content was preserved.

Historical notes cannot be automatically reassigned where a lesson split is ambiguous: of 210 mappings, 34 are one-to-many and 62 have no equivalent section. The old document/page/quote/revision remain available; an owner/editor must choose a new cross-document anchor explicitly. This must not be confused with missing academic coverage or silently certified by a migration.

Both new documents stay unpublished. An explicit Development-only grant allows the named existing student to review them with current entitlement; it is ignored outside Development and is not academic approval. Administrator preview is read-only and records `ADMIN_CONTENT_PREVIEW`; it neither approves a subject offer nor publishes a document. Existing review-gated sales, immutable releases and explicit publication remain separate. Do not use fixture publication flags or direct database publication updates to satisfy this checklist.
