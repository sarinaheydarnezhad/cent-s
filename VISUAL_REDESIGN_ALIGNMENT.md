# Visual redesign alignment

Audit: 2026-11-20. New roadmap uses **CEnT update Phases 1–6**. Existing `docs/refinement/PHASE_*` files refer to an older visual programme through Phase 7 and planned Phase 8; the numbering is not interchangeable. No design or styling changed in this audit.

## Available references reviewed

- `docs/brand/Itatest-Complete-Brand-Design-Guidelines-V1.pdf`; its existing extraction `docs/refinement/evidence/brand-guidelines-extracted.txt` and rendered-page inventory. This audit read the extraction; it did not independently re-extract every PDF page.
- `docs/brand/{README.md,brand-board-reference.png,ui-reference.png,palette-reference.png,logo-original-reference.png,logo-reference.png}`; original supplied hero images and shipped `public/images` WebP derivatives.
- Current top records of `docs/refinement/{PROGRAM_STATUS.md,DESIGN_SYSTEM.md,DECISION_LOG.md,OPEN_QUESTIONS.md}` and reports Phases 5–7; historical architecture audit treated as historical.
- Current source: Brand/AppearanceControl/UI/Fields/Dialog and scoped public/student/assessment/reading/commerce presentation. Visually inspected brand-board-reference.png, Phase 7 catalog Light1440 screenshot and Phase 6 reader Dark390 screenshot. These are saved prior evidence, not a fresh browser session or production capture.

## Alignment inventory

| Area | Current status | Exam/monetisation dependency |
| --- | --- | --- |
| Slate/Sage identity and flat logo variants | Implemented; prior approval recorded | Independent; retain `public/brand` assets and approved geometry. |
| Light/Dark, persisted single-click appearance | Implemented | Independent; new views must use existing semantic tokens, not invent a second theme. |
| Typography/RTL | Vazirmatn Persian, local Inter Latin, direction wrappers implemented | Reading requires sustained English LTR text within Persian RTL navigation; validate narrow/mobile layouts. |
| Shared components | UI, Fields, Dialog, feedback/progress/loading/empty system implemented | Extend shared controls; no new UI framework. |
| Public homepage/artwork | Phase 3/3.1 implemented with supplied Colosseum/underline and restrained gradients | New exam facts and offers need truthful copy; existing brand-board sample stats/IMAT/SAT/planner are not implemented features. |
| Student dashboard/navigation | Phase 4/4.1 implemented | Sixth subject, version-specific progress and finite purchased access affect data states; keep existing visual hierarchy. |
| Assessment/results/readiness | Phase 5 implemented | New passage layout, section navigation/timers, raw-score labels/version badges require functional contracts first. Current global navigation/60-minute copy cannot be preserved as new exam behavior. |
| Library/notes/reader | Phase 6 implemented | Preserve watermark, non-inverted PDF pixels, anchors and draft semantics. New finite expiry/device/session states affect access feedback. |
| Commerce/catalog/account | Phase 7 implemented locally; **owner visual review pending** in latest records | Material product conflict: permanent individual sales + subscriptions differ from fixed subject/bundle/12-month model. Reuse presentation/recovery components; current offers/copy cannot be the target product contract. |
| Administration | Existing functional screens; visual Phase 8 not started | Versions/passages/scientific review/bundle tiers/devices require reviewed workflows; avoid unrelated admin redesign in engine work. |
| Calendar/planner | Shown in inspiration; no actual route/model/API found | Requires new functionality and product selection; cannot be delivered by styling a reference image. |

Current foundations contain the approved base colors `#4D687A`, `#A5B5A1`, `#29343C`, `#E0E4E6`, `#F5F7F7`, shared spacing/radii and accessible semantic aliases. Sage communicates learning/progress/guidance; Slate supports ordinary interactions. Existing approved usage/feedback documents remain the design source of truth.

## Conflicts and supersession

1. The older architecture audit describes no theme and no backend access; current source has themes and the separate backend is readable. Do not convert those historical statements into current blockers.
2. Older status paragraphs say study-return synchronization is unresolved; Phase 6 documents that the harness now waits for reader initialization and preserves exact-page/draft assertions. Treat it as a recorded resolution, not a new bug or proof of all persistence correctness.
3. Prior Phase 5 protected timing/scoring and intentionally retained cleared-answer/expiry issues. This functional update may address them only in its explicit tasks; a visual approval does not authorize rewriting their historical behavior.
4. Phase 7's no-discounts/no-cart implementation accurately matched its supplied old backend contract. The user's mandatory model now requires bundles/discounts/finite subject grants. Record the product delta; do not misclassify a label change as implementing it or reopen the fixed model for approval.
5. Prior records prescribe English technical reporting. This request explicitly requires a Persian final report, which takes precedence. Audit documents remain English for repository continuity. No prior programme documents were rewritten.

## Recommended separation

Finish version/content/commerce/device contracts and services before changing affected UI. Keep branding, foundations, auth/payment proofs and reader state protected in functional commits. Then use CEnT update Phase 5 for passage/section presentation and subject/bundle/access states in separate reviewable changes. Validate both themes, keyboard/focus, RTL/LTR, 320–1440px, long passages, reduced motion, readable scientific notation and access failures. Full cross-browser/assistive-technology acceptance remains pending; old Chromium evidence and reported contrast samples do not establish it.

Six hook lint errors were recorded in the latest refinement evidence (CentUI1, PracticePages1, StudyReader4). This is historical evidence, not a fresh lint result. Do not hide or repair unrelated lint debt within a visual-only task. Preserve prior galleries and approval records; review new screenshots against the current implementation and explicit requirements.
