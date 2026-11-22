# T1.3 — Content, questions and shared passages

Date: **2026-11-20**. Proposed extensions to the existing Cent curriculum/content model, not a parallel CMS. No content IDs, imports, questions, source bytes, published lessons, media, notes or progress were changed. See [content gap audit](CONTENT_GAP_ANALYSIS.md) for the bounded review inventory, not scientific certification.

## Existing foundation and six-subject model

`CentCourse(Code, TrainingId)` is the stable subject identity. Existing `CentChapter`, `CentTopic`, `CentSource`, `CentSourceSection`, `CentSourceExercise`, `CentDocument`, image pages and document-reader `CentSection` already connect sources to teaching and question provenance. Reuse them. Existing code has five static course identities; proposed `reading` adds the sixth without renaming `logic` or the existing document-reading feature.

| Subject | Lessons/materials and topic scope | New full Mock Exam eligibility | Access |
| --- | --- | --- | --- |
| Reading | New B2 skills/topics and licensed/original shared texts under existing course/training/content publication | Current first section,10 questions/30 minutes; no automatic historical mapping | APPROVED independent sixth subject/offer, own syllabus/content, 12-month item; same price/tier rules; no launch grandfathering (P1-C09) |
| Mathematics | Existing math sources/chapters/topics; stable IDs | Explicit reviewed math revision mapping to15/30 | Subject benefits, pending matrix |
| Reasoning | Existing logic/data/text reasoning; stable `logic` | Reviewed logic mapping to15/30; not Reading | Existing rights plus explicit future subject items |
| Biology | Existing course/topic/material relations | Reviewed biology10/20 | Independent term |
| Chemistry | Draft coverage and nine missing dedicated nuclei per Phase 0 | Reviewed chemistry10/20 only after content review | Do not promise complete coverage from draft |
| Physics | Existing physics curriculum | Reviewed physics5/10 | Independent term |

The actual local package has819 four-option questions,39 sources,190 topics and no dedicated Reading passage bank according to Phase 0. Phase 1 rechecks importer/entity assumptions, not all scientific keys or deployed rows. Matching a subject/topic title or current `Active/Kind=both` never establishes eligibility. Existing four-option Practice remains readable and unchanged; five-option official-format content needs independently reviewed revisions.

## Conceptual relationships

| Object | Proposed fields / relationships |
| --- | --- |
| SyllabusVersion | Source-backed official family/scope/revision/effective evidence; immutable when published |
| SyllabusNode | Version, stable local skill reference, subject, official label/reference; no invented official node IDs |
| TopicSyllabusMapping | Existing TopicId ↔ SyllabusNode; coverage `unmapped/partial/covered/supplementary/out_of_scope`, reviewer/date/evidence |
| LessonApplicability | Existing document/source-section revision ↔ topic/syllabus mappings; teaching coverage distinct from question eligibility |
| QuestionRevision | Existing QuestionId + revision identity; subject/topic and optional additional topic links, source/exercise provenance, language, stem/media, stable option IDs/presented ordering, one private key, explanation, editorial difficulty, template family, rights/review state |
| PassageRevision | Stable passage identity/revision, immutable text/media, English/language/genre/B2 metadata, source/publication date/rights/reviewer; can have several separately reviewed group revisions |
| QuestionGroupRevision | Subject, one required passage revision, ordered unique question-revision membership, atomic assembly flag; independent questions have no group/passage requirement |
| ContentRelease | Immutable reviewed manifest of revision IDs/payload integrity and publication state; active pointer controls future starts only |
| VersionEligibility | Release + exam version/section + question/group revision, reviewer/evidence/status; no implicit subject-wide validity |
| AttemptPassageSnapshot | Attempt + unique passage-revision reference and preserved payload/media; referenced by child snapshots once, privately retained for review |

Primary subject/topic provenance is preserved. Optional multi-topic instructional tags may supplement it, but current primary-topic mastery is not redistributed automatically. Difficulty remains a local uncalibrated educational label; all-math-medium does not establish statistical comparability. Template families identify semantically related variants for review/reuse; numeric ID distinctness alone does not prove independent skill evidence.

## Publication workflow and validation

Recommended workflow: author a draft revision → validate structure/provenance → scientific/language/rights review → mark per-version/section eligibility → publish immutable content release → explicitly activate available full-mock configuration. Proposed eligibility states are `unreviewed`, `eligible`, `ineligible`, `retired-for-new-starts` (T11-D06). No broad CMS redesign is required; extend existing admin/import review controls minimally.

