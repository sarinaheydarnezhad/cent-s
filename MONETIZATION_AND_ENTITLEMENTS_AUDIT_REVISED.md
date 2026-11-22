# Monetization and entitlements audit — Revised scope

> **Revision note (2026-11-20):** This document supersedes conflicting earlier scope statements. The approved near-term model is one-time individual-subject purchases and customizable/recommended multi-subject bundles, with progressive discounts from two subjects and 12-month access. Google sign-in changes and enhanced access-sharing controls (device limits, concurrent-study limits, device replacement, nontransferability enforcement, and watermark expansion) are explicitly deferred. Existing authentication, session, and watermark behavior must remain unchanged in the current roadmap.

## Current product decisions and deferred scope

- **In scope:** individual subject products; user-selected bundles; degree/goal-based recommended bundles; server-authoritative progressive discounts beginning at two distinct subjects; one-time payment; 12-month access for each newly purchased subject; preservation of historical purchase terms.
- **Deferred:** Google sign-in/account-transition work; two-device registration; single concurrent study session; device replacement/recovery policy; nontransferability enforcement; watermark expansion.
- **Protected:** existing authentication and session behavior, existing watermark behavior, user identities, orders, grants, payment evidence, and historical access. Do not refactor these as incidental work.
- **Still undecided:** base prices, discount percentages and rounding, degree/goal mappings, included practice/mock-exam benefits, calendar-month boundary rules, renewal/overlap behavior, and Reading/legacy purchase transition policy.

Audit date: 2026-11-20. **The user's mandatory model is the product baseline.** Existing code is evidence of current behavior, not an alternative product requirement. No prices, catalog items, orders, grants, account modes or device records were changed or created.

## Fixed requirement and status

| Required capability | Classification | Verified current implementation / gap |
| --- | --- | --- |
| One-time purchase of an individual subject | Requires refactoring | A TRAINING product covers one training; curriculum imports create a training per subject, but arbitrary trainings are also sellable. Current grant is permanent and is not a 12-month subject purchase. |
| Custom selection of subjects | Missing | Checkout accepts one ProductId and RequestId. No subject set, cart/bundle selection, quote or order lines. Multiple independent checkouts do not constitute one bundle. |
| Progressive discount beginning at two subjects | Missing | No tier rules, discount calculation, rounding policy or snapshotted price-policy revision. Prices are server-side flat product amounts. Rates are not supplied and must not be invented. |
| Recommended bundles by degree/study goal | Missing | No degree/goal catalog or recommended subject-set mapping. Generic learning recommendations are topic advice, not commercial bundles. |
| 12-month access for every new purchase | Requires refactoring | Product constraint forces TRAINING.DurationDays=null. Confirmation grants TRAINING.ExpiresAt=null; only SUBSCRIPTION has a day duration. This is not an acceptable implementation of the requirement. |
| Google-based accounts | Deferred | Existing authentication behavior is protected. No Google-only transition, provider-mode change, or account migration is in the current scope. |
| Maximum two registered devices | Deferred | No device-registration implementation is authorized in the current roadmap. Preserve current session behavior. |
| One concurrent study session | Deferred | No account-level study lease or concurrency enforcement is authorized in the current roadmap. |
| Controlled device changes | Deferred | Device replacement, cooldown, recovery, and administrative exception workflows are outside current scope. |
| Nontransferable access | Deferred | Do not add account-sharing enforcement in this roadmap. Preserve existing account-scoped resource checks. |
| Content watermark | Existing behavior protected; enhancements deferred | Preserve current watermark implementation. Do not expand watermarking or claim screenshot-proof protection. |
| Server-authoritative pricing | Already implemented | PriceRial and order.AmountRial; client submits identifiers, never trusted amount. Preserve for bundle quotes. |
| Verified, idempotent payment and grant creation | Already implemented | User/request uniqueness, stored authority/provider, transaction, unique provider/reference and one grant per order. New multi-subject settlement must preserve these guarantees. |
| Expiration-aware resource checks | Partially implemented | CanRead evaluates start/end/revocation on each request; schema supports ExpiresAt, but normal subject grants are never assigned an end. |
| Owner purchase/access history | Partially implemented | Snapshotted order and current library/grants exist; latest 200 owner orders, 500 admin orders. No line-item scope, bundle policy or exam/content coverage snapshot. |

