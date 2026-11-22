# T1.2 — Products, bundles and server pricing

Date: **2026-11-20**. Fixed: individual subjects, custom bundles and editable recommended degree/goal bundles; one payment; progressive discounts beginning at two distinct subjects; each purchased subject has its own twelve-month entitlement. **APPROVED:** the initial reference price is **490,000 Iranian Toman (4,900,000 IRR) per subject**, including Reading, and the distinct-subject discount schedule is 0/5/10/15/20/25% for one through six subjects. Prices/tiers below reflect that approval; rounding/allocation, benefits, exact term/renewal, preset compositions and quote/checkout behavior remain proposals. No production configuration was changed. Decisions: [P1-C01–C13](PHASE_1_DECISION_REGISTER.md).

## Product identity and scope

| Subject key | Display name | Future offer requirement |
| --- | --- | --- |
| reading | Reading and comprehension | Independent sixth subject; own syllabus/content and reviewed passage groups; same price/tier rules, independent 12-month entitlement; no launch grandfathering |
| math | Mathematics | Preserve existing course/training/content IDs |
| logic | Reasoning on texts and data | Keep `logic`; do not rename it to Reading |
| biology | Biology | Independent term/benefits |
| chemistry | Chemistry | Draft/gaps cannot be sold as certified complete coverage |
| physics | Physics | Independent term/benefits |

Keys/offer identifiers are recommended internal contracts, pending T11-D01. One subject offer maps explicitly to course/training resources and a coverage/benefit revision. Existing arbitrary training products are not automatically subject offers. Sold terms identify included resources/features and content-update scope. Exam version, subject, offer revision and twelve-month interval are separate identities.

Recommended bundle revisions store name, degree/field/goals, ordered distinct subject keys, rationale and editorial reviewer. Users customize the selection before quote. Same selected subjects receive the same count-based pricing whether entered manually or from presets; no hidden preset premium/discount. The final selected line set, not the preset name, defines sold access.

## Approved initial commercial values

**P1-C01 APPROVED:** each of `reading`, `math`, `logic`, `biology`, `chemistry` and `physics` has the initial reference price **490,000 Toman = 4,900,000 IRR**. **P1-C02 APPROVED:** the following schedule applies equally to customizable and recommended bundles. Count distinct subjects only; no additional preset-bundle discount.

User-facing currency is Iranian Toman. Canonical storage, order/quote totals, arithmetic and provider amounts are integer Iranian Rial (`IRR`); **1 Toman = 10 IRR**, so `displayToman = amountRial / 10` exactly. Display values never authorize payment. A bare `490000` without a unit is invalid documentation. Earlier 490,000 IRR/49,000 Toman price proposals are superseded and are not approved prices.

| Distinct payable subjects | Approved discount | List IRR | Discount IRR | Payable IRR | Display payable Toman |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 0% | 4900000 | 0 | 4900000 | 490000 |
| 2 | 5% | 9800000 | 490000 | 9310000 | 931000 |
| 3 | 10% | 14700000 | 1470000 | 13230000 | 1323000 |
| 4 | 15% | 19600000 | 2940000 | 16660000 | 1666000 |
| 5 | 20% | 24500000 | 4900000 | 19600000 | 1960000 |
| 6 | 25% | 29400000 | 7350000 | 22050000 | 2205000 |

These totals are exact under the approved initial equal prices and tiers, before any separately approved tax/fee handling. No rounding is needed for these six rows. Future unequal prices require an approved new price revision; rounding/allocation rules remain pending P1-C03. No coupons, installments, automatic billing or stacked discounts are approved.

## Deterministic proposed calculation

Let selected payable distinct subjects be S, count n, positive integer IRR list prices p(s), immutable policy rate r(n) in basis points (0–9999). `L=sum(p(s))`; `D=RoundHalfUp(L*r(n)/10000)`; `T=L-D` before any separately approved tax/fee handling. For n=1 r=0; for n=2..6 the approved rates in basis points are 500/1000/1500/2000/2500. No n>6 or extra preset rate is valid for the six-subject launch. No missing tier defaults, floating-point amounts, client totals or negative/free line prices. Server validates overflow, eligibility and positive payable lines/total. If approved tax treatment is required, it must be explicitly configured and itemized before checkout; fixtures below assume zero solely for arithmetic.

Proposed allocation P1-C03: compute exact shares `D*p(s)/L`, floor each, distribute the remaining rials to descending fractional remainders, breaking ties by stable subject key ascending. Each line has list, allocated discount and net; sum discounts=D and sum nets=T exactly. Retain the policy and allocations forever with the order; refunds, if approved, use original allocated net amounts and explicit policy, never current prices.

Synthetic rounding example: two list prices math=101 IRR and physics=102 IRR at the approved 5% two-subject rate. L=203; exact discount=10.15; half-up D=10; weighted shares approximately 4.9754 and 5.0246; floors 4 and 5; the remaining rial goes to math. Discounts 5/5, nets 96/97, total193. Separate half-rial example L=210 at5% gives10.5→11. These tiny prices are synthetic tests of the still-proposed rounding/allocation algorithm, not approved offers or tax advice. For approved current prices, line discounts/nets in a two-subject order are 245,000/4,655,000 IRR each (24,500/465,500 Toman), totaling 9,310,000 IRR (931,000 Toman).

