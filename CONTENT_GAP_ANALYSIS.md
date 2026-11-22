# Content gap analysis

> **Latest delivery, 2026-11-22:** The Phase 3 continuation and Phase 4 student exam/Practice implementation are recorded in [the current delivery](#phase-3-continuation-and-phase-4-delivery--2026-11-22). The original candidate set now has 166 questions, 57 Persian supplements and five passages. Entire-corpus scientific/language/rights acceptance remains incomplete. Production migrations/import/activation remain unperformed. Older records below are historical.

> **Execution update, 2026-11-22:** The owner's Phase 2 + Phase 3 content instruction supersedes the earlier read-only scope for CEnT-only content architecture/production. An additive six-subject foundation package, safe importer, passage-aware Practice and offline exam integration are implemented. **Comprehensive academic/rights/optical acceptance of the retained legacy corpus is not complete; neither phase is represented as full academic or release acceptance.** Current delivery and exact limits are recorded in [the execution record](#phase-2--phase-3-execution-record--2026-11-22). The original audit below is historical and remains intact.

Audit: 2026-11-20. Scope is the **actual bundled local package**, not an assumed production database. `B` = `D:/Lerona/Backend/backend`. Authoritative local input is `B/Cent.Module/Content/curriculum.json`, embedded with `Content/Sources/**/*.html`. Existing `Content/Review` extraction and authoring code were inspected. No generation/import/content replacement occurred.

Package SHA256: `5f5c16c6ab02e019de2604160307ed1e1f9adc734fc94ec840947f36f3f287a9`.

## Complete package totals

| Subject | Sources/documents produced by importer | Chapters | Topics | Source sections | Extracted exercises | Bank questions |
| --- | --- | --- | --- | --- | --- | --- |
| Mathematics | 7 | 7 | 56 | 80 | 177 | 174 |
| Reasoning (`logic`) | 20 | 20 | 20 | 174 | 57 | 60 |
| Biology | 5 | 5 | 41 | 78 | 335 | 350 |
| Chemistry | 1 | 5 | 5 | 6 | 16 | 31 |
| Physics | 6 | 6 | 68 | 92 | 81 | 204 |
| Reading | 0 | 0 | 0 | 0 | 0 | 0 |
| Total | **39** | **43** | **190** | **430** | **666** | **819** |

Counts were recomputed by parsing the JSON, not copied from README. All 39 raw HTML SHA256 values match the manifest; no source is missing. Document counts describe importer output, not observed deployed documents. Extracted exercises include open responses/quarantined material and are not another 666 usable bank questions.

Separate legacy frontend inventory: `src/data/questions.ts` contains **18 active four-option samples** (9 math, 9 logic; 3 both-kind, 9 diagnostic-only, 6 simulator-only). Its diagnostic export selects 12 and simulator export takes at most eight. A TypeScript AST read counted these objects; no application import/execution was needed. Only `src/services/scoring.test.ts` imports this sample bank in the inspected source. These 18 are not added to the authoritative backend total, not evidence of published content, and not a fallback bank for learners.

## Coverage against the official index

Official IDs S01–S31 and compact subtopic index: [official reference](OFFICIAL_CISIA_REFERENCE.md). Coverage below is **structural evidence**, not a scientific validation or a quantitative percentage of official compliance. A topic with three templated items is not proven mastery coverage.

| Official IDs | Local source evidence | Audit conclusion / work required |
| --- | --- | --- |
| S01 | No Reading course, passage entity or bank | Missing all dedicated preparation/assessment coverage. Obtain licensed/original texts, skill tags, reviewed keys and passage-linked questions. |
| S02 | `math/mastercalss-riazi-fasl1-3.html` | Numbers/factors/percentages/powers/root headings present; verify depth and English question variety. |
| S03 | `math/chapter2.html`, masterclass, `math.algebraic-expressions` topic | Equations/inequalities/systems/expressions represented. Algebra source exercise is open-response; authored bank needs independent validation. |
| S04 | `math/geometry-chapter.html`, chapter2 coordinate sections | Plane/solid/similarity/line/circle headings present; overlap must be mapped, not counted twice. |
| S05–S06 | `math/فصل۳-توابع.html` | Function, graph, inverse, exponential/log headings present; no full item-level official mapping. |
| S07 | `math/chapter6-combinatorics-probability.html` | Counting/probability represented; conditional probability is supplementary until mapped to a stated requirement. |
| S08 | `math/chapter7-statistics.html` | Statistics represented; dispersion is supplementary; check scales/frequencies coverage in detail. |
| S09 | `logic/ch01`–`ch13`, `ch18-venn`, final review | Logic/quantifiers/inference represented; existing review corrections/quarantine retained. |
| S10 | `logic/ch14-barcharts`, `ch15-piecharts`, `ch16-linegraphs`, `ch17-evaluating`, `ch19-tables` | Data interpretation represented; validate mixed representation and inference breadth, not just chart reading. |
| S11 | `logic/ch18-venn`, `ch19-tables`; some math | Problem solving partially represented; tag multi-step language/modelling/validation tasks explicitly. |
| S12 | `biology/chapter1-chemical-foundation-fa.html` | Biomolecule/water headings present; chemistry prerequisites do not replace a Chemistry syllabus. |
| S13 | `biology/chapter2-cell-bioenergetics-fa.html` | Cells/organelles represented; energy/pathway detail requires priority review. |
| S14 | `biology/chapter3-genetics-fa.html` | Inheritance/cell cycle represented; PCR/CRISPR/advanced regulation are supplementary absent a specific mapping. |
| S15 | `biology/chapter4-plants-ecology-fa.html` | Plant/ecology represented; evolution/population/hormone material may exceed the required preparation depth. |
| S16 | `biology/chapter5-animal-physiology-fa.html` | Required systems have headings; immune/endocrine additions need priority classification. |
| S17 | Chemistry single source, chapters1–5 | Only macro-properties nucleus substantially represented by current structure; still draft/unvalidated. |
| S18–S26 | No dedicated Chemistry chapters/topics for these nine nuclei | Major structural gap. Incidental words/examples in current source or Biology/Physics do not establish adequate chemistry coverage. |
| S27 | `physics/chapter1-physical-quantities.html` | Units/vectors/models present; question and dimension/direction review pending. |
| S28 | `physics/chapter2-kinematics.html` | Motion/graphs/free fall/circular/relative headings present. |
| S29 | `physics/chapter3-dynamics-work-energy.html` | Force/work/energy represented; momentum/spring/friction detail requires priority mapping. |
| S30 | `physics/chapter4-pressure.html`, `chapter5-thermodynamics.html` | Fluids/gases/thermodynamics present, including explicit continuity/Bernoulli topic. |
| S31 | `physics/chapter6-electromagnetism-waves.html` | Electric/magnetic/wave headings present; scientific and question-depth review pending. |

## Bank compatibility, duplication and outdated assumptions

- **All 819 questions have four options**. This is incompatible with an official-format five-option mock unless new reviewed items/versions are produced. Existing four-option practice and snapshots must remain readable. Adding a random fifth distractor is not validation.
- Origins: math174 authored; logic53 source-MCQ +2 review-corrected +1 review-clarified +4 authored; biology335 source-MCQ +15 authored; chemistry16 source-MCQ +15 authored; physics81 source-MCQ +123 authored. Total authored331, source-MCQ485, corrected2, clarified1. Origin is traceability, not a quality certificate.
- All 174 mathematics bank items are labelled medium; difficulty calibration is not demonstrated. Many topics have only three generated variants; numeric differences do not necessarily supply independent skill evidence for the minimum-three mastery rule.
- Exact checks found **zero duplicate question keys, zero duplicate whitespace-normalized stems, zero duplicate normalized stem+ordered-option sets, and zero duplicate source byte hashes**. These checks do not detect translated, conceptual, paraphrased or option-reordered duplicates.
- Structural overlap exists: coordinate geometry appears in math chapter2 and geometry, function/equation material spans sources, biology chemistry foundations overlap Chemistry, and source/authored chemistry separation questions reuse the same skill. Preserve provenance; curate mapping rather than delete automatically.
- Four-option validation, five-course completeness checks and lack of exam/content versions are outdated for new official-format publication. There is no basis to claim all old content is obsolete: much can remain practice/supplementary material after review.
- No broken bank TopicKey mapping was found; every one of the 190 topics has at least one bank question. This does not imply that every official subtopic has a valid question or enough distinct evidence. Published DB status and manual questions outside the package remain unknown.

## Chemistry draft validation

Source: `chemistry/cent-chemistry-ch1-5-deep-1.html`; review extraction of the same basename. Its five chapters are particle model/states, physical versus chemical change, bulk properties, mixtures/separation and fundamental laws. This is **five local chapters of a draft**, not five official Chemistry sections or a complete chemistry course.

All 31 bank stems/options/keys/explanations were inspected. This audit does not claim a scientific sign-off. Specific reviewer tasks:

| Example stable key suffix | Evidence requiring review |
| --- | --- |
| `#exercise-001` | Temperature explanation equates temperature with average particle kinetic energy without qualifying the model; reviewer must validate scientific precision and level. |
| `#exercise-003` | Heating-curve plateau-width interpretation needs an explicit axis/heating-rate assumption; current stem does not provide a plot. |
| `#exercise-007` | Perfume-across-room example needs review of diffusion versus transport assumptions. |
| `#exercise-013`, `#exercise-016` | Explanation is largely final option/key rather than a complete instructional derivation; ensure stated assumptions and reasoning. |
| `authored:...#section-01:1` through `:3` | Heat questions vary mass; distractors are correct number ±1/±2 with no units inside options. Validate distractor plausibility and distinct skill evidence. |
| `authored:...#section-02:1` through `:3` | Repeated “example 1/2/3” phrasing and rotated choices; remove template artifacts only in a reviewed future revision. |

These are review flags, not declarations that particular keys are scientifically false. Independent chemistry review must check definitions, units, numerical results, conservation conditions, phase/mixing models, unambiguous single correct answers and five plausible choices. New nuclei S18–S26 require planned authoring, reviewed explanations and item-to-syllabus mapping before sale/coverage claims. Nothing was quarantined or republished during Phase 0.

## Existing review findings

The package has five findings: one quarantined logic item (`ch06-consistency#exercise-002`), one clarified conditional direction (`ch08-equivalents#exercise-003`), one explicit nonempty-domain assumption (`ch11-square#exercise-002`), one corrected chart key (`ch14-barcharts#exercise-002`) and the chapter13 canonical-title correction. Those are historical package decisions, not new Phase 0 edits. The quarantined exercise is excluded from the question bank.

## Release gates and limitations

Create a reviewed mapping from every official subtopic to content IDs, valid question IDs, language, difficulty, source/license, reviewer/date and publication state. Use “unmapped”, “supplementary”, “draft”, “validated” distinctly. For Reading, model a shared immutable passage and group selection so context is never separated from questions. For all subjects, measure template families as well as raw item counts before relying on “distinct questions” for mastery.

A complete scientific adjudication of all 819 keys, semantic duplicate review, licensing confirmation and production/manual-content inventory remain **requires further investigation**, not completed validation. The deterministic annex below inventories every source and topic in the actual local package so subsequent reviewers have a bounded queue.


## Annex A — every bundled source

Computed from the audited JSON and raw sources. Hashes below are the manifest values, independently matched to source bytes. Counts are local package counts.

| Course | Source path under Content/Sources | Chapters | Topics | Sections | Bank items | SHA256 |
| --- | --- | --- | --- | --- | --- | --- |
| biology | `biology/chapter1-chemical-foundation-fa.html` | 1 | 6 | 15 | 63 | `93e489b8640ecaed5fe3d81c4e128ac4d401e1a013e60b45f571ec1026c77eee` |
| biology | `biology/chapter2-cell-bioenergetics-fa.html` | 1 | 8 | 15 | 63 | `09958373a60356c2381d6d38fe36300bd65f33ad3b03a5a908adbdfe8163008f` |
| biology | `biology/chapter3-genetics-fa.html` | 1 | 9 | 16 | 73 | `bb4428146992dd4ee9ecde8af3654ca24de4f61ccc0e69ef5b61f13802bd0e24` |
| biology | `biology/chapter4-plants-ecology-fa.html` | 1 | 9 | 16 | 73 | `eaf5ca2875ec28cb1de170d3b40a745676ccf8e6b5dd97805d567ce67c1414e1` |
| biology | `biology/chapter5-animal-physiology-fa.html` | 1 | 9 | 16 | 78 | `7fe4018cd7501f83ed2770180a2d70bf5ff31a4a1b27325dbd0c036ac3f5aafd` |
| chemistry | `chemistry/cent-chemistry-ch1-5-deep-1.html` | 5 | 5 | 6 | 31 | `e754d153fd8ed2cfc81ed85e2c0123dd42b7af6957dd83478b14323984a1327e` |
| logic | `logic/20-final-review.html` | 1 | 1 | 3 | 3 | `18a3751be0f0510495b39b30e8ace5c842c94564fda17d955fd341f3d160ebbf` |
| logic | `logic/ch01-foundations-fa.html` | 1 | 1 | 9 | 3 | `19843c7d72aa04931963a9314b18480dea6f77c425d838e87d795f16266a943e` |
| logic | `logic/ch02-conjunction.html` | 1 | 1 | 9 | 3 | `f59baac1e9d537edf245f4a42ce05f38b72ed820dde92e26a850bd0e8a2c5bed` |
| logic | `logic/ch03-disjunction.html` | 1 | 1 | 9 | 3 | `093fdc5a8702df202ecee75d3bc09aa89df9213ba1ef66ed302a6c836c9aa46d` |
| logic | `logic/ch04-conditional.html` | 1 | 1 | 9 | 3 | `b5d0827967a3055ce5165795ef572eb4616b597d903cbe4c08e48c4a074363dd` |
| logic | `logic/ch05-negation.html` | 1 | 1 | 9 | 3 | `c0108d5311177f9a5548ac622c1835d446f30ef97c2a067c40a7eea69c4cc59f` |
| logic | `logic/ch06-consistency.html` | 1 | 1 | 9 | 3 | `6110e34551d3c2bbea120f9a1352238e06373c7de82b818fb2b2f22099e244d6` |
| logic | `logic/ch07-negating-compounds.html` | 1 | 1 | 9 | 3 | `5c65c0b29d5120e7e3d18f1e29b81ed18a3e1e1743c992411a6a22aa3a843cf1` |
| logic | `logic/ch08-equivalents.html` | 1 | 1 | 9 | 3 | `cd6a39621d6cda884134788392ff844ae15feccbea416685a40b286517974f07` |
| logic | `logic/ch09-necessary-sufficient.html` | 1 | 1 | 9 | 3 | `113526898469a26c412f0d10a9a8b6b5ea80d8deb022092a57bd4662ff64efff` |
| logic | `logic/ch10-categorical.html` | 1 | 1 | 9 | 3 | `788a04d7769d09fd6858686a50c3e3c68ab917e96e4c1077cfa0772d2dd2dd73` |
| logic | `logic/ch11-square.html` | 1 | 1 | 9 | 3 | `dbfd917cf3072fcef2fdae877510b5ce675ee1c6c5a353bdcca387251dfe17ca` |
| logic | `logic/ch12-syllogism.html` | 1 | 1 | 9 | 3 | `3a32d3529803c8a684874cf00a9d7c36baccaa1f9da4ad3eeb487f2ac92ae1ee` |
| logic | `logic/ch13-quantifiers.html` | 1 | 1 | 9 | 3 | `dac4e1b7a6623a935789473efb4ebdf8de4f60bf0ace4b46bac11b82a52d8175` |
| logic | `logic/ch14-barcharts.html` | 1 | 1 | 9 | 3 | `ace929d24b29d83677db6d4ca9ff29e461814b86909271c60af02cff31261017` |
| logic | `logic/ch15-piecharts.html` | 1 | 1 | 9 | 3 | `0afaf11f0af5aede89e4c6df4d1cde04402af087ff6d4522ddea15e5596f53a0` |
| logic | `logic/ch16-linegraphs.html` | 1 | 1 | 9 | 3 | `615dd9250cc330f4c7d04affbbff1e44a5b9d47938d10472f6a710084f68f47b` |
| logic | `logic/ch17-evaluating.html` | 1 | 1 | 9 | 3 | `0a3a8b14884124d6cd3e9b8aaedc11e784003e45438d93e54ddf7f440f83d255` |
| logic | `logic/ch18-venn.html` | 1 | 1 | 9 | 3 | `b01a46b1d326c7b8cf0bcdd481e3f0b7c8ae2b42c6c3f36f863171a96049b000` |
| logic | `logic/ch19-tables.html` | 1 | 1 | 9 | 3 | `13b3c38e6e022c691df745c2347965e2a92a90f23c1297f2e4ac1910f359bfe3` |
| math | `math/chapter2.html` | 1 | 12 | 15 | 36 | `7d29226957fb79e37d3e8f3f95b498d5dd3341fbe924e23fda4f66e5d64c2bb4` |
| math | `math/chapter6-combinatorics-probability.html` | 1 | 6 | 11 | 18 | `90945348f043b8b748672605d766e162e7491c84aea8ce6f10b17004429a8146` |
| math | `math/chapter7-statistics.html` | 1 | 5 | 8 | 15 | `0da4eb5758b297eb6d5ee00c5267def9638661f615fb952370976bbaa56f0244` |
| math | `math/geometry-chapter.html` | 1 | 5 | 8 | 15 | `4b0d843cc6101b3e4fe529968886005c5ea02f11593984f9b7990bdc3f9496b4` |
| math | `math/mastercalss-riazi-fasl1-3.html` | 1 | 11 | 14 | 39 | `f0e83d9eabf9205af6b923f0f57739d28f45b63436b5a2601659807a9087a7bc` |
| math | `math/trig_chapter.html` | 1 | 7 | 10 | 21 | `6f1da7b38010545428041b75b20ca513bd3768c0d3b4050ae5e07b4a75af233b` |
| math | `math/فصل۳-توابع.html` | 1 | 10 | 14 | 30 | `7cd3cf01b2be9e137254ae26d325cac67b81d6b0b5d0f8cb495dba01bfaa84a9` |
| physics | `physics/chapter1-physical-quantities.html` | 1 | 9 | 13 | 29 | `40f4e960fe18c035e86104ae59aaa87215106323d05cff649c6b841d2798f585` |
| physics | `physics/chapter2-kinematics.html` | 1 | 13 | 17 | 38 | `1065b749990e4b119e16c22e316bc7742a988dbaebdd4495f34d5e3f4f4c0775` |
| physics | `physics/chapter3-dynamics-work-energy.html` | 1 | 14 | 18 | 41 | `39fda7c81c250591196781cbcf776a727228c1bd7c900c1d5e280c3b14feedaa` |
| physics | `physics/chapter4-pressure.html` | 1 | 14 | 18 | 42 | `8924057d2126dce162fa7e535f3d06744d9a713c76cc1256a1cdd7f794d62c44` |
| physics | `physics/chapter5-thermodynamics.html` | 1 | 10 | 14 | 30 | `92471bb682b36d20cb995286fb396627a177e96cf4cd48346145718f1162d108` |
| physics | `physics/chapter6-electromagnetism-waves.html` | 1 | 8 | 12 | 24 | `3959fbef21f378d7ac288d0d62c7fb52369cdf5ad0e9695aa337ed5c1812cbda` |

## Annex B — every topic and bank count

Each row is an existing stable import key, not a new official topic identifier. EnglishTitle is frequently empty or parser-derived; it is not a verified English syllabus mapping.

### math

| Topic import key | Existing title | Bank items |
| --- | --- | --- |
| `math/chapter2.html#section-02` | معادلات درجهٔ یک (Linear Equations) | 3 |
| `math/chapter2.html#section-03` | نامعادلات درجهٔ یک (Linear Inequalities) | 3 |
| `math/chapter2.html#section-04` | معادلات درجهٔ دو (Quadratic Equations) | 3 |
| `math/chapter2.html#section-05` | آشنایی با تعیین علامت (Sign Analysis) | 3 |
| `math/chapter2.html#section-06` | نامعادلات درجهٔ دو (Quadratic Inequalities) | 3 |
| `math/chapter2.html#section-07` | دستگاه معادلات دو مجهولی (System of Equations) | 3 |
| `math/chapter2.html#section-08` | دستگاه مختصات (Coordinate System) و معادلهٔ خط (Equation of a Line) | 3 |
| `math/chapter2.html#section-09` | وضعیت دو خط نسبت به هم (Position of Two Lines) | 3 |
| `math/chapter2.html#section-10` | فاصلهٔ دو نقطه (Distance Between Two Points) و میانهٔ پاره‌خط (Midpoint) | 3 |
| `math/chapter2.html#section-11` | فاصلهٔ نقطه از خط (Distance from a Point to a Line) و دو خط موازی (Parallel Lines) | 3 |
| `math/chapter2.html#section-12` | مرکز ثقل مثلث (Centroid of a Triangle) و متوازی‌الاضلاع (Parallelogram) | 3 |
| `math/chapter2.html#section-13` | معادلهٔ دایره (Equation of a Circle) | 3 |
| `math/chapter6-combinatorics-probability.html#section-02` | اصل ضرب و اصل متمم | 3 |
| `math/chapter6-combinatorics-probability.html#section-03` | جایگشت (Permutations) | 3 |
| `math/chapter6-combinatorics-probability.html#section-04` | ترکیب (Combinations) | 3 |
| `math/chapter6-combinatorics-probability.html#section-05` | فضای نمونه، پیشامد و احتمال پایه | 3 |
| `math/chapter6-combinatorics-probability.html#section-06` | قوانین احتمال | 3 |
| `math/chapter6-combinatorics-probability.html#section-07` | احتمال شرطی | 3 |
| `math/chapter7-statistics.html#section-02` | جامعه و نمونه، انواع متغیرها | 3 |
| `math/chapter7-statistics.html#section-03` | جدول‌های فراوانی | 3 |
| `math/chapter7-statistics.html#section-04` | نمودارها | 3 |
| `math/chapter7-statistics.html#section-05` | شاخص‌های مرکزی: میانگین، میانه و مد | 3 |
| `math/chapter7-statistics.html#section-06` | شاخص‌های پراکندگی | 3 |
| `math/geometry-chapter.html#section-02` | مفاهیم پایهٔ هندسه | 3 |
| `math/geometry-chapter.html#section-03` | مثلث و چندضلعی‌ها | 3 |
| `math/geometry-chapter.html#section-04` | دایره | 3 |
| `math/geometry-chapter.html#section-05` | اشکال فضایی | 3 |
| `math/geometry-chapter.html#section-06` | تشابه اشکال و مختصات دکارتی | 3 |
| `math/mastercalss-riazi-fasl1-3.html#section-02` | معماری اعداد: مجموعه‌های تو در تو | 3 |
| `math/mastercalss-riazi-fasl1-3.html#section-03` | اعداد اعشاری و نمایش علمی (Scientific Notation) | 3 |
| `math/mastercalss-riazi-fasl1-3.html#section-04` | مقایسه اعداد، تخمین و تلهٔ اعداد منفی | 3 |
| `math/mastercalss-riazi-fasl1-3.html#section-05` | عوامل، مضرب‌ها، اعداد اول و تجزیه | 3 |
| `math/mastercalss-riazi-fasl1-3.html#section-06` | بخش‌پذیری اعداد (Divisibility Rules) | 3 |
| `math/mastercalss-riazi-fasl1-3.html#section-07` | درصدها: زبان تغییرات | 3 |
| `math/mastercalss-riazi-fasl1-3.html#section-08` | قوانین پایهٔ توان‌ها (۷ قانون طلایی) | 3 |
| `math/mastercalss-riazi-fasl1-3.html#section-09` | ریشه‌ها و رادیکال‌ها: ضرب، تقسیم و ساده‌سازی | 3 |
| `math/mastercalss-riazi-fasl1-3.html#section-10` | ترتیب عملیات (BODMAS/PEMDAS) | 3 |
| `math.algebraic-expressions` | عبارت‌های جبری | 9 |
| `math/mastercalss-riazi-fasl1-3.html#section-12` | اتحادهای جبری و فاکتورگیری | 3 |
| `math/trig_chapter.html#section-02` | رادیان، درجه، طول کمان و مساحت مطاع | 3 |
| `math/trig_chapter.html#section-03` | نسبت‌های مثلثاتی در مثلث قائم‌الزاویه | 3 |
| `math/trig_chapter.html#section-04` | دایرهٔ مثلثاتی، علامت نسبت‌ها و زوایای ویژه | 3 |
| `math/trig_chapter.html#section-05` | فرمول‌های تبدیل زاویه (زوایای وتری) | 3 |
| `math/trig_chapter.html#section-06` | فرمول‌های مجموع، تفاضل و زاویهٔ دوبرابر | 3 |
| `math/trig_chapter.html#section-07` | معادلات مثلثاتی | 3 |
| `math/trig_chapter.html#section-08` | توابع مثلثاتی: نمودار، دامنه و برد | 3 |
| `math/فصل۳-توابع.html#section-02` | مفهوم تابع، دامنه، برد و ویژگی‌های پایه | 3 |
| `math/فصل۳-توابع.html#section-03` | توابع پایه و آناتومی نماد لگاریتم | 3 |
| `math/فصل۳-توابع.html#section-04` | معادلهٔ درجه دوم و نمودار سهمی | 3 |
| `math/فصل۳-توابع.html#section-05` | قدرمطلق — معادله و نامعادله کامل | 3 |
| `math/فصل۳-توابع.html#section-06` | معادلات گویا و گنگ | 3 |
| `math/فصل۳-توابع.html#section-07` | تابع نمایی (Exponential) | 3 |
| `math/فصل۳-توابع.html#section-08` | تابع لگاریتمی (کامل) | 3 |
| `math/فصل۳-توابع.html#section-09` | تبدیلات نمودار توابع | 3 |
| `math/فصل۳-توابع.html#section-10` | ترکیب توابع و تابع وارون | 3 |
| `math/فصل۳-توابع.html#section-11` | حل معادله و نامعادله با نمودار — تعیین علامت کامل | 3 |

### logic

| Topic import key | Existing title | Bank items |
| --- | --- | --- |
| `logic/20-final-review.html#topic` | 🧠 Logic Cheat Sheet — چکیده‌ی فشرده‌ی کل جزوه | 3 |
| `logic/ch01-foundations-fa.html#topic` | فصل ۱: مبانی — گزاره چیست؟ گزاره‌های ترکیبی چه هستند؟ | 3 |
| `logic/ch02-conjunction.html#topic` | فصل ۲: عطف — «A and B» (Conjunction) | 3 |
| `logic/ch03-disjunction.html#topic` | فصل ۳: فصل — «A or B» (Disjunction) | 3 |
| `logic/ch04-conditional.html#topic` | فصل ۴: شرطی — «If A then B» (Conditional) | 3 |
| `logic/ch05-negation.html#topic` | فصل ۵: نقیض و تضاد — «not-A» (Negation, Contradictories & Contraries) | 3 |
| `logic/ch06-consistency.html#topic` | فصل ۶: سازگاری و ناسازگاری — Consistency vs Inconsistency | 3 |
| `logic/ch07-negating-compounds.html#topic` | فصل ۷: نقیض گزاره‌های ترکیبی (De Morgan's Rules) | 4 |
| `logic/ch08-equivalents.html#topic` | فصل ۸: معادل‌های شرطی — Equivalent Forms of "If A then B" | 3 |
| `logic/ch09-necessary-sufficient.html#topic` | فصل ۹: شرط لازم و کافی — Necessary and Sufficient Conditions | 3 |
| `logic/ch10-categorical.html#topic` | فصل ۱۰: گزاره‌های قیاسی — Categorical Claims (All / Some / No / Only A are B) | 3 |
| `logic/ch11-square.html#topic` | فصل ۱۱: مربع تعارض — Square of Opposition | 3 |
| `logic/ch12-syllogism.html#topic` | فصل ۱۲: قیاس فرضی و Modus Ponens — استنتاج معتبر و نامعتبر | 3 |
| `logic/ch13-quantifiers.html#topic` | فصل ۱۳: نقیض گزاره‌های کمّی — Negating Universal & Existential Statements | 2 |
| `logic/ch14-barcharts.html#topic` | فصل ۱۴: خواندن نمودارهای میله‌ای — Reading Bar Charts | 3 |
| `logic/ch15-piecharts.html#topic` | فصل ۱۵: خواندن نمودارهای دایره‌ای — Reading Pie Charts | 3 |
| `logic/ch16-linegraphs.html#topic` | فصل ۱۶: نمودارهای خطی و تحلیل روند — Line Graphs & Trend Analysis | 3 |
| `logic/ch17-evaluating.html#topic` | فصل ۱۷: نتیجه‌گیری و ارزیابیِ ادعاها — Drawing Conclusions & Evaluating Claims | 3 |
| `logic/ch18-venn.html#topic` | فصل ۱۸: حل مسئله با نمودار ون — Venn Diagram Word Problems | 3 |
| `logic/ch19-tables.html#topic` | فصل ۱۹: حل مسئله با جدول و معادلات همزمان — Tables & Simultaneous Equations | 3 |

### biology

| Topic import key | Existing title | Bank items |
| --- | --- | --- |
| `biology/chapter1-chemical-foundation-fa.html#section-05` | ۱ماده و انرژی: اتم، ایزوتوپ، الکترون ظرفیت و پیوندها | 9 |
| `biology/chapter1-chemical-foundation-fa.html#section-06` | ۲آب و pH: ماتریس زندگی | 11 |
| `biology/chapter1-chemical-foundation-fa.html#section-07` | ۳سینتیک آنزیم‌ها: کاتالیزورهای زندگی | 7 |
| `biology/chapter1-chemical-foundation-fa.html#section-08` | ۴جزئیات درشت‌مولکول‌ها: پروتئین، اسید نوکلئیک، لیپید و بیشتر | 12 |
| `biology/chapter1-chemical-foundation-fa.html#section-09` | ۵آب‌دوستی و آب‌گریزی، کربوهیدرات‌ها و لیپیدها | 11 |
| `biology/chapter1-chemical-foundation-fa.html#section-10` | ۶پروتئین‌ها و اسیدهای نوکلئیک در عمق | 13 |
| `biology/chapter2-cell-bioenergetics-fa.html#section-03` | ۱انواع سلول: پروکاریوت، یوکاریوت، گیاهی و جانوری | 6 |
| `biology/chapter2-cell-bioenergetics-fa.html#section-04` | ۲غشای سلولی و انتقال مواد | 10 |
| `biology/chapter2-cell-bioenergetics-fa.html#section-05` | ۳هسته، ریبوزوم، سامانهٔ اندوممبران و اسکلت سلولی | 7 |
| `biology/chapter2-cell-bioenergetics-fa.html#section-06` | ۴میتوکندری، کلروپلاست، واکوئل و دیوارهٔ سلولی | 5 |
| `biology/chapter2-cell-bioenergetics-fa.html#section-07` | ۵انرژی‌شناسی زیستی: متابولیسم و ATP | 6 |
| `biology/chapter2-cell-bioenergetics-fa.html#section-08` | ۶تنفس سلولی: از گلوکز به ATP | 11 |
| `biology/chapter2-cell-bioenergetics-fa.html#section-09` | ۷فتوسنتز: مبدل انرژی خورشید | 11 |
| `biology/chapter2-cell-bioenergetics-fa.html#section-10` | ۸ارتباط سلولی و آپوپتوز | 7 |
| `biology/chapter3-genetics-fa.html#section-03` | ۱ژنوم و سازمان کروموزوم‌ها | 5 |
| `biology/chapter3-genetics-fa.html#section-04` | ۲همانندسازی DNA | 8 |
| `biology/chapter3-genetics-fa.html#section-05` | ۳رونویسی و پردازش RNA | 6 |
| `biology/chapter3-genetics-fa.html#section-06` | ۴ترجمه، کد ژنتیکی و جهش‌ها | 9 |
| `biology/chapter3-genetics-fa.html#section-07` | ۵تنظیم بیان ژن | 7 |
| `biology/chapter3-genetics-fa.html#section-08` | ۶زیست‌فناوری: PCR، ژل و CRISPR | 9 |
| `biology/chapter3-genetics-fa.html#section-09` | ۷چرخهٔ سلولی و میتوز | 8 |
| `biology/chapter3-genetics-fa.html#section-10` | ۸میوز و تنوع ژنتیکی | 9 |
| `biology/chapter3-genetics-fa.html#section-11` | ۹وراثت مندلی | 12 |
| `biology/chapter4-plants-ecology-fa.html#section-03` | ۱اندام‌ها و بافت‌های گیاه: ریشه، ساقه، برگ | 8 |
| `biology/chapter4-plants-ecology-fa.html#section-04` | ۲گل، میوه و دانه | 7 |
| `biology/chapter4-plants-ecology-fa.html#section-05` | ۳انتقال در گیاه: آب، قند و مواد معدنی | 7 |
| `biology/chapter4-plants-ecology-fa.html#section-06` | ۴هورمون‌ها و پاسخ‌های گیاهی | 7 |
| `biology/chapter4-plants-ecology-fa.html#section-07` | ۵اکوسیستم، زنجیرهٔ غذایی و جریان انرژی | 9 |
| `biology/chapter4-plants-ecology-fa.html#section-08` | ۶چرخهٔ مواد: کربن و نیتروژن | 7 |
| `biology/chapter4-plants-ecology-fa.html#section-09` | ۷بوم‌شناسی جمعیت | 9 |
| `biology/chapter4-plants-ecology-fa.html#section-10` | ۸برهم‌کنش‌های زیستی | 9 |
| `biology/chapter4-plants-ecology-fa.html#section-11` | ۹تکامل: سازوکارها و شواهد | 10 |
| `biology/chapter5-animal-physiology-fa.html#section-03` | ۱بافت‌ها و هومئوستاز | 6 |
| `biology/chapter5-animal-physiology-fa.html#section-04` | ۲دستگاه اسکلتی–ماهیچه‌ای و انقباض | 10 |
| `biology/chapter5-animal-physiology-fa.html#section-05` | ۳دستگاه عصبی: پتانسیل عمل و سیناپس | 10 |
| `biology/chapter5-animal-physiology-fa.html#section-06` | ۴دستگاه درون‌ریز و تنظیم قند خون | 12 |
| `biology/chapter5-animal-physiology-fa.html#section-07` | ۵دستگاه گردش خون | 9 |
| `biology/chapter5-animal-physiology-fa.html#section-08` | ۶دستگاه تنفس و تبادل گاز | 8 |
| `biology/chapter5-animal-physiology-fa.html#section-09` | ۷دستگاه گوارش | 8 |
| `biology/chapter5-animal-physiology-fa.html#section-10` | ۸دستگاه دفع و تنظیم آب | 8 |
| `biology/chapter5-animal-physiology-fa.html#section-11` | ۹دستگاه ایمنی | 7 |

### chemistry

| Topic import key | Existing title | Bank items |
| --- | --- | --- |
| `chemistry/cent-chemistry-ch1-5-deep-1.html#section-01` | مدل ذره‌ای ماده، حالت‌های ماده و تغییرات فیزیکی | 6 |
| `chemistry/cent-chemistry-ch1-5-deep-1.html#section-02` | تبدیلات شیمیایی: تغییر فیزیکی در برابر شیمیایی | 6 |
| `chemistry/cent-chemistry-ch1-5-deep-1.html#section-03` | خواص ماکروسکوپیک گازها، مایعات و جامدات | 6 |
| `chemistry/cent-chemistry-ch1-5-deep-1.html#section-04` | مخلوط‌های همگن و ناهمگن؛ روش‌های جداسازی | 6 |
| `chemistry/cent-chemistry-ch1-5-deep-1.html#section-05` | قوانین بنیادی شیمی | 7 |

### physics

| Topic import key | Existing title | Bank items |
| --- | --- | --- |
| `physics/chapter1-physical-quantities.html#section-01` | 1کمیت فیزیکی چیست؟ (Physical Quantity) | 3 |
| `physics/chapter1-physical-quantities.html#section-02` | 2یکاهای پایه و مشتق SI (SI Units) | 3 |
| `physics/chapter1-physical-quantities.html#section-03` | 3همگنی معادلات فیزیکی (Homogeneity) | 3 |
| `physics/chapter1-physical-quantities.html#section-04` | 4کمیت‌های نرده‌ای و برداری (Scalars & Vectors) | 3 |
| `physics/chapter1-physical-quantities.html#section-05` | 5توان‌های ده، نماد علمی و مرتبهٔ بزرگی (Powers of Ten) | 3 |
| `physics/chapter1-physical-quantities.html#section-06` | 6نمودارها و مدل‌های تابعی (Graphs & Functional Models) | 3 |
| `physics/chapter1-physical-quantities.html#section-07` | 7عملیات برداری (Vector Operations) | 3 |
| `physics/chapter1-physical-quantities.html#section-08` | 8ابزارهای اندازه‌گیری و رزولوشن (Measuring Instruments) | 3 |
| `physics/chapter1-physical-quantities.html#section-09` | 9خطاهای تصادفی و سیستماتیک (Random & Systematic Errors) | 3 |
| `physics/chapter2-kinematics.html#section-01` | 1مکان، جابه‌جایی و مسافت (Position, Displacement & Distance) | 3 |
| `physics/chapter2-kinematics.html#section-02` | 2سرعت متوسط و تندی متوسط (Average Velocity & Speed) | 3 |
| `physics/chapter2-kinematics.html#section-03` | 3حرکت یکنواخت روی خط راست (Uniform Motion) | 3 |
| `physics/chapter2-kinematics.html#section-04` | 4علامت مکان و علامت سرعت (Sign Convention) | 3 |
| `physics/chapter2-kinematics.html#section-05` | 5تعداد تغییر جهت حرکت (Direction Changes) | 3 |
| `physics/chapter2-kinematics.html#section-06` | 6شتاب و انواع حرکت (Acceleration) | 3 |
| `physics/chapter2-kinematics.html#section-07` | 7نمودار مکان–زمان (Position–Time Graph) | 3 |
| `physics/chapter2-kinematics.html#section-08` | 8نمودار سرعت–زمان (Velocity–Time Graph) | 3 |
| `physics/chapter2-kinematics.html#section-09` | 9نمودار شتاب–زمان (Acceleration–Time Graph) | 3 |
| `physics/chapter2-kinematics.html#section-10` | 10معادلات حرکت با شتاب ثابت (Constant-Acceleration Equations) | 3 |
| `physics/chapter2-kinematics.html#section-11` | 11سقوط آزاد (Free Fall) | 3 |
| `physics/chapter2-kinematics.html#section-12` | 12حرکت دایره‌ای یکنواخت (Uniform Circular Motion) | 3 |
| `physics/chapter2-kinematics.html#section-13` | 13حرکت نسبی و تبدیل گالیله (Relative Motion & Galilean Transformation) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-01` | 1کار (Work) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-02` | 2کار نیروی وزن و اصطکاک (Work of Weight & Friction) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-03` | 3کار کل و قضیهٔ کار–انرژی جنبشی (Work–Energy Theorem) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-04` | 4توان (Power) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-05` | 5انرژی جنبشی و پتانسیل گرانشی (Kinetic & Gravitational Potential Energy) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-06` | 6پایستگی انرژی مکانیکی (Conservation of Mechanical Energy) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-07` | 7بازده (Efficiency) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-08` | 8قوانین سه‌گانهٔ نیوتن (Newton's Laws) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-09` | 9نیروی اصطکاک (Friction) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-10` | 10نیروی سطح و نیروی فنر (Normal Force & Spring Force) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-11` | 11نیروی کشش نخ (Tension) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-12` | 12تکانه و ضربه (Momentum & Impulse) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-13` | 13نیروی گرانشی و شتاب گرانشی (Gravitation) | 3 |
| `physics/chapter3-dynamics-work-energy.html#section-14` | 14نیروی مرکزگرا (Centripetal Force) | 3 |
| `physics/chapter4-pressure.html#section-01` | 1حالت‌های ماده (States of Matter) | 3 |
| `physics/chapter4-pressure.html#section-02` | 2فشار چیست؟ (Pressure) | 3 |
| `physics/chapter4-pressure.html#section-03` | 3چگالی (Density) | 3 |
| `physics/chapter4-pressure.html#section-04` | 4فشار ناشی از وزن اجسام جامد (Pressure from Solid Weight) | 3 |
| `physics/chapter4-pressure.html#section-05` | 5فشار مایع (Fluid Pressure) | 3 |
| `physics/chapter4-pressure.html#section-06` | 6سانتی‌متر جیوه: یکای خاص فشار (cmHg) | 3 |
| `physics/chapter4-pressure.html#section-07` | 7نیروی وارد از مایع به کف ظرف (Force on Container Base) | 3 |
| `physics/chapter4-pressure.html#section-08` | 8اصل پاسکال (Pascal's Principle) | 3 |
| `physics/chapter4-pressure.html#section-09` | 9فشار جو زمین با ارتفاع (Atmospheric Pressure vs. Altitude) | 3 |
| `physics/chapter4-pressure.html#section-10` | 10مانومتر: فشارسنج گازها (Manometer) | 3 |
| `physics/chapter4-pressure.html#section-11` | 11بارومتر: فشارسنج هوا (Barometer) | 3 |
| `physics/chapter4-pressure.html#section-12` | 12فشار پیمانه‌ای (Gauge Pressure) | 3 |
| `physics/chapter4-pressure.html#section-13` | 13نیروی شناوری (Buoyancy) | 3 |
| `physics/chapter4-pressure.html#section-14` | 14آهنگ شارش حجمی، پیوستگی و برنولی (Continuity & Bernoulli) | 3 |
| `physics/chapter5-thermodynamics.html#section-01` | 1متغیرهای حالت و معادلهٔ گاز کامل (State Variables & Ideal Gas Law) | 3 |
| `physics/chapter5-thermodynamics.html#section-02` | 2قانون اول ترمودینامیک: گرما، کار و انرژی درونی (First Law) | 3 |
| `physics/chapter5-thermodynamics.html#section-03` | 3فرایند هم‌حجم (Isochoric Process) | 3 |
| `physics/chapter5-thermodynamics.html#section-04` | 4فرایند هم‌دما (Isothermal Process) | 3 |
| `physics/chapter5-thermodynamics.html#section-05` | 5فرایند هم‌فشار (Isobaric Process) | 3 |
| `physics/chapter5-thermodynamics.html#section-06` | 6فرایند بی‌دررو (آدیاباتیک) (Adiabatic Process) | 3 |
| `physics/chapter5-thermodynamics.html#section-07` | 7مقایسهٔ فرایندهای ترمودینامیکی خاص (Comparing the Four Processes) | 3 |
| `physics/chapter5-thermodynamics.html#section-08` | 8ماشین‌های گرمایی: توان و بازده (Heat Engines) | 3 |
| `physics/chapter5-thermodynamics.html#section-09` | 9یخچال‌ها (Refrigerators) | 3 |
| `physics/chapter5-thermodynamics.html#section-10` | 10گرما، گرمای ویژه و تغییر فاز (Heat, Specific Heat & Phase Change) | 3 |
| `physics/chapter6-electromagnetism-waves.html#section-01` | 1بار الکتریکی، رسانا و عایق (Charge, Conductors & Insulators) | 3 |
| `physics/chapter6-electromagnetism-waves.html#section-02` | 2قانون کولن (Coulomb's Law) | 3 |
| `physics/chapter6-electromagnetism-waves.html#section-03` | 3میدان الکتریکی (Electric Field) | 3 |
| `physics/chapter6-electromagnetism-waves.html#section-04` | 4جریان الکتریکی (Electric Current) | 3 |
| `physics/chapter6-electromagnetism-waves.html#section-05` | 5مقاومت و قانون اهم (Resistance & Ohm's Law) | 3 |
| `physics/chapter6-electromagnetism-waves.html#section-06` | 6آهنرباها و میدان مغناطیسی (Magnets & Magnetic Field) | 3 |
| `physics/chapter6-electromagnetism-waves.html#section-07` | 7امواج: نور و صدا (Waves: Light & Sound) | 3 |
| `physics/chapter6-electromagnetism-waves.html#section-08` | 8طیف الکترومغناطیسی (Electromagnetic Spectrum) | 3 |

## Phase 2 + Phase 3 execution record — 2026-11-22

### Actual implementation and source authority

Resumed the interrupted content task after the completed exam infrastructure slice.
Rechecked the current [official syllabus](https://www.cisiaonline.it/en/cent/cent-s/structure-and-syllabus)
and [CISIA rules §1.2.1 and October amendment](https://www.cisiaonline.it/en/cent/all-about-CEnT/CEnT-rules)
on 2026-11-22. Five answer options/one correct answer are confirmed; no arbitrary
fifth distractor was added to the existing bank. The current blueprint remains
65 questions/140 minutes. S01–S31 are local audit keys and the competency phrases
are editorial mappings, not official identifiers or a quantitative compliance certificate.

The existing Corpus/importer/CentQuestion/CentAttempt architecture is extended.
`CentCurriculumRevision` stores immutable syllabus/topic/resource/review/passages/group
relationships over existing IDs; `CentPracticeContent` retains once-per-attempt
passage snapshots. Optional parent-topic mappings validate subject and cycle constraints.
Only new IDs are added. Repeated imports preserve source bytes, question payloads,
document publication/ordering, note anchors and historical results; same-ID conflicts
fail atomically instead of overwriting or retiring existing material. Original
four-option packages remain valid. A case-sensitive scientific-notation correction
keeps `AA` and `Aa` distinct in question/option duplicate checks.

The public curriculum exposes installed syllabus identity and topic content capability,
without question text/keys. New `passage-v1` Practice requests select released reviewed
content atomically and snapshot passages once. Active questions omit keys/explanations.
Retry uses issued snapshots; missing passage context is withheld in the frontend.
Old topic links keep flat Practice/diagnostic behavior; new topic links use existing
Practice routes. No route/layout/style/brand redesign was introduced. Scoped mastery
uses the selected foundation syllabus; callers without a syllabus retain their old
topic denominator. New Mock Exams remain excluded from mastery. Reading receives
a stable subject/training identity without automatic subscription inclusion or sale grants.

### Actual artifact counts and six-subject coverage

Counts below are recomputed from local artifacts, **not database observations**.
The earlier export's 48 database lessons and nine image-based lessons were not
queried again. Source sections must not be equated with those lesson counts.

| Artifact | Original package | Merged import-ready package |
| --- | ---: | ---: |
| Subjects | 5 | 6 |
| Source HTML documents | 39 | 45 |
| Topics | 190 | 228 |
| Source sections | 430 | 468 |
| New Persian lesson supplements | 0 | 38 |
| Extracted/authored exercises | 666 | 780 |
| Bank questions | 819 | 933 |
| Shared English passages | 0 | 3 |

The 114 new exercises and 114 new bank entries refer to the same 114 authored
items, not 228 independent questions. The original JSON SHA256 remains
`5f5c16c6ab02e019de2604160307ed1e1f9adc734fc94ec840947f36f3f287a9`.
All 39 original HTML files remain unchanged and all 45 source hashes validate.

| Subject | Syllabus areas | New Persian lessons | New agent-reviewed English candidates | Current quota |
| --- | --- | ---: | ---: | ---: |
| Reading and Comprehension | S01; eight instructional skills mapped to this one official area | 8 | 23 | 10 |
| Mathematics | S02–S08 | 7 | 21 | 15 |
| Reasoning on Texts and Data | S09–S11 | 3 | 15 | 15 |
| Biology | S12–S16 | 5 | 15 | 10 |
| Chemistry | S17–S26 | 10 | 30 | 10 |
| Physics | S27–S31 | 5 | 10 | 5 |
| Total | 31 local mapped areas | 38 | 114 | 65 |

Reading includes Persian instruction for main idea, details/reference, inference,
context vocabulary, purpose/tone, cohesion/structure, evidence and genres. Three
original English texts cover non-fiction, literary and journalistic-style reading,
each with one atomic five-question group; eight self-contained short-text items
support individual skills. Passage text lives once in the release and is referenced
by child questions. B2 and difficulty are editorial targets, not calibrated levels.

Chemistry now has original teaching, worked examples, common errors and English
assessments for all ten broad areas, including the nine missing dedicated areas.
This addresses the structural gap; it does not retrospectively certify the old draft
source or establish exhaustive depth/independent academic approval.

Six standalone printable HTML booklets are generated from the same revision in
`Backend/backend/Cent.Module/Content/Materials/cent-content-2026-r1/`. They retain
Persian teaching and English assessment/solutions. No original PDF, illustration,
formula/image source or reader coordinate was replaced. PDF conversion and rendered
print/diagram acceptance were not performed. Booklets and review manifests are local
artifacts, not unprotected public website downloads.

### Question quality and remaining acceptance limits

All **1,485** retained exercises/questions have individual structural/language audit
rows in `Content/Review/cent-content-2026-r1/legacy-item-audit.json`. These are not
falsely labelled full scientific review. Findings include 1,152 records with Persian
in assessment content/solutions, 177 extracted exercises without an MCQ key (including
open-response material), the previously quarantined item, and four-option format
throughout the original bank. An audit flag does not make a valid old Practice item
invalid. No source answer was invented for an unresolved extracted exercise.

Every original topic has a versioned structural alignment/classification; advanced
or unmatched material remains explicitly supplementary/out of scope or requires
source verification. Valid source bytes/IDs are retained. Every old bank item stays
outside new Mock Exam eligibility pending its scientific, key/distractor, English,
rights and optical review. No bulk automatic academic certification or random option
padding occurred. The new items have identified **Codex academic solution/editorial
review** and worked English rationales; this is not independent specialist certification.
Answer option ordering is deterministically permuted to remove the repeated authored
A/B/C/D/E pattern. Independent academic/English/psychometric acceptance and legacy
source rights remain unestablished. Existing legacy language discrepancies are
preserved for compatible readers and are not claimed corrected across the corpus.

Consequently, the request's comprehensive academically reliable **entire-corpus**
acceptance criterion remains open. The produced foundation package is usable for
offline review/import preparation and exact-quota integration; it is not represented
as an academically certified complete replacement of all existing educational material.

### Changed modules and migration status

Backend CEnT paths:

- `Cent.Module/CurriculumRelease.cs`, `CurriculumPackage.cs`, `CentCurriculumImporter.cs`,
  `CentDbContext.cs`, `CentLearning.cs`, `CentPractice.cs` and the module resource list.
- `Cent.Module/Exams/CentExamAssembly.cs`: case-sensitive scientific option comparison.
- `Cent.Module/Content/curriculum-2026.json`; six additional source HTML files;
  `Content/Materials/cent-content-2026-r1/` and `Content/Review/cent-content-2026-r1/`.
- `Cent.Curriculum/Authoring/{Syllabus,Core,Chemistry,Reading,build-release}.mjs`,
  `OfflineRelease.cs`, the guarded existing authoring entry point, checksum verifier
  and README. Default legacy regeneration now refuses to rewrite the combined sources.
- `Cent.Exam.Tests` release/import/Practice/mastery/migration tests and linked offline
  verifier; existing `Cent.Tests/CentCurriculumTests.cs` count assertions now derive
  from the package rather than requiring five subjects. That shared-host suite was not run.

Minimal Itatest functional changes: `types.ts`, data labels/local scoring helpers,
`services/cent.ts`, `services/learning-presentation.ts`, `components/ExamExperience.tsx`,
three existing course/progress/readiness link consumers and their focused unit tests.
No CSS, typography, brand assets, navigation structure or page composition changed.

Migration **20261122081723_VersionedCurriculum**, its designer/model snapshot and
`Cent.Module/Deployment/cent-versioned-curriculum.sql` add only two `cent_*` tables,
indexes and NoAction foreign keys. No old-table alterations, backfills, updates or
deletes. The forward script is generated offline after VersionedMockExams and is
not a fresh-database bootstrap. **No migration was applied to any database.** The
generated destructive Down is not an application rollback after records exist;
retain companions and compatible readers. SQL Server migration/import, multi-instance
locking and restoration rehearsal remain unperformed. The existing SQLite preview
upgrade path was not changed or run.

Import-ready engine manifests are generated/validated, and importer integration can
create the current exam release companion. Administrator `ReviewedAt`/`ReviewedBy`
remain null; no reviewer account or sign-off is fabricated. Exam flags and blueprint
publication/availability are unchanged. Prior final-timeout/admission policy gates
remain pending. Commerce prices/access terms are not implemented or changed here.

### Executed validation and isolation

- **53/53** module-only `Cent.Exam.Tests` cases pass, no skips; this builds only
  Cent.Module and that test project. Original 40 infrastructure cases remain passing.
  Added coverage includes all source hashes, six-subject mappings, English/Persian
  policy for new content, legacy byte/ID retention, malformed dependencies, 20 randomized
  historical/current exact-quota assemblies, passage atomicity/privacy, import replay,
  note/result/publication retention, actual Reading Practice submission/retry, legacy
  diagnostics, syllabus-scoped mastery and the two-table migration/offline SQL.
- **221/221** Itatest unit tests pass. Current frontend type/build/lint verification
  is recorded below when complete; the earlier successful production build preceded
  the final capability/link additions.
- The offline verifier exports `Content/Review/cent-content-2026-r1/exam-manifest.json`
  through the module-only test project. The legacy Cent.Curriculum authoring project's
  standalone restore cannot find AngleSharp in the offline cache; it was not falsely
  reported built. The linked verifier and Node generator need no AngleSharp.
- The optional PowerShell verification script is blocked by the machine's script
  execution policy. The tested C# verifier independently validates all 45 raw hashes;
  no system execution policy was changed.
- Tests use disposable **in-memory SQLite fixtures**, not an existing/development/
  production database; `EnsureCreated` for fixtures is not migration application.
  No existing database, user/financial record or running configuration was modified.
- Git boundary checks: all backend changes are confined to CEnT Module/Curriculum/
  test paths; original bundled JSON/source/payment/authentication files have no tracked
  delta. `D:/Lerona/Frontend` remains clean. **No Lerona code, configuration, database
  or behavior was modified; no Lerona build/test/migration ran.** No commit, push,
  deployment, runtime exam activation, checkout or real payment occurred.

## Phase 3 continuation and Phase 4 delivery — 2026-11-22

Application source was confirmed at `D:/Lerona/itatest/src`, alongside its own
`package.json` and Vite configuration. The shared backend changes remain confined
to CEnT Module/Curriculum/module-only tests. No Lerona application was built or tested.

### Content actually added and audited

`curriculum-2026-r2.json` adds 19 Persian teaching supplements, 52 original English
five-option questions/exercises and two original English Reading passages. It layers
over the unchanged original and r1 bundles, retaining their IDs, payloads and source
bytes. r2 has a distinct curriculum/syllabus identity. The merged import candidate
contains 51 source HTML files, 247 topics, 487 source sections, 832 exercises and
985 bank questions. The current original candidate set is 166 questions and five
shared passages; exercise/bank entries for an authored item are the same item.
There are 57 Persian foundation supplements in total.

| Subject | Foundation supplements | Original candidate questions | Current exam quota |
| --- | ---: | ---: | ---: |
| Reading | 10 | 33 | 10 |
| Mathematics | 9 | 27 | 15 |
| Reasoning | 4 | 19 | 15 |
| Biology | 7 | 21 | 10 |
| Chemistry | 20 | 50 | 10 |
| Physics | 7 | 16 | 5 |

The expansion covers additional Chemistry phase laws, molecular shape/polarity,
electron configurations/quantum-number bounds, dilution/mass stoichiometry, Gibbs
energy/partial pressures, mobile ions/solubility, buffers/hydrolysis, electron
balance/cell potentials, functional groups/isomerism and environmental/label
interpretation. Reading adds abstraction, evidential limits, attributed reporting
and necessary conditions, each tied to a complete original five-question passage
group. Additional mathematics, reasoning, biology and physics exercises check domain
constraints, weighted data, causal/conditional claims, molecular/cell function,
relative motion, work, buoyancy, continuity and electrostatics.

All 31 local syllabus areas retain explicit foundation mappings. This is broad
foundation coverage, not a claim that every official competency has exhaustive
teaching depth or a calibrated assessment. The new examples/solutions were checked
by the identified Codex author/reviewer; independent specialist/English-level and
psychometric acceptance is not fabricated. Attempts to re-fetch CISIA during this
continuation failed because both web connectors and direct HTTPS were unavailable;
this work uses the existing source register/mappings and the owner's explicit
65-question/140-minute requirement, not a claimed new live verification.

The r2 review directory extends the existing content records with:

- Individual audit rows for all 819 retained questions and 666 extracted exercises,
  plus all 430 original teaching sections and all 39 source-rights records.
- 188 independently recomputed numerical keys, zero mismatches. Their scope is
  numerical calculation only: this does not certify wording/distractors or rights.
  The other 1,297 item rows do not receive a deterministic key verification claim.
- 107 related numerical/template families; these are similarity flags, not a
  certificate that all conceptual/paraphrased duplicates have been adjudicated.
- Four linked original replacements/clarifications for blanket isotope shortcuts,
  intermolecular-only hydrogen bonding, undefined generic pH “acidity” ratios and
  the already quarantined conditional-logic item. Historical payloads remain intact.
- A newly bound immutable candidate manifest and six printable r2 supplement HTMLs.

**Entire-corpus Phase 3 acceptance remains incomplete.** Legacy prose, explanations,
figures/notation, scientific distractor adjudication and full English conversion are
not claimed complete. No source-rights authorisation or licence was supplied; all
39 legacy sources retain an explicit unverified rights status. Legacy material is
not promoted into new mock eligibility. The previously recorded 1,152 mixed-language
assessment/explanation flags are not falsely labelled translated. These limits are
isolated from the implemented original-content Practice and mock experience.

### Implemented student experience

New routes: `/student/mock-exams`, `/student/mock-exams/:id`, and
`/student/mock-exams/:id/result`. Existing simulator/results pages link to them;
legacy simulator/diagnostic history remains distinct. Existing components/styles,
authentication and navigation structure are reused without a visual/brand redesign.

The mock UI consumes only the existing Phase 1 endpoints. It implements version
availability/instructions/consent, six-section configuration, English passages,
active-section question navigation, clear-answer commands, server-acknowledged saves,
terminal completion/timeout, raw-score metrics and per-subject results, passage/key/
explanation review, paginated history and continuation. A local timer displays an
estimate anchored to server time and a monotonic elapsed interval; only server
responses can close/advance sections. Deadline polling, focus/visibility and online
recovery fetch the accepted state. Offline time is never paused or transferred.

A per-account/per-attempt local command queue persists one exact command before
sending. Uncertain saves/advances/completion are retried verbatim with the same
command ID and expected revision. No acknowledgment is shown before a server
receipt. Pending writes prevent another mutation. Stale/closed commands reconcile
without silently overwriting another tab. HTTP operations have a 15-second timeout
so a stalled request does not leave recovery indefinitely blocked. Native keyboard-
trapping confirmation dialogs warn before irreversible early advancement/completion;
Escape/cancel leaves the section active. Closed sections are not navigable.

Practice retains all six subject/topic selectors and original flat contracts, with
passage-aware Reading and current original content. Submitted review now returns
frozen question/options/figure/passage context in addition to the old review fields;
correct, incorrect and unanswered feedback is shown with English original-content
explanations. Legacy result JSON/scoring and explanation-only responses remain
readable. Existing reader/local-note recovery was retained while resolving lint
findings in asynchronous data/storage effects.

The new bound draft uses `expired-feedback-v1`: full timeout finalizes the same raw
feedback policy as participant completion. Seeded/published definitions are not
rewritten. New starts use the existing simulator entitlement decision via the
existing admission interface; no new grant/product/subscription/payment gate is
created. Ownership and terminal checks protect review, which remains available
without requiring a continuing subscription. New mock evidence remains excluded
from legacy mastery. Commerce benefits/prices and account/session behavior are unchanged.

Import preparation now creates a distinct **disabled DRAFT** definition bound to
its manifest/content/syllabus. The authenticated administrator publish endpoint
validates it and leaves new starts disabled. Activation still requires separately
reviewed content metadata and existing access gates. This endpoint was exercised
only against a disposable in-memory test fixture; it was not called on an existing
application/database. Reviewer identity/time remain null in the import candidate.

### Verification and operational status

- Backend: **58/58** module-only tests pass, no skips. They build Cent.Module only;
  HTTP lifecycle/history/ownership, irreversible section transitions, timeout raw
  scoring, passage/privacy, snapshot/result immutability, existing-access regression,
  draft publication/activation gates, content imports/checksums and migration/model
  consistency are covered. Fixtures use memory/temporary in-memory SQLite with
  EnsureCreated; no migration was applied to an existing database.
- Frontend: **237/237** unit tests pass; TypeScript and Vite production build pass.
  Repository `npm run lint` passes, including browser/build scripts. ESLint now knows
  their actual Node/browser globals and excludes generated preview/tool artifacts;
  no application rule was broadly disabled. Existing effect lint failures were fixed.
- Playwright local fixture scenarios pass for consent/idempotent start, Reading and
  terminal privacy, lost-save/browser-closure retry, navigation/confirmation/offline
  recovery, server-driven section changes, 390/768/1280 layouts, timeout results/history
  and passage-aware Practice review. The confirmation is keyboard trapped and
  cancelable with Escape. All **seven** scenarios pass, including the existing Persian
  source reader and local-note draft recovery after refresh. API calls are intercepted
  fixtures, not a live DB-backed
  full integration or SQL Server lock/concurrency certification.
- All 51 embedded source hashes pass, the r1 questions/passages are retained, and
  the original JSON SHA256 is still
  `5f5c16c6ab02e019de2604160307ed1e1f9adc734fc94ec840947f36f3f287a9`.
- No additional schema migration is needed by this continuation. Previously prepared
  VersionedMockExams/VersionedCurriculum migrations and SQL remain **unapplied**.
  No existing database was connected to, changed, migrated or deployed. No production
  configuration, start flag, publication, activation, purchase or entitlement changed.
- Mock and Practice code are ready for isolated acceptance/release integration.
  Production readiness still requires authorised migration/import and SQL Server
  operational validation, content sign-off, and explicit later activation. Legacy
  scientific/language/rights/optical acceptance remains open as detailed above.
- Lerona frontend, backend host/dependencies, data and shared infrastructure remain
  untouched; no Lerona builds/tests or production operations ran.
