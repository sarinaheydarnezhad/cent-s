# Feedback presentation framework — implemented Phase 2 foundations

Feedback should explain the event, its consequence and the available next step without interrupting unrelated work. Severity alone does not choose a modal. Determine context, urgency, persistence, ability to continue and whether a deliberate consequential decision is required.

| Situation | Presentation / persistence | Actual primitive / interaction | Avoid |
| --- | --- | --- | --- |
| Field-specific validation | Beside the affected field until corrected | InputField/TextareaField/SelectField/CheckField error; merged aria-describedby and aria-invalid; preserve native validation and actual constraints | Global modal, placeholder-only error, assigning a network failure to a guessed field |
| Persistent recoverable fetch failure | Contextual inline notice, visible until resolved | LoadState(error) uses Notice(error, assertive) plus existing reload callback | Empty list fallback, disappearing-only error, duplicating the same alert elsewhere |
| Operation failure with unchanged work | Inline near the operation; keep useful detail and real recovery | Notice with action where an actual handler exists; preserve entered data and caller state | Losing draft content, automatic replay of protected POSTs, fake retry |
| Low-risk acknowledgment | Polite status near the affected content | StatusMessage or existing owned save status; persistent until next update, no timer infrastructure | Blocking success modal or repeated assertive announcement |
| Static explanatory information | Contextual notice with live off | Notice info/warning with visible icon and text | Announcing static page content as a new urgent alert |
| Learning recommendation/guidance | Educational surface, not an operation status | Card recommendation/learning; Badge learning/recommendation; real supplied recommendation | Calling it success, false completion, fabricated personalized advice |
| Consequential/destructive decision | Explicit confirmation before operation | ConfirmationDialog: safe cancel focus, specific confirm label, Escape guarded while busy | Destructive styling for ordinary actions, backdrop confirmation, weakening current native confirms |
| Genuinely blocking decision | Named dialog with deliberate available decision | Dialog with caller-owned dismissible policy and explicit action | Every network error as modal, a dialog with no way to proceed or exit |
| Full content load | Reserved loading state or content-shaped skeleton | LoadingState/LoadState; Skeleton when shape is known; reduced-motion label retained | Unannounced spinner only, fake percent, unnecessary layout collapse |
| No records / no search match | Distinct visible empty-state wording | EmptyState empty/search, supplied truthful title/body | A service error disguised as no records |
| Unavailable/restricted content | Clear availability/access wording and only real actions | EmptyState unavailable/restricted, or existing dedicated access state | Invented access changes, implying payment succeeded without server evidence |
| Payment/session/permission result | Keep existing authoritative context and recovery | Existing result/protected-route owners remain; shared style only where applied | Transient-only critical failure, invented financial status, exposing internal auth/token data |

## Announcement and action rules

Notice defaults to no live role. Use live=polite for low urgency dynamic updates; live=assertive produces role=alert for dynamic actionable failure. Do not add a second parent alert around the same text. StatusMessage is an atomic polite region; keep it mounted when practical and update its text. Field errors are associated with controls rather than announcing every field simultaneously. Comprehensive field-error summary/focus-on-submit policies are deferred to contextual form phases.

Retry always invokes a caller-supplied, real retry. Primitives never fetch, replay requests, choose API routes or dismiss consequential errors on a timer. Unknown server error detail is preserved by LoadState/login as before; Phase 2 does not invent safe business-code translations. Later page work must inspect authoritative error contracts before replacing raw details. No logging or additional persistence of sensitive response bodies was introduced.

Slate denotes action/selection. Brand Sage, learning, recommendation, success, warning, error and information have distinct semantic names even when some approved palette values coincide. Icons, visible labels, native invalid/pressed/progress state and descriptive wording provide meaning beyond color.

## Migration actually performed

LoadState now composes Notice, Button and LoadingState without changing useRemote, error precedence or reload behavior. Login composes native shared fields, Button and Notice while preserving submission guard, constraint values and Google lifecycle. Login/catalog modes use FilterGroup with aria-pressed. Dashboard/result next-step recommendations use recommendation Card. Existing business-specific reader/admin notices, native note/draft/delete confirmation and protected-route branches remain with their current owners. There is no new toast queue, custom popup service or global dialog store.

## Reusable Persian patterns

Use `دوباره تلاش کن`, `ادامه بده`, `ذخیره شد`, `نتونستیم اطلاعات رو بارگذاری کنیم`, and `هنوز چیزی اینجا نیست` where accurate. State a useful constraint plainly, preserve legal/formal content and scientific meaning, and never blame the learner. See [UX_WRITING](UX_WRITING.md) for action, cancel, loading, empty and validation examples.

## Evidence limits

The component reference explicitly labels its data, injected failures and preview-only actions. Keyboard, dialog focus, status semantics and representative contrasts are verified by [component browser checks](../../tests/browser/check-components.mjs) and focused unit tests. Actual application integrations and full test outcomes are in [PHASE_2_REPORT](PHASE_2_REPORT.md). No claim of full WCAG, real Google OAuth or external payment verification follows from this framework.
