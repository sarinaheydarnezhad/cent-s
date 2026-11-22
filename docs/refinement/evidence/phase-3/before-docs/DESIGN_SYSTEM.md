# Shared component system — current Phase 2 implementation

The owner explicitly approved the refined Phase 1 logo/variants and light/dark appearance, accepted its documented technical limits, and authorized Phase 2 shared components on local main. Phase 1 is visually accepted and closed with those limitations carried forward. Phase 2 is delivered for acceptance; Phase 3 remains unauthorized.

The Phase 1 token/type/appearance architecture below remains authoritative. Shared behavior and usage are documented in [COMPONENT_USAGE_GUIDE](COMPONENT_USAGE_GUIDE.md) and [FEEDBACK_PATTERNS](FEEDBACK_PATTERNS.md). Source: UI.tsx, Fields.tsx, Dialog.tsx, useNavigationDisclosure.ts and the established foundation-ui.css compatibility layer.

## Color semantics added using existing values

| Role / token | Light | Dark | Use |
| --- | --- | --- | --- |
| Brand Sage / --brand-sage | #A5B5A1 | #A5B5A1 | Approved identity, not ordinary pale foreground text |
| Interaction / --color-action | #4D687A | #9CB8C9 | Primary button/navigation; on-action foreground remains approved Phase 1 mapping |
| Ordinary selected / --color-interactive-selected | existing hover #E7EEF2 | existing hover #30414D | Slate family; text aliases link #3D5667 / #9CB8C9 |
| Learning surface / --color-learning-surface | existing selected #E8EEE6 | existing selected #303D34 | Educational support |
| Learning text / --color-learning-text | existing selected-text #344D32 | existing selected-text #C6D8C2 | Accessible Sage-surface foreground |
| Progress / --color-learning-indicator | existing progress #557451 | existing progress #A5B5A1 | Learning values, with named value/text equivalent |
| Recommendation / --color-recommendation-surface and text | aliases learning surface/text | aliases learning surface/text | Actual next-step guidance, independently named from success |
| Success / --color-success and surface | #486644 / #E8EEE6 | #A8C6A2 / #303D34 | Successful operation only; independent status semantics |
| Warning/error/info | Existing Phase 1 values | Existing Phase 1 values | Severity with visible wording/icon; never sole color signal |

The legacy --color-selected Sage values are retained as palette equivalents for learning aliases; --primary-soft now points to ordinary Slate selection. Current sidebar navigation and auth/catalog pressed modes use Slate. Generic cent-tag defaults neutral/rounded; learning/recommendation require explicit meaning. White on pale Sage and pale Sage ordinary text on light surfaces are inappropriate. Light-theme composition guidance (roughly45% light background, 25%neutral surface, 10%charcoal, 10%Slate, 10%Sage; Sage10–15%overall/stronger in learning) is not a pixel quota; do not force Sage into auth/commerce/admin.

## Component contracts

Buttons: primary/secondary/tertiary/ghost/destructive and named icon actions; 44/48/56px sizes; disabled/busy/native submission contracts; reserved loading dimensions. Cards: standard/outlined/elevated/interactive/recommendation/learning/selected; 16px radius, flat by default. Native fields: 48px minimum, visible labels, required/readOnly/invalid/disabled, associated hints/errors and unchanged validation. Filters: native pressed buttons; badges are non-interactive labels. Notice/status/loading/skeleton/empty/progress and native dialog share established spacing/type/theme tokens. Dialog24px radius and existing overlay/elevation; safe focus and responsive scroll. Native confirmation safeguards remain.

Every shared export's purpose, states, consumers, misuse examples, accessibility and known limits are in the usage guide. No new progress ring or fabricated achievement; no unsupported custom switch/menu/tooltip service. Representative verified evidence: 48 measured light/dark text/control/invalid pairs; keyboard/forms/filter/radio/progress/dialog/disclosure/reduced-motion and reflow checks. This is not comprehensive WCAG acceptance. Real Google OAuth/FedCM/signatures and production CORS remain unverified; external payments, comprehensive WCAG/assistive-technology coverage, original study-return synchronization, exposed math: recommendation codes, destructive operations, exhaustive timeout/reader/private-state coverage and existing lint debt remain. Historical backend results are prebuilt-assembly checks (Cent 108, Lerona 396, 3 skipped), not fresh source-build verification; no backend tests were rerun in Phase 2.

---

## Preserved earlier phase records

# Implemented design foundations — Phase 1

Source: [foundations.css](../../src/foundations.css), existing migrated [styles.css](../../src/styles.css) / [cent.css](../../src/cent.css), and [foundation-ui.css](../../src/foundation-ui.css) for compatibility aliases and minimum shell/control adjustments. This extends existing CSS, without a UI framework or parallel component system. [Phase 0 snapshot](evidence/phase-1/DESIGN_SYSTEM-before.md) is preserved.