## Proposed recommendation sets — pending P1-C04

| Candidate preset | Suggested subjects | Educational rationale / caveat |
| --- | --- | --- |
| Engineering preparation | reading, math, logic, chemistry, physics | Language, quantitative/data reasoning and physical sciences; Biology remains an official section and can be added |
| Life-science preparation | reading, math, logic, biology, chemistry | Language/data and life sciences; Physics remains an official section and can be added |
| Economics/data preparation | reading, math, logic | Language, mathematics and data reasoning; omits official science sections and is not a full-exam entitlement |
| Complete current preparation | reading, math, logic, biology, chemistry, physics | All six subjects; eligibility/content readiness still required |

These are Itatest editorial proposals, not university-specific admissions requirements or official CISIA recommended combinations. Users must consult their university notices. A configurable degree/field/goal taxonomy references these revisions; no new recommendation/AI engine or invented guaranteed admissions outcome is required.

## Duplicate, owned and overlapping selection policy

Distinct-subject counting and no preset stacking are APPROVED P1-C02/C08. Recommended normalization/checkout behavior, still pending P1-C08: input arrays containing duplicates fail `duplicate_subject`; no double billing or count inflation. Overlapping preset selections expand to their union once; show the normalized set before quote. Removing a subject requires a new quote. Existing rights are reported separately; ordinary purchase blocks active/permanent duplicate scope and offers explicit deselection or approved renewal intent. Previously bought subjects do not count toward the discount for an unrelated new purchase. Only distinct payable lines in this order count. Do not silently remove a paid line after accepting payment or reset another subject's interval.

Renewal overlap and queueing are P1-C07. Recommended initial behavior is reject unsupported renewal requests rather than silently stack/overlap. Already issued valid pending/paid orders use frozen terms and a compatibility handler, not current cart filtering.

## CP01–CP12 acceptance fixtures

Approved prices/tiers and Reading launch scope are fixed in CP01–CP03/CP12. Rounding, owned-subject handling, quote/checkout/renewal branches remain conditional on their named pending approvals; no executable fixtures or payments were created.

| ID | Given / action | Expected specification outcome |
| --- | --- | --- |
| CP01 | One subject, including Reading, at approved 4,900,000 IRR (490,000 Toman) | n=1, D=0 IRR, T=4,900,000 IRR (490,000 Toman); one independent 12-month item; exact boundary pending |
| CP02 | Two distinct subjects at approved prices and 5% | L=9,800,000 IRR; D=490,000 IRR; T=9,310,000 IRR (931,000 Toman); one payment/two independent items |
| CP03 | All six approved subjects at 25% | L=29,400,000 IRR; D=7,350,000 IRR; T=22,050,000 IRR (2,205,000 Toman); six independent items, no preset discount stacked |
| CP04 | `[math,math]` | Reject duplicate; never a two-subject discount |
| CP05 | Engineering plus life-science presets | Visible union of all six, no duplicated subjects; one fresh quote |
| CP06 | Math already active, buy new Biology | Only Biology payable; Math period unchanged, no two-subject discount from prior ownership |
| CP07 | Synthetic prices 101/102 IRR, approved 5% tier; proposed rounding | Discount 10 IRR, allocated 5/5 IRR, total 193 IRR (19.3 Toman); sums match. Fractional-Toman presentation remains pending P1-C03 |
| CP08 | Quote expired before first order acceptance | `quote_expired`, no provider call; request explicit new quote |
| CP09 | Same requestId/quote after lost checkout response | Same order/amount/subjects/provider, no second authority/payment; changed quote conflicts |
| CP10 | Price changes after order snapshot; callback repeats | Verify original amount once; all items commit once; no new-price calculation |
| CP11 | Final item insert fails | Entire settlement rolls back locally, pending/uncertain state retained for same-order reconciliation; no partial access |
| CP12 | Owner-confirmed zero-customer launch; Reading selected alone or in a custom/recommended selection | No grandfathering workflow/free historical Reading grant. Reading has its own subject/syllabus/content/offer and independent 12-month item, same approved price/tier rules; preset compositions remain pending |

Additional later tests must cover every final tier, tie-breaking and half-rial boundaries, unequal prices, same-subject purchase races, overlapping pending authorities, refund allocation if approved, and leap/end-exclusive dates in [entitlement policy](T1_2_ENTITLEMENT_POLICY.md). Approved reference prices/tiers are owner decisions; deployed pricing/configuration and operational records remain unverified. Owner-confirmed absence of customers is not a database audit.

## Supersession record — commercial finalization 2026-11-20

The earlier 490,000 IRR interpretation was incorrect and is superseded by approved **490,000 Toman / 4,900,000 IRR** per subject. The same percentage tiers previously proposed are now APPROVED. Earlier CP01–CP03 amounts were recalculated at ten times the Rial base; CP12's unknown historical-customer cohort scenario is superseded by the zero-customer launch. P1-C09's proposed grandfathering mechanism is not required. Historical decision-log entries remain preserved; rounding/preset/benefit/term/refund/quote approvals are not inferred.