Classification describes source, not production certification. Primary evidence: `B/Cent.Module/{Entities.cs,CentDbContext.cs,CentAdmin.cs,CentPayments.cs,CentContent.cs,CentModule.cs,CentGoogleAuth.cs,CentGoogleGisAuth.cs}` and frontend `src/{services/cent.ts,services/commerce.ts,pages/CommercePages.tsx,components/CommerceUI.tsx,pages/CourseCatalog.tsx}`. `B` = `D:/Lerona/Backend/backend`.

## Catalog, prices and checkout

`CentProduct` has Kind, optional TrainingId, PriceRial, optional DurationDays and Active. Its database constraint permits only a permanent TRAINING or a 1–366-day SUBSCRIPTION. The catalog returns published trainings and active products. There is no model of a subject SKU with defined exam/content scope. No production prices or actual customer purchases were queried; fixture prices in old screenshots are not commercial decisions.

`CheckoutInput(ProductId, RequestId)` creates a single order snapshot: title, type, training, duration, amount and provider. Initiation and verification use the saved environment and rial amount. The browser persists an account/product UUID before POST and recovers the same pending order after lost responses. Verification result and current reading permission are correctly separated. Preserve this work.

Financial values are integer IRR. Some existing helpers display tomans, while the newer commerce components label rial amounts; preserve explicit field units and audit display surfaces during later changes. Bundle prices must be quoted and recomputed/validated on the server, with a stable selected-subject set, tier/policy revision, list total, discount, final total and validity window. The exact discount percentages, tier monotonicity, taxes and rounding await product decisions; no price table is proposed here.

One bundle should settle once and grant its subject set atomically. **Do not create several gateway payments to simulate a bundle.** The existing unique Entitlement.OrderId means simply inserting one grant per selected subject would fail; use reviewed order lines/grant items or another explicitly designed aggregate. Idempotency must bind the request to the immutable quote/subject set so a retry cannot change price or scope.

## Duration and renewal gap

Confirmation in `CentPayments.cs` sets a training grant to no expiry; subscription renewals stack at the latest end and add days. The required model is a one-time purchase granting the selected subjects for **12 months**, without automatic billing. A 365-day subscription or renaming the subscription tab does not satisfy it.

Define calendar-month arithmetic and the end-exclusive boundary, start event (recommended: verified payment), renewal/overlap behavior and leap-day handling. Proposed default for review: add twelve calendar months to PaidAt in UTC, with documented month-end handling; show the precise start/end to the user. These details require approval, not replacement of the already fixed 12-month requirement.

`CanRead` can already enforce finite grants. However, both initial checkout and authority resumption reject any non-revoked TRAINING ownership, without considering expiry. After introducing finite subject grants, that check would incorrectly block repurchase after expiration. `ownsTraining()` in `services/commerce.ts` recognizes only null-expiry permanent grants. Catalog, account labels, expiry refresh, renewal eligibility and server guards must change together.

Simulator Start/Submit currently require an active subscription, regardless of which subjects were bought. Paid subject access does not gate general diagnostic/practice questions. This conflicts with replacing the sales model unless explicit benefits define what subject purchases grant: lessons, practice, assessment review and full simulator eligibility. Decide those benefit boundaries before implementation; do not silently remove free diagnostic access or assume an all-subject requirement.

## Devices, sessions and identity — deferred

All device-registration, study-lease, controlled replacement, nontransferability-enforcement, and Google-account-transition recommendations are **not implementation requirements for the current roadmap**. Existing authentication, sessions, and watermark behavior must remain unchanged. Do not create device tables, leases, new identity flows, fingerprinting, or account migrations in Phases 1–6. A future proposal requires a separate user decision and scope approval.