## Brand constants

Slate #4D687A; sage #A5B5A1; charcoal #29343C; gray #E0E4E6; paper #F5F7F7. These remain exact. White normal text is never intentionally placed on sage.

## Actual semantic mappings

| Token | Light (resolved) | Dark (resolved) |
| --- | --- | --- |
| --color-page | #F5F7F7 | #182127 |
| --color-surface | #FFFFFF | #222D35 |
| --color-elevated | #FFFFFF | #2B3841 |
| --color-surface-subtle | #EDF1F2 | #2B3841 |
| --color-text | #29343C | #F5F7F7 |
| --color-text-secondary | #5E6D77 | #B7C3CA |
| --color-text-muted | #5E6D77 | #B7C3CA |
| --color-text-disabled | #75818A | #8999A3 |
| --color-border | #E0E4E6 | #3C4A53 |
| --color-border-interactive | #758793 | #8296A3 |
| --color-divider | #E0E4E6 | #3C4A53 |
| --color-action | #4D687A | #9CB8C9 |
| --color-action-text | #FFFFFF | #182127 |
| --color-action-hover | #3D5667 | #B1C8D5 |
| --color-action-pressed | #304959 | #8DAABA |
| --color-secondary-action | #A5B5A1 | #A5B5A1 |
| --color-secondary-action-text | #29343C | #182127 |
| --color-hover | #E7EEF2 | #30414D |
| --color-selected | #E8EEE6 | #303D34 |
| --color-selected-text | #344D32 | #C6D8C2 |
| --color-disabled | #E0E4E6 | #34424B |
| --color-focus | #3D5667 | #9CB8C9 |
| --color-success | #486644 | #A8C6A2 |
| --color-success-surface | #E8EEE6 | #303D34 |
| --color-success-action | #486644 | #A8C6A2 |
| --color-success-action-text | #FFFFFF | #182127 |
| --color-warning | #79551C | #E2BC78 |
| --color-warning-surface | #F8F0E2 | #403728 |
| --color-error | #A33E3E | #F0A3A3 |
| --color-error-surface | #F8EAEA | #442F34 |
| --color-info | #3D5667 | #9CB8C9 |
| --color-info-surface | #E7EEF2 | #2C3D49 |
| --color-overlay | rgb(24 33 39 / 65%) | rgb(15 22 27 / 78%) |
| --color-skeleton | #E0E4E6 | #34424B |
| --color-progress-track | #E0E4E6 | #3C4A53 |
| --color-progress | #557451 | #A5B5A1 |
| --color-link | #3D5667 | #9CB8C9 |
| --color-input | #FFFFFF | #222D35 |
| --color-strong-surface | #29343C | #222D35 |
| --color-on-strong | #F5F7F7 | #F5F7F7 |
| --color-on-strong-secondary | #CAD4DA | #B7C3CA |
| --color-on-strong-accent | #A5B5A1 | #A5B5A1 |
| --color-on-strong-line | #65737D | #65737D |
| --color-chart-1 | #4D687A | #9CB8C9 |
| --color-chart-2 | #557451 | #A8C6A2 |
| --color-chart-3 | #79551C | #E2BC78 |

Supporting light values were darkened for contrast: secondary/muted #5E6D77; success #486644; warning #79551C; error #A33E3E. Original prompt support colors are starting candidates, not replacements for the five fixed brand constants. Dark palette and SVG variants still require owner visual review. Skeleton/overlay/chart tokens exist as foundations; this phase does not add new skeletons, dialogs or charts.

## Typography, dimensions and motion

| Token | Value |
| --- | --- |
| --shadow-small | 0 2px 8px rgb(41 52 60 / 4%) |
| --shadow-medium | 0 8px 24px rgb(41 52 60 / 7%) |
| --shadow-large | 0 16px 40px rgb(41 52 60 / 9%) |
| --space-1 | 4px |
| --space-2 | 8px |
| --space-3 | 12px |
| --space-4 | 16px |
| --space-6 | 24px |
| --space-8 | 32px |
| --space-12 | 48px |
| --space-16 | 64px |
| --radius-small | 8px |
| --radius-control | 12px |
| --radius-card | 16px |
| --radius-dialog | 24px |
| --radius-pill | 999px |
| --border-width | 1px |
| --focus-width | 2px |
| --focus-offset | 3px |
| --control-height | 48px |
| --layout-width | 1180px |
| --layer-header | 50 |
| --layer-menu | 60 |
| --layer-overlay | 100 |
| --motion-fast | 120ms |
| --motion-normal | 180ms |
| --font-interface | 'Vazirmatn', Tahoma, Arial, sans-serif |
| --font-latin | 'Inter', 'Vazirmatn', Arial, sans-serif |
| --type-hero | 2.5rem |
| --type-page | 1.75rem |
| --type-section | 1.375rem |
| --type-card | 1rem |
| --type-body | 1rem |
| --type-label | .875rem |
| --type-small | .8125rem |
| --weight-normal | 400 |
| --weight-medium | 500 |
| --weight-semibold | 600 |
| --weight-bold | 700 |
| --weight-hero | 800 |
| --line-body | 1.8 |
| --line-heading | 1.5 |

