# Current phase — Phase 7 commerce frontend

The resumed Phase 7 commerce frontend is implemented locally against the supplied Phase 7A handoff and is ready for owner visual review. Phase 6 source and earlier documented limitations are retained. No commit, push, deployment or real payment. Phase 8 administration has not started. This current record supersedes historical phase-status statements below.

See [Phase 7 report](PHASE_7_REPORT.md), [seven AFTER-only review images](evidence/phase-7/index.html) and [Phase 7A API handoff](PHASE_7_COMMERCE_API_HANDOFF.md).

Use Price for explicitly labeled rial values, AccessLabel for permanent ownership/current reading permission, and OrderSummary/OrderHistory for server purchase snapshots. Payment status is not an entitlement. Commerce retry storage contains only the account/product/request identity; current library data owns study links. Native details expose order/recovery information.

---

## Preserved earlier records

# Current phase — Phase 6 library, notes and reading

Phase 5 received explicit owner visual approval and is closed with its documented limitations retained. Phase 6 is implemented locally for explicit visual approval. Frontend scope only; no commit, push or deployment. Phase 7 has not started. This current record supersedes historical phase-status statements below.

See [Phase 6 report](PHASE_6_REPORT.md) and [seven AFTER-only review images](evidence/phase-6/index.html).

ReadingHero, ResourceCover, ReadingPosition and NoteSaveFeedback compose existing Badge, EmptyState, Skeleton, LoadState/Notice and AppearanceControl. ReaderExperience owns markup and notes-panel focus; StudyReader retains protected fetch/render/watermark, draft, note revision, progress and confirmation handlers. Native confirms remain with the existing owner. Native meter has visible last/furthest page semantics, never assessed mastery.

---

## Preserved earlier records

# Current phase - Phase 5 assessment refinement

The owner explicitly approved Phase 4.1 and authorized Phase 5. Phases 4 and 4.1 are closed with every documented limitation retained. Phase 5 is frontend-only and delivered for explicit visual approval; Phase 6 has not started. No commit, push or deployment. This record supersedes earlier phase-status statements below; historical reports and evidence remain intact.

See [Phase 5 report](PHASE_5_REPORT.md) and [eight AFTER-only review images](evidence/phase-5/index.html).

AssessmentUI composes existing Card, Badge, Notice, Skeleton and ProgressBar with local AssessmentHero, SubjectIcon, ResultRing, TopicLabel and AssessmentGuidance. Rings repeat direct server percentages with visible meaning. ExamExperience owns presentation and focus only; CentExamPage retains all answer/timer/storage/request behavior. Question choices remain native buttons in a named group with aria-pressed. Focus moves to the question heading on question change; the timer is not a live region. No new shared primitive contract or dialog service.

---

## Preserved earlier records

# Current phase — Phase 4.1 visual refinement

Phase 4 required further visual refinement and is not yet visually approved. Phase 4.1 is frontend-only and awaits explicit owner visual approval. Phase 5 has not started. No commit, push or deployment. This current record supersedes earlier phase-status statements below; the earlier reports and their technical limitations remain historical evidence.

See [Phase 4.1 report](PHASE_4_1_REPORT.md) and the [six AFTER-only review images](evidence/phase-4-1/index.html).

Phase 4.1 retains Card, Badge, ProgressBar, Skeleton, EmptyState, LoadState/Notice, Brand, AppearanceControl and the existing disclosure hook. Subject ProgressBar values remain server confirmedProgressPercentage, with explicit unassessed text and a dashed track. The decorative result ring repeats the supplied result percentage; it is not overall mastery. Native meter displays supplied furthestPage against pageCount without a new percentage calculation; visible wording says furthest page opened. BookCover is a decorative fallback because StudyDocument has no cover field. Theme SVG is 20px inside the student 44px button. No new dialog consumer or feature.

---

## Preserved earlier records

# Current phase - Phase 4 student experience

The owner visually approved Phases 3 and 3.1 and closed both with their documented technical limitations retained. Phase 4 is implemented for explicit visual approval. Its authorized scope is: student dashboard, authenticated navigation and existing non-transactional account presentation. Phase 5 is not authorized. Starting checkout: clean local main at 1ed76ee, committed by the owner before this task.