The server creates a new seven-day CentSession on login without enforcing a device count or revoking a previous study session. Session expiry is distinct from purchase expiry. Authenticated access alone cannot implement a two-device registry or one active study session.

`CentAdmission` does limit the module to four concurrent HTTP requests per host, and page/auth endpoints have IP-based rate limits. Those protect service capacity; they are not per-user device registration or a single concurrent study session.

Recommended extension: a server-side two-device registry tied to Google/Cent account identity, plus an atomic account-level study lease checked by protected content and relevant assessment endpoints. The lease needs expiry/heartbeat, network-recovery rules, deliberate transfer, multi-tab behavior and revocation across API instances. Keep public browsing/payment recovery available under a defined policy. Do not equate one study session with one HTTP request or invalidate a paid order because a study lease ends.

Device proof, replacement frequency/cooldown, support exceptions, lost-device recovery and privacy/retention are unresolved details. No fingerprinting library or intrusive identification is approved. Nontransferability requires policy and practical enforcement; neither Google login nor client-rendered watermarking guarantees zero copying or sharing.

Existing Google APIs validate identity and prevent accidental account linking by email. If “Google-based accounts” means Google-only customer entry, password users need an explicit account-preserving transition; never link based on matching email alone or recreate a customer under another user ID. Administrative/bootstrap recovery must be planned separately. Real production Google, live gateway and multi-instance SQL Server behavior are unverified.

## Reading, exam versions and existing purchases

| Situation | Required safe handling / decision |
| --- | --- |
| Existing individual subject purchase | Keep order/training/user IDs and proof of purchase. Identify what was actually sold before any conversion. Do not silently shorten a null-expiry grant. |
| Claimed historical bundle | No bundle structure exists in the inspected code. Any external/manual bundles need authorized reconciliation; absence in this code does not prove no customer bought one. |
| New Reading subject | Create explicit subject scope in the future model. It is separate from reasoning and from the protected document-reader feature. Old five-subject purchases do not automatically prove Reading coverage. |
| Existing recommended/full bundle adding Reading | Preserve the purchased subject-set snapshot. Approve whether Reading is included without charge, offered as an add-on or covered by a documented transition. Do not charge or revoke automatically. |
| New exam version with same subject | Keep subject identity stable; version/content coverage must be explicit. An exam-cycle change alone must not reset the 12-month clock or force repurchase. |
| Historical paid or pending order | Retry/verify against its original amount/provider/scope; never apply a new discount or duration to the old snapshot. |
| Legacy subscription/permanent implementation | Record as a legacy cohort for reconciliation, not the future sales model. Treatment requires an explicit customer-preserving decision. No new subscription/lifetime/PDF-only offer is recommended. |

This audit does not grant indefinite access as a new product rule. It preserves existing evidence until a transition policy is approved. Determine real legacy cohorts from an authorized read-only production report before any contract/data change.

## Acceptance requirements for subsequent work

Tasks T2.2/T3.2/T5.2 in [execution plan](PHASE_EXECUTION_PLAN.md) implement individual subjects, custom/recommended bundles, server progressive discounts from two subjects and 12-month grants. Device/session enforcement and Google account-transition tasks are deferred. Required commerce tests include duplicate/overlapping selections, every discount boundary, tampered quotes, same-request concurrency, all-or-nothing grants, expiry/renewal/month ends, legacy reconciliation, Reading coverage, and preservation of existing authentication/session behavior.

**Approval still needed for details:** discount rates/base prices; degree/goal mappings; scope of included practice/simulators; calendar-month/renewal rules; Reading and legacy-cohort transition; device replacement/recovery policy; whether Google-only entry is required. None of these questions reopens the fixed monetisation model.


## Revision history

- 2026-11-20: Updated scope to defer Google sign-in changes and enhanced device/session/account-sharing/watermark controls. Confirmed the fixed commercial baseline and protected all existing authentication, session, watermark, purchase, and historical customer data behavior.
