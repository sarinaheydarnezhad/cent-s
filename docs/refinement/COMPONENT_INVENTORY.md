# Current phase — Phase 7 commerce frontend

The resumed Phase 7 commerce frontend is implemented locally against the supplied Phase 7A handoff and is ready for owner visual review. Phase 6 source and earlier documented limitations are retained. No commit, push, deployment or real payment. Phase 8 administration has not started. This current record supersedes historical phase-status statements below.

See [Phase 7 report](PHASE_7_REPORT.md), [seven AFTER-only review images](evidence/phase-7/index.html) and [Phase 7A API handoff](PHASE_7_COMMERCE_API_HANDOFF.md).

CommerceUI adds local CommerceHero, CommerceLoading, Price, AccessLabel, ProductCard, SubscriptionSummary, OrderSummary, OrderHistory and OnlineAccessNotice. These compose existing ResourceCover, Badge, Button, FilterGroup, Notice, Skeleton and EmptyState without introducing a new design system.

---

## Preserved earlier records

# Current phase — Phase 6 library, notes and reading

Phase 5 received explicit owner visual approval and is closed with its documented limitations retained. Phase 6 is implemented locally for explicit visual approval. Frontend scope only; no commit, push or deployment. Phase 7 has not started. This current record supersedes historical phase-status statements below.

See [Phase 6 report](PHASE_6_REPORT.md) and [seven AFTER-only review images](evidence/phase-6/index.html).

Added ReadingUI.tsx (ReadingHero, ResourceCover, ReadingPosition, NoteSaveFeedback), ReaderExperience.tsx and ReadingLibrary.tsx. CommercePages retains unchanged commerce/account functions and re-exports existing library/notes route consumers. App routes, shared primitive contracts and theme ownership are unchanged.

---

## Preserved earlier records

# Current phase - Phase 5 assessment refinement

The owner explicitly approved Phase 4.1 and authorized Phase 5. Phases 4 and 4.1 are closed with every documented limitation retained. Phase 5 is frontend-only and delivered for explicit visual approval; Phase 6 has not started. No commit, push or deployment. This record supersedes earlier phase-status statements below; historical reports and evidence remain intact.

See [Phase 5 report](PHASE_5_REPORT.md) and [eight AFTER-only review images](evidence/phase-5/index.html).

Added page-scoped AssessmentUI and ExamExperience; ReadinessPage consumes existing curriculum/mastery endpoints; AssessmentResults houses existing result-detail and simulator presentation. PersonalResults and LearningProgress retain existing result/mastery rules. App route paths remain unchanged; only the preparation element changes from the library alias to ReadinessPage. Commerce/library/notes/reader/admin implementations are untouched.

---

## Preserved earlier records

# Current phase — Phase 4.1 visual refinement

Phase 4 required further visual refinement and is not yet visually approved. Phase 4.1 is frontend-only and awaits explicit owner visual approval. Phase 5 has not started. No commit, push or deployment. This current record supersedes earlier phase-status statements below; the earlier reports and their technical limitations remain historical evidence.

See [Phase 4.1 report](PHASE_4_1_REPORT.md) and the [six AFTER-only review images](evidence/phase-4-1/index.html).

Phase 4.1 adds page-local StudyIllustration (decorative code-native SVG) and BookCover (decorative cover fallback), a direct-score ring and a native saved-page meter. Reuses the established primitives and semantic colors; no dependencies, framework or new reusable business abstraction. Student shell compactness remains scoped to .student; the shared theme component changes only decorative SVG keys and icon size.

---

## Preserved earlier records

# Current phase - Phase 4 student experience

The owner visually approved Phases 3 and 3.1 and closed both with their documented technical limitations retained. Phase 4 is implemented for explicit visual approval. Its authorized scope is: student dashboard, authenticated navigation and existing non-transactional account presentation. Phase 5 is not authorized. Starting checkout: clean local main at 1ed76ee, committed by the owner before this task.

The approved Phase 3.1 Slate/Sage direction, restrained semantic gradients, flat logo and persisted single-click Light/Dark control remain authoritative. Preserve scoring, mastery calculations, recommendation ordering, routes, permissions, session/authentication and reader persistence. The existing study-return synchronization limitation remains Phase 6. Assessment/results, PDF reader, commerce and administration are not redesigned. No commit, push or deployment.