The approved Phase 3.1 Slate/Sage direction, restrained semantic gradients, flat logo and persisted single-click Light/Dark control remain authoritative. Preserve scoring, mastery calculations, recommendation ordering, routes, permissions, session/authentication and reader persistence. The existing study-return synchronization limitation remains Phase 6. Assessment/results, PDF reader, commerce and administration are not redesigned. No commit, push or deployment.

Current implementation and verification are recorded in [Phase 4 report](PHASE_4_REPORT.md). Historical phase records below retain their original context; earlier pending-approval statements are superseded by this explicit owner approval.

---

Phase 4 consumers: StudentDashboard uses Card (standard/recommendation), Badge (learning/recommendation), PageHeader, ProgressBar (learning with real server values and explicit unassessed aria-valuetext), Notice, EmptyState and shared LoadState/useRemote. AccountPage uses Card for read-only identity; there is no supported edit form to redesign. DashboardLayout reuses Brand, AppearanceControl and useNavigationDisclosure; the hook remains unchanged; student control transitions exclude visibility so its existing focus behavior works immediately. student.css is scoped composition, not a parallel primitive system.

# Phase 3 consumer update

The owner visually approved Phase 2 and authorized Phase 3 public/auth presentation only. Phase 2 is closed with all documented technical limitations retained. Phase 3 is implemented and delivered for explicit visual approval. Phase 4 has not begun and requires separate authorization.

Actual new public consumers: Home uses Badge/Card(standard and learning); Exam uses PageHeader/Card(learning)/Badge; DiagnosticIntro uses Badge/Card(learning) and retained JourneyNav; Login retains InputField/FilterGroup/Button/Notice; Callback uses Notice/LoadingState with original auth logic; public shell uses Brand/AppearanceControl and existing navigation disclosure. Link actions retain native Link semantics and shared primary/secondary classes. CourseCatalog supports optional actionVariant(primary/secondary) and compact excerpts; defaults preserve commerce behavior.

The disclosure hook's opt-in focusOnOpen prioritizes a native enabled button (existing dashboard close), then the first anchor for link-only public navigation. PublicLayout opts in; keyboard and dashboard regression checked. Public page composition in public.css adds no new generic primitive or token system. All component contracts below otherwise remain unchanged.

---

## Preserved earlier phase records

# Shared component usage guide — Phase 2

These contracts describe the implemented React/CSS system. The local reference renders the real components with explicitly illustrative values. Page-specific composition, exhaustive copy migration and protected workflow changes belong to later phases.

## Ownership and common rules

Foundations remain in [foundations.css](../../src/foundations.css); shared visual contracts and legacy-class compatibility remain in [foundation-ui.css](../../src/foundation-ui.css). Import primitives from [UI.tsx](../../src/components/UI.tsx), native fields from [Fields.tsx](../../src/components/Fields.tsx), dialogs from [Dialog.tsx](../../src/components/Dialog.tsx), and remote presentation through the existing [CentUI.tsx](../../src/components/CentUI.tsx). No dependency, validation framework, store or alternate theme resolver was added.

Every component inherits the Phase 1 document theme. System mode resolves through the existing appearance owner; components do not independently read OS preferences or write theme storage. Semantic tokens supply light/dark equivalents. Shared focus is a 2px outline with 3px offset. Control radius12px, card16px, dialog24px, pill999px; spacing4/8/12/16/24/32/48/64. Persian uses Vazirmatn; Latin fields can set `dir="ltr"`; source/scientific content retains its own direction. SVG action icons are18px; contextual icons20px. Give decorative icons `aria-hidden`.

Use native elements and preserve all native attributes, handlers, names and form ownership. Keep fetching, validation rules, permissions, timers, scoring, routing and persistence outside generic UI. Both component wrappers and retained native consumers use the same CSS contracts. Do not wrap every existing element merely to use a React export.

## Actions

| Component / purpose | Variants and states | Use / accessibility / themes | Existing consumers and limits |
| --- | --- | --- | --- |
| Button: one action | primary(default), secondary, tertiary, ghost, destructive; small44px, medium48px, large56px; fullWidth; default/hover/pressed/focus/disabled/loading | Primary is Slate; secondary has a clear interactive border; tertiary supports text actions; ghost removes enclosure. Explicit `type="submit"` for submission; default is button. `loading` sets native disabled and aria-busy; original/loading labels share a grid to reserve dimensions when loading is supplied. `disabled` remains authoritative. Choose a specific Persian loadingLabel. | Login and LoadState use Button. Legacy `.button` consumers throughout all pages share hierarchy, dimensions and state CSS. Loading layout reservation applies to React Button, not all legacy conditional text. No automatic request/retry or business-rule deduplication. |
| IconButton: named compact action | Same variants/states;48×48px; label required | Prefer for familiar supporting actions; always provide a Persian label. Keep destructive intent explicit. Its visual children should be decorative. | Reference exercises search. Existing shell controls retain native buttons with accessible names and equivalent focus/size foundations; no forced wrapper migration. |

