# T1.2 — Subject entitlement policy

Date: **2026-11-20**. Approved baseline: every newly purchased subject receives independent **12-month access** through a one-time payment; there is no automatic renewal and a new subject never resets another subject's period. Exact dates, overlaps, benefits and refunds remain pending [P1-C05–C07/C10/C12/C13](PHASE_1_DECISION_REGISTER.md). No existing access changes here. **APPROVED launch facts:** no registered users/customers/buyers or historical customer entitlements requiring grandfathering (owner confirmation, not database audit). No customer migration or Reading grandfathering is needed; development/test/financial records remain protected.

## Scope and representation

Use a CentEntitlement aggregate per settled order and an EntitlementItem per purchased subject/order line. Each new item has stable subject identity, owner/parent/line, immutable sold benefit and coverage policy, term policy revision, StartsAt, ExpiresAt and revocation evidence. New paid items require a finite positive 12-month interval; legacy null-expiry grants retain their original meaning. Parent does not carry a misleading shared expiry when item dates differ.

An item's interval is independent even if several items were paid together and initially share timestamps. Never overwrite an earlier item's start/end when a new purchase settles. Lifetime legacy rights do not become new lifetime offers. An exam/content version is not an entitlement expiry event. Reading and Comprehension is the independent sixth subject with its own syllabus/content links, individual offer and independent 12-month item, selectable in custom/recommended bundles. Its approved initial price is **490,000 Toman = 4,900,000 integer IRR**; all six subjects use the approved distinct-count tiers 0/5/10/15/20/25% with no extra preset discount. Display is Toman; financial snapshots and provider amounts are IRR.

## Lifecycle and access evaluation

| State/event | Proposed semantics | Evidence/approval |
| --- | --- | --- |
| Quote/order pending | No new access before verified settlement | Required payment integrity |
| Settlement | Create exactly one item per line atomically; start according to frozen approved term policy | Start event pending P1-C06 |
| Upcoming | `now < StartsAt`; right exists but is not yet usable | Relevant to explicit queued renewals only |
| Active | `StartsAt <= serverNow < ExpiresAt`, non-revoked, benefit and subject scope match | End-exclusive recommendation P1-C06 |
| Expired | `serverNow >= ExpiresAt`; no new access from that item | Keep financial history, learning evidence, notes and attempts |
| Revoked | Auditable revocation disables this item's right from its effective time | Existing legacy revocation preserved; refund consequences pending |
| Renewal | Separate explicit payment and interval; no recurring charge, no mutation of previous right | Overlap/window pending P1-C07 |
| Refund/cancellation | Separate financial and entitlement decisions with durable links | P1-C10; no automatic deletion/revocation inferred |

Extend CentAccess to resolve a resource's existing training/course plus required benefit, then OR valid rights from unchanged legacy grants and new subject items. Default deny a new protected benefit without evidence. Current public metadata remains separate from protected content. Unpublished resources remain unavailable even for a paid owner; ownership and publication are different facts. Purchases must not promise unpublished incomplete Reading content as ready.

Avoid materializing “expired” by rewriting rights on a browser timer; evaluate effective dates on every protected request. The UI refreshes server access at boundaries/focus using existing patterns. Multiple valid rights combine without truncation; revoking/refunding one line cannot revoke unrelated rights. Keep explicit denial reasons (`not_purchased`, `not_started`, `expired`, `revoked`, `unpublished`, `benefit_not_included`) in owner-safe projections; never reveal another owner's grant.

## Recommended twelve-month semantics — pending approval

P1-C06 recommendation: start at the first successful server verification/settlement timestamp `PaidAt`, UTC; add **12 calendar months**, preserving UTC time of day, clamping an invalid day to the final day of the target month; end is exclusive. Calendar dates below are synthetic, not real customer terms.

| Synthetic start | Recommended exclusive end | Expected boundary |
| --- | --- | --- |
| 2026-11-20T10:15:00Z | 2027-11-20T10:15:00Z | Usable just before end, denied at equality |
| 2027-01-31T09:00:00Z | 2028-01-31T09:00:00Z | Preserve day/time; no 365-day substitution |
| 2028-02-29T12:00:00Z | 2029-02-28T12:00:00Z | Clamp leap-day anniversary |
| Math paid 2026-11-20; Biology paid 2027-02-10 | Math ends 2027-11-20; Biology ends 2028-02-10, same respective times | Biology does not restart Math |

