# Owner acceptance recorded — Phase 2 transition

The owner explicitly approved the refined Phase 1 logo/variants and light/dark appearance, accepted its documented technical limits, and authorized Phase 2 shared components on local main. Phase 1 is visually accepted and closed with those limitations carried forward. Phase 2 is delivered for acceptance; Phase 3 remains unauthorized. Earlier pending-approval statements below are preserved historical issuance records, superseded by this explicit owner decision.

# Phase 1 — original-reference logo review

Status: **Refinement delivered; final owner approval pending.** Local frontend main; Phase 2 not started. Both formerly missing files are now available and reviewed. This follow-up supersedes initial missing-reference statements while preserving historical evidence.

## Findings and changes

[Original logo](../brand/logo-original-reference.png) controls geometry; [recolored logo](../brand/logo-reference.png), [approved brand board](../brand/brand-board-reference.png) and [Slate & Sage palette](../brand/palette-reference.png) control identity. Original shading and board gradients are excluded under the approved flat-color rule. The same two chevrons and diamond are retained.

The initial SVG used the recolored PNG proportions. Comparison to the original warranted a thicker upper band, thinner middle band and higher diamond. Both chevrons and diamond now have exact 45-degree edges and reflection symmetry about x242. Widths248/150/74, centerline gaps28/27 and a balanced square284px viewBox are shared by every variant. Original raster threshold bounds≈248×243; refined vector248×245. This is a symmetric optical fit to an antialiased raster, not a recovered exact vector master. [Measurements](evidence/phase-1/logo-review/original-raster-measurements.json), [exact geometry/colors](evidence/phase-1/logo-review/geometry.json).

Updated only public/brand assets: symbol.svg, symbol-dark.svg, logo-primary.svg, logo-dark.svg, monochrome.svg, inverted.svg, favicon.svg and favicon-32/180/192.png. Shared Brand already consumes these assets; no component, route, layout or behavior code changed in this follow-up. Wordmark title case/live text and accessible labels retained.

Light:#A5B5A1/#4D687A/#29343C. Dark:#A5B5A1/#9CB8C9/#F5F7F7. Monochrome:#29343C; inverted:#F5F7F7. All exact and unchanged from the Phase 1 proposal. All fills flat; no gradients, heavy shadows, outlines or new symbols. The dark adaptation remains subject to owner approval.

## Visual evidence

Focused details: [matched-width geometry comparison](evidence/phase-1/logo-review/geometry-detail.png) and [favicon at actual display sizes](evidence/phase-1/logo-review/favicon-actual-sizes.png). View at 100% scale for the small-size assessment.

[Logo comparison PNG](evidence/phase-1/logo-review/logo-comparison.png) / [interactive-sized HTML review](evidence/phase-1/logo-comparison.html). Includes original full raster and cropped silhouette, approved recolored reference, board, old/refined SVG at matched occupied width, light/dark wordmarks, monochrome, inverted and favicon at16/24/32/48CSSpx (DPR1). The16px mark retains all three forms but fine gaps are antialiased;24px+ is clearer. No alternate small-size geometry introduced.

[Updated Phase0/light/dark comparison HTML](evidence/phase-1/visual-comparisons.html) / [PNG](evidence/phase-1/visual-comparisons.png). Data/API differences are labeled. Home/login/dashboard use new captures; earlier reader comparison is unchanged because its shell has no Brand placement. Old comparison PNGs and SVGs remain under evidence/phase-1/logo-review/before; initial screenshots remain intact.

20 new actual local Cent.Preview screenshots; no SDK/API mocking, synthetic fixture accounts only. Public header/footer and student/admin sidebars, both themes at 390×844 and 1440×1000. Mobile menus additionally captured open. Local Google discovery remains disabled; screenshots are not official Google/provider proof.

| Page | Mobile | Desktop |
| --- | --- | --- |
| home | [Light390](evidence/phase-1/logo-review/home-light-390.png) / [Dark390](evidence/phase-1/logo-review/home-dark-390.png) | [Light1440](evidence/phase-1/logo-review/home-light-1440.png) / [Dark1440](evidence/phase-1/logo-review/home-dark-1440.png) |
| login | [Light390](evidence/phase-1/logo-review/login-light-390.png) / [Dark390](evidence/phase-1/logo-review/login-dark-390.png) | [Light1440](evidence/phase-1/logo-review/login-light-1440.png) / [Dark1440](evidence/phase-1/logo-review/login-dark-1440.png) |
| dashboard | [Light390](evidence/phase-1/logo-review/dashboard-light-390.png) / [Dark390](evidence/phase-1/logo-review/dashboard-dark-390.png) | [Light1440](evidence/phase-1/logo-review/dashboard-light-1440.png) / [Dark1440](evidence/phase-1/logo-review/dashboard-dark-1440.png) |
| admin | [Light390](evidence/phase-1/logo-review/admin-light-390.png) / [Dark390](evidence/phase-1/logo-review/admin-dark-390.png) | [Light1440](evidence/phase-1/logo-review/admin-light-1440.png) / [Dark1440](evidence/phase-1/logo-review/admin-dark-1440.png) |

Mobile logo placements: [student light](evidence/phase-1/logo-review/dashboard-menu-light-390.png), [student dark](evidence/phase-1/logo-review/dashboard-menu-dark-390.png), [admin light](evidence/phase-1/logo-review/admin-menu-light-390.png), [admin dark](evidence/phase-1/logo-review/admin-menu-dark-390.png). [Screenshot manifest](evidence/phase-1/logo-review/screenshots.json) records routes/themes/classification.

## Verification

| Check | Actual result |
| --- | --- |
| npm.cmd test |124 passed,7 files; existing GIS and appearance tests included; [log](evidence/phase-1/logo-review/unit-tests.log) |
| node tests/browser/check-appearance.mjs |9 groups passed: system/default/switch/persist/reload/OS/storage/keyboard/base-path/startup coverage; [log](evidence/phase-1/logo-review/appearance.log) |
| npm.cmd run build |TypeScript tsc-b and production Vite build passed; [log](evidence/phase-1/logo-review/build.log) |
| Focused ESLint |0 errors/0 warnings on Brand, appearance owner/control/test/browser check and follow-up helpers; [JSON](evidence/phase-1/logo-review/lint-final.json) |
| Asset verification |10 checks passed: all SVG path identity/symmetry/angles/colors, PNG dimensions, matching built assets; [verification](evidence/phase-1/logo-review/verification.json) |
| Protection |14 protected-file raw hashes match earlier Phase 1; backend Git clean; main; nothing staged; git diff-check passed |
| New rendered evidence |20images,0 uncaught page errors,0 document overflow at sampled widths; existing public and authenticated shells rendered |

No broader full lint, connected functional regression, Google browser/provider or backend test suite was repeated for an asset-only change. Earlier results remain in PHASE_1_REPORT; existing 93authored/154 global lint findings are not fixed or relabeled as passing. Current runtime exercises existing password session login and protected shell rendering, not all business flows. No real payment, assessment submission, destructive action or provider reconfiguration. Existing accessibility/expiry/payment/study-return/math-prefix limitations remain.

## Boundaries and approval

Google authentication, application/theme logic, CSS/layout/typography, shared backend and Lerona unchanged in this follow-up. No production access, migration, new dependency, commit, push, deploy or Phase 2 implementation. Existing local frontend/backend processes were used; no user-owned process stopped.

Reference availability is resolved. Please approve or request revisions to the **refined logo geometry and variants**, and separately review the **dark appearance**. Phase 1 remains open until explicit owner acceptance; Phase 2 requires explicit authorization.