Appropriate: `<Button type="submit" loading={busy} loadingLabel="در حال ذخیره…">ذخیره</Button>`. Misuse: implicit form submission, multiple competing primary buttons, destructive styling on cancel, or `aria-disabled` alone for a button that still submits. Async operation ownership and its existing submission guard remain with the caller. Navigation remains a Link/anchor with existing button classes, preserving destinations and native link behavior. Never put a link inside Button.

GoogleSignIn and the official SDK button are provider-owned. Do not pass them through Button or style iframe internals. Generic sizing and icon rules explicitly exclude `.auth-google`; retained provider neutral colors and multicolor icon remain independent.

## Surfaces and structure

| Component / purpose | Variants and states | Use / accessibility / themes | Existing consumers and limits |
| --- | --- | --- | --- |
| Card: content grouping | standard, outlined, elevated, recommendation, learning, selected;16px radius;24px padding/mobile16px | Standard is flat. Outlined strengthens a necessary boundary. Elevated supports the existing limited elevated-surface pattern; dark shadows remain none. Recommendation and learning use separate Sage aliases; selected uses Slate with explicit selected wording/marker supplied by caller. Native header/footer children receive shared spacing. | Dashboard and result next-step guidance use recommendation Card. Existing card/stat/course classes use flat shared surfaces. Other variants demonstrated in reference, available for later contextual migration. Card is a div, does not automatically create a landmark, heading, click handler or selection semantics. |
| ActionCard: whole-card action | Default/hover/pressed/focus/disabled; optional native aria-pressed | Renders a real button; Enter/Space work. Pass a clear name through content or aria-label. Navigation cards stay existing Links with card classes. Slate interaction states, never automatic Sage selection. | Reference only. Caller must prohibit nested links/buttons/inputs; the API cannot type-check React descendants. Do not add a click handler to a non-interactive Card. |
| StatCard: actual statistic | Existing label/value/note/icon contract | Preserve real value, supporting note and units. Neutral surface in both themes; numerical text remains visible. | Dashboard, result, account/admin and PersonalResults. Existing page density and smaller metadata are not comprehensively migrated. |
| PageHeader: page heading and optional action | Existing eyebrow/title/description/action | One h1 per actual page; action wraps through current responsive layout. | Existing public/student/admin headers and reference footer sample. Do not use it as a nested card heading. |

Appropriate: a Sage next-step surface containing the actual server recommendation and one Slate study link. Misuse: coloring every commerce/admin card green, nested cards merely for spacing, making all surfaces elevated, or showing a selected Card without any textual/semantic selection marker.

## Native fields

All wrappers accept native attributes and handlers. Generated useId identifiers link label/hint/error. An explicit id is supported; preserve uniqueness. `aria-describedby` supplied by a caller is merged with hint/error IDs. A nonempty error sets aria-invalid; an explicitly supplied invalid state remains when no error is passed. Required indicators are visual siblings of the label, while the native required attribute supplies accessible semantics and browser validation. No validation algorithm or error-to-field inference is implemented.

| Component / purpose | Variants / states | Example / misuse / accessibility | Existing consumers and limits |
| --- | --- | --- | --- |
| InputField | Native text/email/password/search/number attributes; default/filled/focus/required/disabled/readOnly/invalid | `label="ایمیل" type="email" dir="ltr" autoComplete="email"`; error and hint attach to this input. Readonly uses subtle surface/dashed border; invalid uses error border plus error text. Do not use placeholder as the label. | Login uses name/email/password with unchanged max/min lengths, autocomplete, disabled and onChange. Number/search/readOnly/invalid examples in reference; broader migration deferred. |
| TextareaField | Native textarea attributes; same associations/states, min-height120px and vertical resize | Use `dir="auto"` for mixed notes if the context permits. Keep length limits and handlers. Do not put educational content through copy transformations. | Reference only; existing admin/reader native textareas retain handlers and gain compatible invalid/focus tokens. |
| SelectField | Native select/options; same associations and states | Use for finite choices, supply meaningful option text; keyboard/OS menu retained. Do not replace with an inaccessible custom popup. | Reference only; current appearance and page-native selects keep their established contracts. |
| CheckField | Native checkbox or radio,20px indicator in at least44px label row; checked/unchecked/focus/disabled/required/invalid | Radios require the same name and a fieldset/legend for their question. Text describes the choice; native checked state adds the non-color indication. No custom switch simulation. | Reference verifies checkbox/radio behavior. Existing admin checkboxes use compatible shared native styling. No active application switch justifies a new switch component. |

