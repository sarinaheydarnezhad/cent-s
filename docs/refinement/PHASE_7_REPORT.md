# Phase 7 — Commerce frontend

The existing Phase 7 frontend work is complete locally for visual review. This continuation resumes that delivery against the supplied [Phase 7A API handoff](PHASE_7_COMMERCE_API_HANDOFF.md). The frontend baseline is Phase 6 commit `8cc8e64`. Earlier limitations remain unless explicitly resolved below. No commit, push, deployment or real payment was performed. Phase 8 administration has not started.

## Implemented

- **Catalog and resource details:** separate individual-training and subscription views using actual active catalog products. Title-based covers reuse the reading presentation without requesting protected pages. Existing curriculum/course/chapter/topic links remain available. Resource details show published lessons, subscription inclusion, available individual offers, exact rial prices, existing ownership and current reading access separately.
- **Subscription plans:** actual catalog titles, durations and prices; included-training and simulator benefits; explicit time-limited access and manual renewal wording. No invented tiers, discounts, automatic billing or document-level products. The account page lists current, upcoming and expired non-revoked subscription intervals; permanent training purchases remain distinct.
- **Checkout:** account/product-scoped UUID persisted before the first request, retained through errors and reloads, with owner-history recovery using the exact server `productId`/`requestId`. Explicit continuation can select an older pending order. A synchronous guard prevents duplicate submissions while busy. Only identifiers are submitted; the server controls the price and redirect. Pending recovery shows the saved order amount and provider rather than today's catalog price/environment. An order already confirmed paid takes the user to its result instead of offering payment again.
- **Payment result:** authenticate, find the order in owner history, ask the server to verify, then refresh order history and the current library. `PAID` history is authoritative for settlement; reading actions require current server library permission. Redirect flags, URL naming and local storage grant no payment/access state. `PENDING` remains unconfirmed, with explicit status checking and expandable same-order continuation. It is never relabeled as a definitive cancellation or failed payment.
- **Recovery:** safe Persian messages for unavailable/configuration/provider/ownership/authentication errors. `Retry-After` disables the relevant payment/result retry control for the advertised interval. Missing retry storage prevents the initial checkout request. A changed session cannot apply an old payment result/redirect. Current library state refreshes on window focus and entitlement boundaries.
- **Account orders:** retain the existing identity panel and add scannable owner orders, explicit rial amounts, payment badges, order/provider/reference details and existing result links. Payment history and current reading permission have separate labels.

`CommerceUI`, the commerce helpers and scoped `commerce.css` reuse the existing semantic tokens, ResourceCover, Badge, Button, FilterGroup, Skeleton, Notice and EmptyState. The approved flat logo, Slate/Sage roles, Persian interface and persisted single-click Light/Dark control remain. Training prices and titles in screenshots are local fixtures, including earlier regression fixtures still present in this isolated preview; they are not production offers.

## Verification

| Check | Result |
| --- | --- |
| Unit tests | **213 passed**, including commerce retry/trust and presentation cases; saved machine-readable run |
| TypeScript and builds | Final `tsc -b`, `/cent-s/` production build and compiled-root build passed; both outputs independently checked for commerce and delivery boundaries |
| Connected commerce | **6 groups / 60 responsive observations per environment**, development and compiled root: real local mock purchase, server amount/history fields, single busy submission, owned-resource navigation, actual document access, concurrent same-key purchase with one entitlement, stacked renewal, owner isolation, plus labeled injected states |
| Additional recovery | **7 groups per environment**: stable retry UUID, 429 cooldowns, stored-provider/amount recovery, lost browser response after actual mock completion with exactly one order, unavailable/empty/foreign history and storage denial; fault responses are explicitly injected |
| Theme/accessibility sampling | **12 route/theme checks and 810 rendered text/gradient pairs per environment**, each at least 4.5:1; RTL, 320/390/768/844/1440px representative layouts, 44px enabled sampled actions, visible focus and reduced motion |
| Authentication regression | **9 authorization-code + 16 GIS scenarios in development and compiled root**; synthetic provider responses, including preserved purchase return destinations. Initial development failures are retained alongside final passing records |
| Reading regression | Existing connected notes and exact study-return checks passed in development; their saved result files were relocated from the npm-prefix-relative output directory into this evidence folder without changing assertions |
| Lint | Focused changed presentation/helpers/browser checks clean. Broader `src` has **six existing hook errors**: CentUI 1, PracticePages 1, StudyReader 4; those files match HEAD |
| Boundaries | **92 tracked product/public/dependency/build files** outside the four integration edits match Phase 6 HEAD. Cent HTTP/session/error/request behavior is unchanged; its changes are response typings only. Routing, scoring, reader, assessment, administration and authentication sources unchanged |