Vazirmatn is already installed and local; added real 600/800 weights and mapped former 900 declarations to 800. Inter variable is locally served with Latin unicode coverage and swap; license/provenance in [font README](../../public/fonts/README.md). There are no new dependencies or third-party font requests. Body 16px/1.8; page heading28, hero max40, existing content-specific smaller metadata retained for later page phases. English interface fields/brand use Inter with Vazirmatn/Arial fallback. Document text, math direction and scientific figures retain existing formatting.

Spacing tokens: 4/8/12/16/24/32/48/64px. Shared controls48px, control radius12, cards16, dialog foundation24, pill999. Existing dense reader controls and some page-specific radii/spacing remain for later phases; tokens do not imply every selector was standardized. Light shadows are restrained; dark shadows resolve to none. Existing content-driven breakpoints are retained instead of introducing a second system. Header/layer/motion tokens establish foundations; not every legacy layer is migrated.

## Appearance architecture

[appearance.js](../../public/appearance.js) is a parser-blocking, same-origin head script before application modules. It sets data-theme, color-scheme and initial page background before React/CSS dependencies finish. It owns one in-memory preference and a localStorage key itatest:appearance:v1; invalid/absent values mean system. It catches blocked read/write storage, follows matchMedia changes only in system, and handles storage events from another tab. Theme-color metadata follows the resolved mode. The React [AppearanceControl](../../src/components/AppearanceControl.tsx) subscribes via useSyncExternalStore, using a real label and native select. No theme data reaches AppState/auth/backend.

Selectors appear in public/student/admin headers, standalone diagnostic, reader header and retained callback. Practice/simulator use their existing dashboard header control, avoiding duplicate selectors. Preferences apply document-wide, including errors/loading/404 even when a route has no local control. Both base paths are verified separately. No transition is added to theme switching; reduced-motion is preserved.

## Compatibility and exclusions

Existing --primary/--navy/--ink/--line/--cent-* names alias semantic values; source identifiers remain unchanged. Decorative gradients were removed from interface CSS; educational source backgrounds/canvas pixels/figures and provider colors are explicitly isolated. PDF pages are never inverted. Google SDK iframe styling and auth lifecycle are unchanged; retained code button keeps Google identity colors and a neutral provider surface.

## Accessibility evidence and limits

See [evidence summary](evidence/phase-1/evidence-summary.json) for actual computed semantic pairs and ratios; [rendered states](evidence/phase-1/rendered-states.json) for real selected/default/hover/disabled/focus observations. Interactive inputs/buttons use interactive borders; focus2px with3px offset. New selector minimum48px high and keyboard-operable. Disabled controls remain understandable but are not counted as AA contrast passes. Native mobile selected text may truncate; the option/accessibility name is complete.

This is not complete WCAG conformance. Legacy menu naming/expanded/focus issues, answer selected semantics, progress roles/text equivalents, small metadata, canvas reading alternatives and complete private-state coverage remain for later phases. Semantic token probes alone do not prove every rendered combination.


## Logo system — original-reference refinement

Both formerly missing assets are now reviewed: [original](../brand/logo-original-reference.png) is geometry authority, [board](../brand/brand-board-reference.png) and [recolored reference](../brand/logo-reference.png) inform identity; approved hex values and no-gradients override raster shading. All production SVGs use the same symmetric 45-degree paths, viewBox100 86 284 284, axis242. [Geometry manifest](evidence/phase-1/logo-review/geometry.json) records exact paths/colors/dimensions.

The original fit increases the upper band thickness, decreases the middle band thickness and raises the diamond relative to the first proposal. Silhouette widths248/150/74; total height245. No invented symbol or simplified favicon geometry. Light fills #A5B5A1/#4D687A/#29343C; dark #A5B5A1/#9CB8C9/#F5F7F7; monochrome #29343C; inverted #F5F7F7. Dark mapping was retained from Phase 1 and awaits owner approval. The favicon keeps its #F5F7F7 rounded tile, with SVG-derived32/180/192PNG exports.

Existing public header/footer and student/admin sidebar placements update through the same symbol assets; layout, live-text wordmark and screen-reader label remain unchanged. No tokens or typography changed in this follow-up. Wordmark SVG live text still depends on installed/fallback font; no outlined final typographic master is claimed. [Comparison](evidence/phase-1/logo-comparison.html) includes exact-size favicon review and original/recolored/board references. Owner acceptance remains pending.