Current implementation and verification are recorded in [Phase 4 report](PHASE_4_REPORT.md). Historical phase records below retain their original context; earlier pending-approval statements are superseded by this explicit owner approval.

---

Phase 4 adds one page composition (StudentDashboard), a narrowly scoped pure metadata presentation helper and student.css; it reuses existing shared primitives. No new library/store/provider, generic card abstraction, progress ring or account form. Assessment functions remain in PracticePages with a dashboard re-export.

# Phase 3 composition update

The owner visually approved Phase 2 and authorized Phase 3 public/auth presentation only. Phase 2 is closed with all documented technical limitations retained. Phase 3 is implemented and delivered for explicit visual approval. Phase 4 has not begun and requires separate authorization.

No replacement component library. Existing five-layer boundaries remain. Public pages compose UI/Fields/CentUI/Brand/AppearanceControl/JourneyNav; LearningIllustration is a page-domain decorative SVG, not a shared data component. New public.css contains page composition with semantic tokens. CourseCatalog gains two optional presentation props; its data/access logic remains owned by the domain component. A small shared disclosure link-focus fallback is the sole behavioral system correction, with public and existing sidebar evidence. No generic recovery API, exam selector, planner, content model or nonexistent route was introduced.

---

## Preserved earlier phase records

# Component and state inventory — Phase 2

The inventory below supplements and preserves the Phase 0 audit. Pre-implementation JSX tags, literal classes and import dependencies are recorded in [source-before.json](evidence/phase-2/source-before.json), captured before component edits. Dynamic classes and visual similarity were reviewed in the actual source, not inferred solely from counts. Existing styles.css contains compressed legacy and inactive selectors; cent.css owns current domain layouts; foundation-ui.css is the established compatibility/semantic layer.

## Classification and consolidation decisions

| Layer | Existing owners / consumers | Findings and implemented decision |
| --- | --- | --- |
| Foundations | foundations.css, appearance.js, typography/font files, Brand assets; foundation-ui.css compatibility aliases | Preserve Phase 1 exact palette/logo/type/theme owner. Add semantic aliases for ordinary Slate selection, learning and recommendation; independent status roles remain. Existing spacing/radius/control/focus/layer tokens reused. |
| Shared primitives | UI ProgressBar; native `.button`, `.icon-button`, `.card`, `.cent-tag`, inputs/selects/textareas; appearance native select | Consolidate action/surface/field/selection/feedback states within existing CSS. Extend UI with Button/IconButton/Card/ActionCard/Badge/FilterGroup/Notice/StatusMessage/LoadingState/Skeleton; native Fields wrappers associate labels/hints/errors. ProgressBar gains truthful ARIA values. Legacy class consumers remain compatible. |
| Shared composed components | UI StatCard/PageHeader/EmptyState; CentUI LoadState; PublicLayout/DashboardLayout; JourneyNav; AppearanceControl | Compose LoadState from shared feedback without changing useRemote. Distinguish EmptyState kinds. Shared mobile disclosure behavior fixes naming/expanded/closed-focus/Escape without layout/route redesign. Add native Dialog/ConfirmationDialog as a foundational composition, demonstrated only in local reference. |
| Domain components | GoogleSignIn, ProtectedRoute, CentUI useRemote, source/PDF Reader, course cards/details, assessment controls/result review, LearningProgress and PersonalResults | Keep authentication, permissions, resource protection, scoring, evidence calculations, session and fetching ownership. Do not generalize assessment options into generic tabs or reader panels into generic cards. Only presentation props/labels/surfaces change in learning/result consumers. Google provider button is excluded. |
| Page components | HomePage, ExamPage, DiagnosticIntro, LoginPage, Callback, NotFound; CommercePages exports; PracticePages exports; CentAdmin six screens | Preserve composition, routes, data/state handlers and business workflows. Login integrates fields/action/error/mode; catalog integrates mode filter. Dashboard and result integrate recommendation Card. Other pages receive existing shared-class contracts, with contextual migration deferred to their approved phases. |

## Repeated patterns and disposition