Final screenshot review also corrected mobile order headings: the status badge moves below the title instead of squeezing it into a narrow column. After that CSS-only change, both builds were refreshed and **20 account layouts** were checked across five widths, both themes and both environments, including title width, separate badge row and overflow. [Final review verification](evidence/phase-7/final-review-verification.json) also checks saved passing results, focused lint and local report/gallery links.

Primary records: [unit tests](evidence/phase-7/unit-tests.json), [development commerce](evidence/phase-7/commerce-development-result.json), [root commerce](evidence/phase-7/commerce-root-result.json), [development recovery](evidence/phase-7/commerce-states-development-result.json), [root recovery](evidence/phase-7/commerce-states-root-result.json), [development accessibility](evidence/phase-7/commerce-accessibility-development-result.json), [root accessibility](evidence/phase-7/commerce-accessibility-root-result.json), [delivery verification](evidence/phase-7/delivery-verification.json), [notes](evidence/phase-7/consecutive-notes-result.json) and [study return](evidence/phase-7/study-return-result.json). Build, lint and authentication records accompany them.

## Environment and trust boundaries

Commerce exercises use the already-running corrected Cent preview at `http://127.0.0.1:5117/api/cent/v1`, with its isolated SQLite data under `.preview-artifacts/phase7-backend`, DEVELOPMENT_MOCK payments and disposable local accounts/products. Development runs at `http://127.0.0.1:5173/cent-s`; compiled root at `http://127.0.0.1:5187`. The harness adapts only the loopback frontend origin in the preview's checkout redirect because that host has a fixed original localhost return. It does not fabricate a paid response or entitlement.

Actual mock completion, owner-history fields, same-key concurrency, exactly one entitlement, renewal intervals and denied foreign verification/document access are connected checks. Pending history, callback spoof flags, uncertain gateway errors, 429, expired subscription presentation, unavailable permissions/catalog and blocked browser storage are deliberately injected. The lost-response case lets the real preview finish a mock purchase and then drops only the browser's response. It verifies recovery against the actual saved order.

This continuation made no backend source/configuration/schema changes and ran no backend source build/tests. Phase 7A backend findings and limits remain owned by the supplied handoff. Frontend response typings consume its additive order/checkout fields; no server endpoint, authentication mechanism, entitlement or monetary rule was added.

## Review evidence

[Seven-image AFTER gallery](evidence/phase-7/index.html): catalog Light desktop; resource detail Dark mobile; subscription plans Dark desktop; checkout Light mobile; confirmed local mock payment Light desktop; actual owner orders Dark mobile; explicitly injected pending recovery Light mobile. All are viewport captures. The order/recovery captures scroll to the relevant controls; [capture verification](evidence/phase-7/review-capture-verification.json) records this correction. Existing authentication regression captures are ancillary and are not commerce gallery images. No BEFORE captures or comparison pairs.

## Remaining limits

- No live/sandbox provider transaction, SQL Server concurrency acceptance, merchant configuration, production hosting/CORS, provider reconciliation, refunds or real expired-entitlement lifecycle verification. SQLite mock success does not establish those behaviors. The Phase 7A handoff retains its distributed external-request/crash-window caveat.
- Server history is limited to its latest 200 owner orders; no pagination or dedicated order-detail endpoint exists. Recovery cannot invent an order outside the available history. New renewals are explicit purchases after the prior paid retry identity is cleared through trusted result checking.
- The frontend requires usable local storage for a retry identity. Same-tab double submission and server same-key concurrency are checked; independent simultaneous tabs can start separate intentional UUIDs and are not claimed to be a cross-tab lock.
- A subscription expiry display is an injected presentation case. Entitlement timers/focus refresh use current server library data; they do not replace server access enforcement. No optimistic access grant or public original-PDF/thumbnail request was introduced.
- Local desktop Chromium only; no full WCAG certification, assistive-technology, physical-device or cross-browser acceptance. Existing authored lint debt and unrelated earlier limitations remain.
- Discounts, carts, automatic renewal, refunds, document-specific pricing, terminal payment statuses, reconciliation jobs and pagination remain separate product/backend work. Administration remains Phase 8.

Phase 7 is ready for owner visual review. Phase 8 requires separate authorization; this delivery does not advance to it.