Labels/errors use the same readable light/dark semantic text roles; input boundaries use the stronger interactive border token. Disabled contrast is recorded as an exemption, not a text-contrast pass. Native browser validation remains enabled in the application. Reference-only injected errors use `noValidate` to demonstrate server-style presentation and do not establish new application validation rules. Global login/network errors remain contextual notices rather than being incorrectly attached to an arbitrary field.

## Selection and navigation

| Component / purpose | Variants / states | Use and accessibility | Existing consumers and limits |
| --- | --- | --- | --- |
| FilterGroup | Labeled group of native buttons; active/inactive/hover/focus/disabled, aria-pressed | For mutually exclusive filtering or mode actions. Each button remains in normal Tab order. Use Slate for the pressed option. These are not ARIA tabs: there is no associated tabpanel or tab-specific arrow contract. | Login/register and catalog training/subscription preserve existing mode setters and business behavior. Reference also exercises subject filtering. Do not use for route navigation. |
| Badge | neutral, learning, recommendation, success, warning, error, info; fully rounded | A span with visible wording. Learning/recommendation use Sage; success uses independent status tokens. A status must be understandable in text. Do not style Badge as a clickable filter. | Reference demonstrates all tones. Legacy `.cent-tag` is now neutral and rounded; page-specific meaning mapping remains deferred. |
| PublicLayout / DashboardLayout navigation | Existing active routes and mobile open/closed; native NavLink current semantics | Shared disclosure hook supplies Escape/focus restoration, outside-pointer and focus-exit close; triggers have names, aria-expanded and aria-controls. Closed mobile content is visibility:hidden and leaves Tab order. Dashboard opens focus on its close button. Navigation remains a non-modal disclosure, not an ARIA menu/dialog. | Actual public/student/admin shells. Layout/routes/permission checks unchanged. Desktop navigation remains visible; no menu role or arrow-key menu simulation. Full route-change focus strategy is deferred. |
| JourneyNav | Existing two linked route stages | Native NavLink current state, labeled nav; Slate for current interaction. | Existing intro/package routes; reference uses a memory-only router with illustrative current route. No additional steps invented. |
| Brand / AppearanceControl | Existing Phase 1 variants and Light/Dark/System | Brand retains accessible home name; appearance retains native labeled select and shared owner. | Existing shells; unchanged assets/appearance implementation. Native mobile system-option text can truncate while its accessible name/options remain complete. |

Breadcrumbs, pagination, tooltips and custom dropdowns are not active reusable components in this checkout. Native details/summary remains for curriculum/review disclosure. Do not manufacture APIs for inactive legacy CSS. Later requirements can extend these foundations after documenting actual consumers.

## Feedback, loading and progress

