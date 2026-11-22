# Current phase — Phase 7 commerce frontend

The resumed Phase 7 commerce frontend is implemented locally against the supplied Phase 7A handoff and is ready for owner visual review. Phase 6 source and earlier documented limitations are retained. No commit, push, deployment or real payment. Phase 8 administration has not started. This current record supersedes historical phase-status statements below.

See [Phase 7 report](PHASE_7_REPORT.md), [seven AFTER-only review images](evidence/phase-7/index.html) and [Phase 7A API handoff](PHASE_7_COMMERCE_API_HANDOFF.md).

Checkout has synchronous duplicate-submit protection and busy feedback. Retry-After controls 429 cooldowns. PENDING means unconfirmed; only trusted PAID history confirms settlement, and current library permission controls study actions. Configuration/uncertain gateway failures retain the same request identity and safe Persian recovery text; blocked storage stops before submission.

---

## Preserved earlier records

# Current phase — Phase 6 library, notes and reading

Phase 5 received explicit owner visual approval and is closed with its documented limitations retained. Phase 6 is implemented locally for explicit visual approval. Frontend scope only; no commit, push or deployment. Phase 7 has not started. This current record supersedes historical phase-status statements below.

See [Phase 6 report](PHASE_6_REPORT.md) and [seven AFTER-only review images](evidence/phase-6/index.html).

Known-shape loads use existing named Skeleton. Fetch failures retain the existing inline LoadState/Notice and real reload callback. The note editor preserves actual operation status: draft/saving is neutral; real persisted/deleted acknowledgment is polite; failure detail is an inline alert beside the operation, with the draft retained. No new toast, modal owner, automatic mutation retry or fake success. Existing native deletion/draft confirmations remain intact.

---

## Preserved earlier records

# Current phase - Phase 5 assessment refinement

The owner explicitly approved Phase 4.1 and authorized Phase 5. Phases 4 and 4.1 are closed with every documented limitation retained. Phase 5 is frontend-only and delivered for explicit visual approval; Phase 6 has not started. No commit, push or deployment. This record supersedes earlier phase-status statements below; historical reports and evidence remain intact.

See [Phase 5 report](PHASE_5_REPORT.md) and [eight AFTER-only review images](evidence/phase-5/index.html).

Phase 5 uses named static Skeletons for scoped remote loads, existing LoadState for actual errors/retry, and one Notice alert per start/submission failure. Submission errors retain original server detail and saved answers; no duplicate toast or new confirmation/auto-submit behavior. Unassessed and insufficient evidence have explicit wording/dashed tracks. Failed guidance preserves result access. Unknown topic mappings are withheld from student text/markup and recorded technically.

---

## Preserved earlier records

# Current phase — Phase 4.1 visual refinement

Phase 4 required further visual refinement and is not yet visually approved. Phase 4.1 is frontend-only and awaits explicit owner visual approval. Phase 5 has not started. No commit, push or deployment. This current record supersedes earlier phase-status statements below; the earlier reports and their technical limitations remain historical evidence.

See [Phase 4.1 report](PHASE_4_1_REPORT.md) and the [six AFTER-only review images](evidence/phase-4-1/index.html).

Phase 4.1 uses named, static content-shaped Skeletons while each independent dashboard stream loads. Errors keep the existing LoadState alert/detail/retry and do not become empty data. Shared-data siblings point to the owning retry rather than duplicating alerts. Unmapped topics show understandable Persian guidance and preserve original codes/wording in native details; curriculum failures retain their real retry. New learners get one prominent diagnostic CTA and compact secondary summaries; absent activity creates no empty timeline.

---

## Preserved earlier records

# Current phase - Phase 4 student experience

The owner visually approved Phases 3 and 3.1 and closed both with their documented technical limitations retained. Phase 4 is implemented for explicit visual approval. Its authorized scope is: student dashboard, authenticated navigation and existing non-transactional account presentation. Phase 5 is not authorized. Starting checkout: clean local main at 1ed76ee, committed by the owner before this task.

The approved Phase 3.1 Slate/Sage direction, restrained semantic gradients, flat logo and persisted single-click Light/Dark control remain authoritative. Preserve scoring, mastery calculations, recommendation ordering, routes, permissions, session/authentication and reader persistence. The existing study-return synchronization limitation remains Phase 6. Assessment/results, PDF reader, commerce and administration are not redesigned. No commit, push or deployment.

Current implementation and verification are recorded in [Phase 4 report](PHASE_4_REPORT.md). Historical phase records below retain their original context; earlier pending-approval statements are superseded by this explicit owner approval.

---

Phase 4 keeps learning data streams independently recoverable: library, mastery, latest attempt/outcome and curriculum. Missing results/history have real start/library/catalog actions. Unassessed mastery has an explicit text equivalent rather than a fake achievement. Errors use LoadState's persistent alert and actual retry. Recommendation metadata failure preserves original codes and exposes the failed lookup and retry; it does not guess labels or conceal mapping problems. Failed/incomplete guidance is identified. Empty library resources, loading, failure and recovered states are distinct. Existing account orders/membership feedback remains Phase 7.

# Phase 3 public/auth application

The owner visually approved Phase 2 and authorized Phase 3 public/auth presentation only. Phase 2 is closed with all documented technical limitations retained. Phase 3 is implemented and delivered for explicit visual approval. Phase 4 has not begun and requires separate authorization.

Existing authentication global failures remain a persistent Notice(error,assertive) beside the password action and preserve entered values. Native required/email/password validation and associated shared hints remain; no new validation engine or guessed field-error mapping. Mode change clears the previous auth error through its existing handler. Google lifecycle/retry/failure UI is unchanged and provider-owned.

Callback reuses Notice/LoadingState and its existing explicit return-to-login recovery. Resource failures retain LoadState and the real reload callback; injected503 confirms no fake empty collection.404 has a real home link. No toast queue, modal error, fake reset action, automatic request replay or discarded draft. Actual/injected/synthetic evidence is labeled in the Phase 3index.

---

## Preserved earlier phase records

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