Delayed provider callback recommendation uses verified settlement time rather than client return or unverified provider assertion; owner must approve whether any verified provider payment timestamp can supersede it. No contractual timezone/month-end choice is final. Display localized dates with precise timezone/end wording; stored authoritative instants remain UTC.

## Purchase and renewal eligibility — pending details in P1-C07/C08

Distinct-subject counting is approved; cart normalization and owned-subject/renewal handling remain pending. Recommend ordinary purchases for unowned/expired subjects; block accidental rebuy of an active subject and permanently owned legacy scope. Provide explicit renewal intent only after its policy is approved. Recommended renewal starts at the later of successful verification and the latest guaranteed contiguous same-subject end, and grants a separate twelve months from that start. This queues future time for the same subject; it never edits an existing interval. If the owner instead chooses overlapping payment-start intervals, snapshot that distinct policy and disclose the overlap before payment. Never infer a queued renewal from a new unrelated subject purchase.

Eligibility is serialized at quote acceptance; if rights change before payment, do not alter the stored amount/subject set. Concurrency policy must prevent accidental parallel active purchase initiations for one subject; if a legally valid payment is nevertheless verified, honor frozen terms or route to approved resolution. Never discard a verified payment because a second order settled first. A null-expiry right cannot be used as a fictitious renewal start.

## Benefit matrix — recommendation, not a paywall change

| Capability | Existing behavior to preserve | Proposed new subject product / approval |
| --- | --- | --- |
| Catalog/curriculum metadata | Public published metadata | Remains public |
| Lessons and educational materials | Training/subscription access, publication checked per request | Included for purchased subject, within frozen coverage policy; P1-C05/C13 |
| Existing diagnostic and subject/topic Practice | Existing educational contracts, not generally subject-purchase gated | Preserve behavior. Any new premium question-bank Practice must be a separately identified approved benefit |
| New question-bank Practice and explanations | No new commercial policy deployed | Recommend included within purchased subject; P1-C05 |
| New full Mock Exam | Existing `simulator` subscription gate is legacy behavior | Recommend all blueprint subjects covered at start; five for historical, six including Reading for current; P1-C05 |
| Running new Mock Exam after purchase expiry | No new policy deployed | Recommend bounded admission valid until its immutable deadlines; P1-C12. Existing legacy start/submit gates remain unchanged |
| Owner result/snapshot review after expiry | Historical result ownership preserved | Recommend retain owner review under existing auth, no new-start/bank access; P1-C12 |
| Notes/progress | Keep owner records and note listing; protected document/editing still uses existing access | No deletion/reset on expiry; no new account enforcement |
| Mastery | Existing computed evidence method | Separate from grants and raw scores; no retroactive recalc or automatic new-mock feed |

Benefits are snapshotted per sold offer revision; upgrades must not silently remove already sold benefits. Reading is a distinct subject, and shared passage access follows its subject/group scope. Do not infer Reading from reasoning or document-reader access. No automatic free historical Reading item, grandfather cohort, compensatory benefit or migration workflow is required for this zero-customer launch (P1-C09 APPROVED). Retaining the old grant resolver preserves code/data integrity, not evidence that real legacy customers exist. New versioned attempts may snapshot an access-admission reference only if P1-C12 is approved; it is neither a login session nor a concurrent-study lease.

## Validation and rollback requirements

Later fixtures must exercise first purchase, distinct-subject staggered dates, leap/month ends, equality expiry, upcoming renewals, multi-right OR evaluation, revocation of one line only, protected direct URLs, unpublished resources, preserved notes and old permanent/subscription access. Financial success and access success have separate assertions. On rollout rollback stop new offers while retaining item-aware readers, already sold terms and original callbacks; do not shorten items or delete rights. No runtime or database validation was performed in Phase 1.

## Superseded proposal

The earlier P1-C09 recommendation to review historical bundles and grant Reading by original promise is superseded by the owner's confirmed zero-customer launch. It is not an implementation requirement. Any existing development/test/financial evidence stays unchanged; no cleanup or conversion is authorized. The 12-month duration is approved, while exact start/end arithmetic, renewal/overlap, benefits, refunds, quote behavior and mid-Mock-Exam access expiry remain pending as individually listed above.