| Pattern | Consumers / inconsistency before Phase 2 | Current consolidation / boundary |
| --- | --- | --- |
| Buttons | Public links, login/Google, checkout, exam navigation/submission, reader notes, admin save/upload; varied38/44/48/54px sizes, hover translation, no typed loading contract | Shared44/48/56px API and compatibility CSS; loading disabled/aria-busy/dimension reservation in Button. Existing legacy conditional loading text is not wholesale migrated. Primary Slate; ghost/text quiet; destructive only real removal. Provider rules explicitly excluded. |
| Surfaces | `.card`, `.stat-card`, product/library/note/course/admin sections; unnecessary hover shadows and inconsistent radii | Flat common16px surfaces; explicit outlined/elevated/learning/recommendation/selected contracts. Dashboard/result recommendation uses Sage. Product/reader/domain layouts stay with owners. No clickable div abstraction. |
| Fields | Login wrapping labels, admin repeated inputs, reader textarea, search/course/filter selects, native checkboxes | Shared generated ID/label/hint/error and native attribute pass-through; login first real consumer. Existing native inputs get common invalid/focus/border styling. Validation algorithms and constraints unchanged. |
| Mode and selection | Login `.auth-tabs`, catalog `.section-tabs` buttons lacked selected semantics; subject filters use native selects | FilterGroup uses labeled group and aria-pressed, matching actual mode/filter behavior rather than pretending to be tabpanels. Selected styling Slate. Native select/details patterns retained. |
| Labels | `.cent-tag` used success green for many unrelated content/access labels, small squared corners | Neutral rounded default; explicit Badge learning/recommendation/status variants. Broad page-specific status remapping deferred, not guessed from text. |
| Feedback | LoadState error+retry/loading, inline auth error, notices, reader save status, native confirm/beforeunload | Notice/status/loading/skeleton/dialog foundations and documented framework. LoadState/login integrate; reader/admin/financial context retained for later phases. No duplicate global notification surface. |
| Progress | UI ProgressBar clamped CSS width but original label/raw value did not establish progress role or clamp ARIA; repeated learning bars | Shared progressbar role/min/max/now/valueText uses same finite clamp. Learning/result bars named by course/topic, unknown evidence wording retained. Assessment uses action tone; calculations unchanged. |
| Mobile navigation | Public trigger lacked expanded/controls; dashboard trigger/close had no names; offscreen sidebar could remain focusable | Existing layouts use shared disclosure hook, visible trigger names/expanded/controls, Escape restoration, outside/focus-exit dismissal; visibility:hidden removes closed mobile panel controls. Current-route NavLink behavior retained. |
| Tables | Native table-card across admin/results/account; contained horizontal scrolling, small metadata, no full header/caption contract | Retain native tables and existing business cell content. Full table/pagination abstraction is unjustified in Phase 2; captions/header relationships/density remain page-phase work. |
| Overlays | No active reusable React modal/popover/tooltip before Phase 2; destructive actions use browser confirm | Native Dialog foundation added with focus/scroll/dismissal contract. Native confirmation requirements preserved; no destructive operation run. No custom tooltip/popover/menu dependency added for inactive CSS. |

## Dependency direction

Foundations → UI/Fields/Dialog and compatibility styling → CentUI presentation and page consumers. Domain services/AppState/router never depend on preview data. useRemote remains in CentUI; UI never calls an API. Dialog composes Button; native Fields share only presentation/associations. Navigation shells share a disclosure hook, not role/auth logic. Reference imports the real system through a standalone development HTML entry; production App never imports it.

Detailed purpose/variants/states/accessibility/themes/examples/misuse/consumers/limits for every shared export: [COMPONENT_USAGE_GUIDE](COMPONENT_USAGE_GUIDE.md). Feedback decisions: [FEEDBACK_PATTERNS](FEEDBACK_PATTERNS.md). Rendered coverage and known gaps are distinct from this source inventory.

## Deferred and deliberately absent abstractions

No active ring/milestone/achievement component, standalone switch, pagination, breadcrumb, custom menu/dropdown/popover, tooltip or toast infrastructure justifies a new API now. Native radios are supported by CheckField for the documented form standard/reference. Existing details/summary remains native. Domain recommendation generation, learning evidence calculations and source/canvas content are not UI concerns. Full page-specific wording, missing table semantics, assessment selection semantics, toolbar density and every legacy feedback state remain later-phase work.

## Historical Phase 0 inventory (preserved)

All `src/` components/pages/services inspected statically. Export inventory: [source-inventory.json](evidence/source-inventory.json). Rendered coverage is separately labeled in [AUDIT_COVERAGE](AUDIT_COVERAGE.md).

