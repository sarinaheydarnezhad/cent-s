# Prioritized findings

Evidence categories: **Observed** = source or rendered fact with location; **Hypothesis** = design judgment needing later validation; **Unverified** = unavailable runtime behavior. No listed issue was fixed in Phase 0.

| ID / priority | Finding and evidence | Category | Proposed phase / protection |
| --- | --- | --- | --- |
| B01 / high | Brand.tsx, index.html, DashboardLayout, login/callback/account/admin text still Cent/Cent-s; favicon C | Observed source/render | 1; product labels/assets only, exam CEnT-S retained |
| B02 / high | No theme resolver/provider/control/persistence or dark CSS; computed system light/dark identical | Observed source/runtime | 1; no session/backend dependency |
| B03 / high | Five core brand values absent as coherent palette; 333 literal color occurrences and 21 gradients across CSS | Observed source; counts include inactive code | 1 tokens, 2–8 migration |
| B04 / medium | PNG mark available, no approved vector. PDF pages 9/22 explicitly call reconstruction conceptual | Observed source asset review | 1 proposed reconstruction needs visual approval |
| A01 / high | Mobile dashboard open/close icon buttons lack names; public menu lacks aria-expanded/controls; offscreen sidebar not inert | Observed source; private keyboard impact unverified | 2 shell semantics; role/session logic preserved |
| A02 / high | Answer buttons have selected class but no programmatic selected state/radio semantics; question nav relies on visual styles | Observed source | 5; preserve answer/timer/state rules |
| A03 / high | Reader canvas only exposes page label, no accessible lesson text equivalent for image resources | Observed source; assistive-tech runtime unverified | 6; remediation may require separate protected-resource/content proposal |
| A04 / medium | ProgressBar has label but no progress role/min/max/current; visible data values elsewhere partly compensate | Observed source | 2; retain calculations |
| A05 / medium | Focus green vs white 2.89:1; candidate warning/error surface text 3.93/4.37:1 | Calculated source pairs; actual full state audit pending | 1–2; refine proposed support colors |
| A06 / medium | Reader controls 32px, note pins 26px; icon buttons not consistently 44px | Observed CSS, active targets not rendered | 2/6; evaluate exceptions/spacing, not blanket compliance assertion |
| A07 / medium | Wrapping labels/autofill/LTR present, but no consistent aria-invalid/describedby field-error pattern; button tabs lack selected semantics | Observed source | 2–3/8 |
| V01 / medium | Multiple late CSS overrides; 46px/13px shared buttons, 18px default card, assorted ad hoc spacing/radii/strokes | Observed source | 1–2; avoid broad rewrite/formatting |
| V02 / medium | Home graphic precedes headline/CTA on mobile and floating cards clip at 320; no page overflow | Observed screenshot baseline-home-320 | 3; simplify eye flow |
| V03 / medium | Login promotional panel precedes form on mobile; large decorative area on desktop | Observed screenshot | 3; Hypothesis: reduces task focus, validate after refinement |
| V04 / medium | /package shows two near-identical backend failure panels (catalog + curriculum) | Observed unmocked screenshot | 3/7; shared error hierarchy without changing fetch contracts |
| V05 / low | Course error state has no page heading; 404 outside shared shell; larger hero/store headings than brand proposal | Observed render/source | 3; prioritize clarity/recovery |
| U01 / medium | Mixed تو/شما, را/رو, تعیین سطح/ارزیابی, پروفایل/حساب; 404 mentions MVP | Observed text inventory | All phases scoped to changed surfaces |
| U02 / medium | Source/API implementation details appear in student assessment/checkout/admin descriptions | Observed source | 3–8; explain product meaning instead |
| U03 / medium | Notes search no-match uses empty-notebook copy | Observed source | 4; distinguish actual state |
| C01 / high | Result API has paid:boolean; account presents all non-PAID as pending | Observed source/API type, server semantics unverified | 7; no invented success/failure states; API expansion separate approval |
| C02 / high | Checkout status absent/error renders test-gateway wording though mode is unknown; pay remains disabled without status | Observed source | 7; truthful unknown/error presentation, payment logic unchanged |
| C03 / medium | Payment return's useRemote verification effect is mounted before its guest redirect; local proxy logged a request for the synthetic unknown order before login | Observed source/local proxy; backend refused connection | Separate request-ordering review if needed; server must enforce auth; no demonstrated data disclosure or real order mutation |
| E01 / high | Clear answer retains null key, answered progress counts Object.keys; possible inflated progress display | Observed code path; reproduction requires backend or isolated fixture | 5 proposal; no scoring/state change in branding |
| E02 / high | No submit confirmation; expiry disables submit and offers fresh attempt | Observed source; end-to-end impact unverified | Separate protected behavior approval before altering |
| R01 / high | Backend preview absent on 5108; no backend checkout in repository | Observed connection refusal/repo | Blocks actual private flows and remaining local integration suites |
| R02 / medium | Global eslint . sees generated PDF.js fallback JS after predev/prebuild; long-running lint stopped after >10 minutes without result | Observed scope/runtime; cause is hypothesis | Document baseline; scoped authored lint separately; config fix separate review |
| P01 / low | Eager route imports; existing admin PDF dynamic chunk + worker are large build assets | Observed source/build | Preserve PDF lazy loading; route split only after measurements/approval |

## Positive foundations to preserve

Strict TS/build, 61 passing unit tests, nine passing isolated auth scenarios, server-authoritative data/payment success, no mock catalog fallback, local Persian font, existing Lucide set, typed API boundaries, guarded role/session routes, pre-mount callback cleanup, reduced-motion CSS, retryable feedback, note drafts/revisions, source/image reader distinction, visible mastery evidence/coverage, currency formatting and base-path compatibility.

## Hypotheses, not measured user research

Calmer single-primary-action hierarchy, fewer containers, a smaller home decoration, earlier mobile login form and less repetitive notices should improve scanability. No usability study, conversion measurement, audience interview or competitive validation was conducted. Dashboard eye-flow assessment is provisional because real private pages were not rendered.