For a new official-format eligible question require exactly five distinct usable options, exactly one key, valid referenced topic/subject, reviewed solution, English suitability, accessible media and rights. Reading must meet B2 comprehension/official source-selection guidance; exact passage count, word limits and questions per passage are not established official quotas. Reading genre/publication criteria are sourced in [T1.1](T1_1_EXAM_VERSION_SPEC.md). Do not create unsupported official guarantees from editorial labels.

Current importer validates39 sources/five subjects/four options, overwrites same-ID data, reactivates imported questions and retires omissions. A later release-aware extension must produce a dry-run diff and preserve current import records/namespace/filenames/keys, distinguish draft/reviewed/publication states, and never republish or retire old content merely by omission. New content/revision IDs are additive; no random fifth option and no current-package regeneration in Phase 1.

## Assembly and passage dependency contract

1. Resolve the exact version, syllabus and approved eligibility release before timing. Use eligible revisions only; never current mutable question text for a frozen attempt.
2. Treat a reviewed group as an atomic unit. If it contains five dependent questions, select all five with its required passage once and its declared order. Partial subsets require separately reviewed group definitions. Do not split groups to fill a quota.
3. Select unique question identities/revisions; do not repeat a question through two groups. Recommended initial policy also avoids repeating a passage/group in one attempt. Passage reuse across different attempts is an editorial policy requiring review, not a universal CISIA rule.
4. Exactly satisfy every section quota; ensure all selected group sizes can fit and all passage/media revisions resolve. No orphan child, missing sibling, cross-subject group, mismatched passage revision or broken media. Shortfall fails before any active attempt/deadline is issued.
5. Freeze full question/passage/group payloads or immutable retrievable revisions with integrity references. Store the passage once in an attempt-level passage collection; questions reference its snapshot ID. Never duplicate the passage text in every child question or require its live editable source at review time.
6. Return active-section passages and questions only; preserve declared order/option IDs. No key/explanation or usable later-section questions until terminal review. A passage shared by active children is rendered once in a persistent reading region.

Example assembly: two synthetic five-question groups satisfy the ten-question Reading quota. One group of six plus one of five does not; no on-the-fly truncation. A dependent question selected alone is invalid even if the subject/topic filter matches. In subject Practice, any newly supported dependent questions must bring their required context; existing Practice APIs/behavior remain unchanged until a separately authorized extension supports this payload.

## Practice, purchases and history

PracticeSession is an educational view/use of existing CentAttempt `kind=practice` with subject/topic filters, not a new unrelated session/auth entity. Current legacy contracts use four-option content and a global timer. New passage-capable Practice contracts must be explicitly versioned if later required; do not insert incompatible groups into the old flat response silently.

Purchased access resolves the stable subject plus benefit/coverage revision to existing published lessons/materials and eligible question-bank release. It is not a claim that a customer bought an official exam version or private CISIA questions. Content release changes within one purchased subject do not reset its clock; P1-C13 governs future coverage promises. Reading benefits and full Mock Exam admission remain pending commerce decisions.

The existing importer sets training subscription inclusion for created courses. A future Reading release must not inherit that default as an accidental commercial decision. P1-C09 is now APPROVED: the owner confirms zero users/customers/buyers and no grandfathering entitlements; no legacy Reading mechanism or cohort conversion is needed. Reading is independently purchasable, selectable in custom/recommended bundles, and receives its own 12-month item at **490,000 Toman = 4,900,000 integer IRR** initially, with approved n=1..6 tiers0/5/10/15/20/25% and no extra preset discount. Display is Toman at IRR/10; monetary snapshots/providers use IRR. Hold later sale/access activation until reviewed content and remaining benefits/term/quote policies are approved, not a superseded grandfathering decision. Preserve current code and development/test/financial records; do not toggle old training flags or grant Reading merely because it is a sixth curriculum row. Exact recommended subject sets remain pending.

Preserve document/page/source-section coordinates, published bytes and old links for notes/progress. New lesson revisions must retain old anchors/readers; existing `CentSection` is a document outline, never repurposed as ExamSection. No independent saved-question collection was established locally; preserve existing attempt QuestionId references and any later-discovered bookmarks without inventing records now.

No historical ResultJson/key/answer/mastery evidence is recalculated. The current computed mastery method filters active question IDs and uses all topics; new topics or retirements can alter a view without new answers. Require method/syllabus-scoped views and baseline validation before activation, retaining old interpretation. New Mock Exam evidence feed remains T11-D08. Rollback changes future activation pointers while retaining published revisions/snapshots and sold resource scope.