| Existing owner | Implemented responsibility | Reuse/refinement direction after approval |
| --- | --- | --- |
| Brand | Linked C mark, Cent-s wordmark, inverse flag, accessible name | Preserve link behavior; replace public asset/name using reviewed vector |
| PublicLayout | Sticky header, responsive dropdown, public main/footer | Shared tokens, expanded/controlled menu semantics, focus handling |
| DashboardLayout | Student/admin sidebar, topbar, avatar, logout | Shared shell themes; named mobile controls; review offscreen focus |
| ProtectedRoute | Session checking/error/retry, login/role redirect | Preserve all conditions, route destinations and return state |
| JourneyNav | Two-step diagnostic/package navigation | Terminology and current route presentation; no extra steps |
| UI.ProgressBar | Clamped width + textual aria-label | Progress semantics/value association; not a scoring calculation |
| UI.StatCard | Label, value, optional note/icon | Typography and density; preserve actual values |
| UI.PageHeader | Eyebrow/title/description/action | Responsive heading/action hierarchy |
| UI.EmptyState | Circle illustration, title/body/action | Reuse with distinct empty vs no-search-result copy |
| CentUI.useRemote | Async data/busy/error/reload/setData | Keep current integration/disposal behavior |
| CentUI.LoadState | Spinner/status, error alert + retry | Tokenized feedback and reduced-motion; scoped loading |
| CourseCatalog / CourseDetails | Public metadata cards, chapters, skills, access/product links | Preserve data/availability and authorized study links |
| PersonalResults | Filter, comparable change, recent weighted accuracy, mastery/history | Accessible values, truthful learning labels |
| LearningProgress | Per-course coverage/mastery and topic actions | Preserve evidence thresholds and calculations |
| CentExamPage | Three modes, config, question, timer, answer map, navigation | Theme/semantics only; state/submission changes separately reviewed |
| CentResultPage | Outcome statistics, recommendations, topic progress, details answers | Clear nonjudgmental copy; data untouched |
| StudyReader / internal Reader | Protected image/source branches, controls, notes/editor/pins | Theme chrome independently of document; preserve all persistence |
| CommercePages | Catalog, checkout/result, library, notes search, account/orders | Truthful availability/status; no financial logic changes |
| CentAdmin six screens | Overview/users/content/products/orders/questions | Shared forms/tables; restricted operational behavior preserved |

## Current reusable styling without component wrappers

Buttons: `.button`, primary/secondary/ghost/light/success, small/large/block; active transform, hover transform, disabled opacity. No unified destructive/outline API or loading indicator contract. IconButton is CSS with inconsistent accessible naming and sizes.

Cards: `.card`, `.stat-card`, `.cent-product`, `.cent-admin-panel`, `.cent-library-book`, `.cent-saved-note`, `.cent-results-course`; no shared variant component. Some reading/statistical content is nested inside repeated bordered sections.

Forms: native input/textarea/select/checkbox/range/file, wrapping labels, native required/min/max validation; styling in `.cent-form`, `.form-grid`, `.cent-section-select`, `.cent-search`. No shared field error association contract. Login email/password have explicit LTR and autofill values. Scientific text uses dir=auto in question/review, source text inherits page direction.

Tabs: auth and product-kind button groups, no tablist/selected semantics. Navigation uses NavLink with active state. Tables use native table elements and horizontally scrollable `.table-card`, but headers lack explicit scope/captions; no pagination/filter component exists. Answer explanations/curriculum use native details/summary.

Feedback: `.notice`, `.inline-error`, LoadState, EmptyState, save-status. Native confirm for note changes/deletion and draft document deletion; no reusable React dialog, toast, tooltip, drawer/bottom-sheet, skeleton, pagination, radio, switch or chart component implemented in active pages. Legacy CSS for modal, switches, charts and integrations does not establish active components. Current charts are primarily bars with visible numerical text; no current rendered progress ring component was found.

## State coverage to retain

Buttons: default/hover/pressed/focus/disabled/loading. Forms: empty/filled/invalid/server failure/submitting/autofill/LTR. Navigation: active/inactive/mobile open/closed/keyboard. Remote data: busy/error/retry/empty/content; some screens keep old content alongside error. Assessment: config/active/selected/cleared/navigation/restored/expired/submitting/error/results. Reader: image/source/loading/access failure/zoom/page/notes open+closed/new+edit+dirty/save error/conflict/delete/draft restore. Commerce: owned/unowned/subscribed/expired, price/config unavailable, verification loading/error/paid/unconfirmed. Admin: empty/list/edit/save/upload/resume/publish/delete confirmation.
