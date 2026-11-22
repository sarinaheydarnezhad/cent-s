<!-- Snapshot links rebased from docs/refinement; historical content retained. -->
# Actual design system baseline

Status: Phase 0 documentation only. **Itatest tokens and dark theme have not been implemented.** Existing CSS cascade remains authoritative until approved changes.

## Existing tokens

`src/styles.css :root`:

| Token | Value | Current purpose |
| --- | --- | --- |
| --primary / --primary-dark / --primary-soft | #0d776f / #075a55 / #e6f4f2 | Teal action/hover/support |
| --navy / --navy-2 | #102a43 / #163a5f | Headings/sidebar/decorative surfaces |
| --ink / --muted | #17324d / #63788c | Main/secondary text |
| --line / --surface / --bg | #dfe7ee / #fff / #f5f8fa | Borders/surface/page |
| --cream | #faf7ef | Supporting surface |
| --success / --warning / --danger | #19956a / #e09a29 / #d45151 | Status colors |
| --shadow | 0 18px 50px rgba(25,57,78,.09) | Large shared shadow |
| --radius | 18px | Default card |
| --font | Vazirmatn, Vazir, Tahoma, Arial, sans-serif | Persian/general stack |
| --cent-paper / --cent-line | #f8f9f5 / #dfe7e3 | Additional study/commerce tokens in cent.css |

Snapshot: [source-inventory.json](../../evidence/source-inventory.json). CSS has 333 literal color occurrences (246 styles.css, 87 cent.css), including token declarations, inactive selectors and repeated values. There are 21 gradient expressions in styles.css; count is not the number of visible gradients/pages. No theme state or theme mappings exist. Body is finally overridden with a light gradient; cards/forms/header frequently use white literals.

## Typography and geometry

Vazirmatn 400/500/700 imported locally. Inter is not installed/imported. CSS requests 600/800/900 in places; synthesis/substitution requires review. Body final size 15px and line-height 1.75. Some helper/metadata text is .6–.78rem. Hero and storefront headings grow above proposed 40px. Latin brand uses Arial; mark Georgia; math mostly Unicode/plain source text, not a dedicated math rendering engine.

No spacing scale tokens. Literal spacings include 5,7,9,10,13,15,18,20,22,25,28,30,35,38,40 and others. Radius declarations include 6,7,8,9,10,11,12,13,14,15,16,18,19,20,22,24 and pill/asymmetric shapes; inventory records multi-value expressions separately. Shared button is overridden from 44px/11px radius to 46px/13px; large buttons retain a larger minimum. Reader controls 32px, note pins 26px. Shadows appear on many cards and hover states.

Lucide icons are reusable; stroke varies from .8 to default 2, sizes from 14 to decorative 95px+. Google mark is its service-specific multicolor symbol, not an Itatest logo. No request to recolor third-party identity is implied.

Existing breakpoints across files: 520,600,700,760,820,900,1050,1100 and 1500px. Do not mechanically replace them without checking content. Reduced-motion CSS already disables most CSS motion; JS smooth scroll still needs actual evaluation. Focus rules exist but rely on hardcoded green.

## Accessibility findings and candidate palette checks

Calculated sRGB ratios, not full rendered-state acceptance:

| Pair | Ratio | Consequence |
| --- | --- | --- |
| White on approved slate | 5.87 | Suitable normal text |
| White on approved sage | 2.16 | Prohibited normal text |
| Charcoal on sage | 5.89 | Suitable normal text |
| Proposed secondary text on off-white | 4.54 | Narrow pass; test actual states/backgrounds |
| Proposed warning #9A702B on #F8F0E2 | 3.93 | Fails normal-text target; refine support token |
| Proposed error #B54C4C on #F8EAEA | 4.37 | Fails normal-text target; refine support token |
| Current focus #79A36C on white | 2.89 | Needs adjacent-background/state review |
| Current success white on #19956A | 3.78 | Fails normal text where this variant is used |

Existing styled variants are not all rendered in the available unmocked baseline. Do not infer site-wide WCAG compliance or failure from this table alone. No accessibility certification is claimed.

## Proposed Phase 1 extension, pending approval

Extend current CSS variables with semantic page/surface/elevated/text/secondary/muted/border/interactive/action foreground/hover/pressed/selected/focus/disabled/status/overlay/skeleton/chart/progress/link/input roles. Approved five light core colors remain exact; supporting/dark values are validation candidates. One document-level theme attribute, one local preference owner (light/dark/system), early startup resolution, safe storage handling and system listener; no auth/backend dependency. Keep document canvas/image colors independent from reader chrome. No new UI framework, state library or font network required.

Phase 2 should give the existing shared UI a small typed variant API and visible state review mechanism. Preview must be dev-only; no route is created during Phase 0. Actual mappings and APIs will replace this proposal only after implementation and evidence.