| Component / purpose | Variants / states | Use / accessibility / themes | Existing consumers and limits |
| --- | --- | --- | --- |
| Notice | info/success/warning/error; optional title/action; live off(default)/polite/assertive | Visible icon/text distinguishes meaning. Static guidance does not need an announcement; dynamic recoverable errors use alert, low-risk acknowledgment uses status. Never show sensitive internals. All tones use independent status tokens. | LoadState and login global failure. Existing business-specific notices keep their meaning pending later page review; no blanket remapping of server errors. |
| StatusMessage | Persistent polite status, atomic text | Mount an empty live region then update text for low-risk save confirmation. Do not auto-dismiss critical actions/errors. Neutral supporting text in both themes. | Reference only; existing reader/admin save regions remain with their owners. No toast queue, timeout or new service. |
| LoadingState | Reserved160px loading area; spinner plus status label | Visible label persists with reduced motion; spinner is decorative. Customize label to the operation. Do not replace whole content for a tiny local action. | LoadState; reference. Not a Suspense/data orchestration abstraction. |
| Skeleton |1–8 decorative lines, reserved minimum120px, named status | Use only when approximate content shape is known. It does not shimmer, avoiding unnecessary motion. Do not announce every decorative bar. | Reference only; no wholesale page data-state replacement. |
| LoadState | Error first → Notice with explicit retry; else busy → LoadingState; else null | Preserves prior branch precedence, error detail, retry callback and data owner. Error is not empty data. | All existing useRemote consumers. `useRemote` fetch/lifecycle/reload/setData unchanged, including pre-existing effect lint. |
| EmptyState | empty/search/unavailable/restricted; caller title/description/action | Labeled section, decorative illustration; visible wording must identify the cause and real available action. No error variant: use LoadState/Notice for retrieval failure. Neutral in both themes. | Existing library/notes/catalog/results/admin consumers retain supplied copy. Reference demonstrates distinct kinds. Existing notes search wording is not fully migrated in Phase 2. |
| ProgressBar | primary(compatibility)/learning=Sage, action=Slate, success/warning/danger=status; finite0–100 | role progressbar, named label, aria-valuemin/max/now and valueText. Bar width and exposed value share the clamp. Unknown/insufficient evidence retains explicit words; never infer completion. Visible page value remains alongside it. | LearningProgress, PersonalResults and result topic bars now have contextual labels; assessment answer count uses action tone. Values/calculations unchanged. Compatibility default label remains for other consumers. No progress ring or fabricated milestone added. |

See [FEEDBACK_PATTERNS](FEEDBACK_PATTERNS.md) for presentation decisions and [UX_WRITING](UX_WRITING.md) for Persian patterns. Appropriate: persistent fetch error with the existing reload callback. Misuse: disappearing payment failure, error disguised as an empty list, a fake retry, success color on a recommendation, or 0% implying assessed failure when the authoritative state says insufficient evidence.

## Dialogs

Dialog uses native `dialog.showModal()` with a heading/description association, top-layer backdrop, bounded viewport scrolling, body scroll lock and return to the previously focused connected element. Initial focus is a supplied ref, a `data-dialog-initial` control, or the dialog itself. Explicit Tab/Shift+Tab boundary handling supplements native modal containment. Escape calls onClose only when dismissible; backdrop clicks do not dismiss. The parent owns `open` and must update it from onClose. Supply at least one deliberate completion/exit action. Do not call dialog.close externally or introduce nested modals; stacked-dialog scroll ownership is not supported or tested.

ConfirmationDialog adds safe initial cancel focus, explicit confirmLabel, secondary cancel and optional destructive action. Busy disables both actions and Escape until the caller resolves its existing operation. No deletion/request logic is built in. Do not confirm on Enter globally, on backdrop, or merely because a timeout elapsed. Both themes use existing overlay/elevation/radius tokens.

Current consumers: the local reference only. Existing note/draft/delete native confirm and beforeunload protections remain unchanged. Their business-specific dismissal requirements were deliberately not migrated. This delivers the shared primitive without silently changing protected operations. Automated Chrome keyboard/focus checks are evidence of representative behavior, not a completed screen-reader or cross-browser certification.

## Local reference and evidence

Run `npm.cmd run dev -- --host 127.0.0.1` and open [local reference](http://localhost:5173/cent-s/component-reference.html). This standalone Vite HTML entry imports the real primitives and existing theme/font/CSS files; it is not an App route or public asset. It is not a build input, and the React mount also requires `import.meta.env.DEV`. Production verification checks output absence of the reference HTML, module and distinctive content. No Storybook, package changes, backend fixture dependency or production mock route.

Run `node tests/browser/check-components.mjs` for focused rendered interactions, actual screenshots, contrast and representative reflow. Evidence is in [phase-2](evidence/phase-2/); [visual index](evidence/phase-2/index.html) links component crops, dialogs and actual before/after pages with their data classifications. Use AppearanceControl for light/dark/system. All example numbers and messages in the reference are illustrative, including explicit injected error/retry and confirmation examples.

Known limits: representative Chrome automation only; no full assistive-technology/all-browser audit, page-wide validation migration, every legacy loading width, dynamic field focus-on-submit policy or universal nested-control guard. Existing tiny metadata, reader toolbar density, original study-return synchronization, math: codes, real OAuth and external payments remain deferred.
