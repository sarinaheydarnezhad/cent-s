# Feature inventory

Audit: 2026-11-20. Classifications apply to inspected local source. “Already implemented” does not mean deployed, fully tested now, or officially compliant. Evidence aliases/path map: [affected modules](AFFECTED_MODULES.md).

| Capability | Classification | Evidence and extension direction |
| --- | --- | --- |
| Public subject/chapter/topic catalog | Already implemented | `CourseCatalog`, `/curriculum`, CentLearning; extend metadata rather than add another syllabus store. |
| Five-subject source curriculum | Already implemented | Bundled corpus and CurriculumIdentity; source-derived taxonomy, not a verified complete official syllabus. |
| Reading course and B2 passage bank | Missing | No sixth course or passage items in corpus; document reading is a different capability. |
| Versioned exam/blueprint and syllabus coverage | Missing | No version entities/contract fields. |
| Question CRUD and topic/source provenance | Already implemented | CentPractice admin, curriculum entities/importer; preserve identifiers. |
| Official five-option question publication | Requires refactoring | Bundle validator requires four; new admin defaults four, API accepts 2–6. |
| Shared passage + several linked questions | Missing | SourceSection link supplies provenance; no passage snapshot, passage-group assembly or attempt presentation. |
| Text/SVG question rendering | Partially implemented | ExamExperience supports plain text/options/SVG; no TeX renderer, semantic equations or richer review payload. |
| Short diagnostic and topic practice | Already implemented | Existing start/filter/snapshot/submit/results; distinguish from full mock. |
| Faithful full-length official-format mock | Requires refactoring | Existing simulator is 20 maximum/60 minutes with random subject order. |
| Server section timers and one-way transitions | Missing | Flat global deadline only. |
| Cleared-answer progress and expiry completion | Requires refactoring | Null keys count as answered in meter; expired attempt cannot submit; policy must be defined. |
| Same-tab attempt restore | Partially implemented | sessionStorage restores unexpired attempt/answers; index resets, no version key/server answer autosave. |
| Cross-device attempt continuation | Missing | No answer autosave/resume endpoint established. Do not promise continuation as part of device transfer. |
| Snapshot-based scoring/history | Already implemented | AttemptQuestion and stored ResultJson; extend rather than replace. |
| Official raw scoring | Missing | Current authoritative server returns accuracy only. Legacy frontend helper's optional penalty is different and inactive in production. |
| Official normalised score | Requires further investigation | CISIA cohort coefficients unavailable; no local calculation can claim official equivalence. Exclude from promised implementation. |
| Version-safe history comparisons | Requires refactoring | Current comparison uses kind/topic counts, not scoring/exam identity. |
| Topic mastery/coverage and recommendations | Already implemented | CentLearning/Analyze, deterministic rules, distinct latest evidence; taxonomy expansion needs denominator policy. |
| AI provider integration | Missing | Current analysis provider is rules; no active OpenRouter/n8n integration claimed. No new AI system required for this update. |
| Calendar/macro-period/session feed | Missing | No model/API/route; future factual calendar must separate date, seats, deadline and source freshness. |
| Personal study planner/reminders | Missing | Readiness and topic advice exist; no dated study plan or reminder scheduler. Optional product expansion. |
| Image-page and source-text protected reader | Already implemented | StudyReader/CentContent, watermark, saved positions. |
| Revisioned private notes and study return | Already implemented | Notes/progress; Phase 6 records corrected browser readiness synchronization. |
| Saved question/bookmark collection | Missing | Persisted attempt answers/review exist; independent favorite/saved-question entity/endpoints do not. PDF outline bookmarks are unrelated. |
| Individual 12-month subject purchase | Requires refactoring | Single training sale exists but is permanent; approved requirement takes precedence. |
| Custom subject bundles and progressive discounts | Missing | Single-product checkout and no pricing tiers/order lines. |
| Degree/goal recommended bundles | Missing | No commercial goal model. |
| Verified checkout, owner order history | Already implemented | CentPayments, current commerce recovery; preserve idempotency and price snapshots. |
| Bundle-aware item-level grants/history | Missing | One unique grant per order today; scope needs explicit item model. |
| Time-bound subject access and repurchase | Requires refactoring | Expiry fields/checks exist; confirmation and permanent-ownership guards conflict with finite subject grants. |
| Google-based customer identity | Partially implemented | Both Google modes plus password flows; deployed mode and transition policy unknown. |
| Two registered devices | Missing | No Cent device registry. |
| Single concurrent study session | Missing | No lease/heartbeat or study-session admission. |
| Controlled device changes | Missing | No replacement/recovery/support policy or API. |
| Nontransferability/watermark | Partially implemented | Owner-bound access and UI watermark exist; sharing limits absent. |
| Administration/content import/audit | Partially implemented | Existing screens/import/price/publish/revoke operations; no versions, bundle tiers, passage reviewer workflow or devices. |
| Transactional curriculum import/hash verification | Already implemented | Stable IDs, source checksums, package hash; reimport side effects require redesign. |
| Scientific review/publication workflow | Partially implemented | Five recorded findings and quarantine exist; no evidence of complete external science validation. Chemistry remains draft. |
| Persian RTL / English scientific content | Partially implemented | lang/dir, bdi/auto and Vazirmatn/Inter; inline messages, no centralized localization catalog. |
| Approved design foundations/components/themes | Already implemented | foundations.css, UI/Fields/Dialog/Brand/Appearance; scoped visual layers. |
| Full redesign completion | Partially implemented | Phases 1–7 implemented in prior work; Phase 7 review pending, admin Phase 8 deferred. New format screens absent. |
| Production SQL/migration/deployed-state acceptance | Requires further investigation | Source/migrations readable; actual schema, customer cohorts and running binaries not reconciled. |

Features marked missing are not automatically approved additions. [Execution plan](PHASE_EXECUTION_PLAN.md) separates required exam/monetisation work from optional planner/bookmark expansion. Recommendations extend Cent modules and the current design system; no second authentication, payment, content, progress or routing implementation is proposed.
