> Visually approved and closed by the owner at Phase 4 authorization. All documented technical limitations below remain retained. Phase 4 alone is authorized; see [Phase 4 report](PHASE_4_REPORT.md). Historical delivery and pending-approval wording below records the earlier state.

# Phase 3.1 — public presentation and Light/Dark follow-up

Completed 2026-11-19. Resumed from the existing Phase 3.1 source checkpoint; the earlier Phase 3 report and evidence remain historical. Ready for visual review. Phase 4 has not started.

## Delivered behavior

The homepage uses the supplied Colosseum artwork and transparent brush underline, with the headline «سردرگم نمون، هدفمند بخون.» mirrored in shared branding and metadata. Original PNGs remain unchanged. Local WebP derivatives preserve transparency: 363,292 bytes for the 1536×1024 hero and 82,666 bytes for the 2109×704 underline; quality 0.95. Only fully transparent exterior padding was removed from the underline. The hero is decorative and loads with high priority. [Asset record](evidence/phase-3-1/assets.json).

The existing public composition now includes subtle semantic Slate/Sage gradients, a two-column learning band, neutral benefit icons and a quieter login/registration presentation. The earlier no-gradient/SVG-only descriptions do not describe this revision. Current colors and gradients are presented for visual review; no new brand token or official Google-button styling was introduced. Existing future-exam unavailability wording and disabled cards remain visible even though the supplied decorative artwork lists multiple exams.

The shared appearance selector is now a 48px Sun/Moon button whose accessible Persian name describes the next action. Only Light and Dark are selectable. A new visitor's device preference is resolved and saved before React; existing explicit preferences persist. Legacy System/invalid values migrate once to the current device choice. Subsequent OS changes do not override the saved choice. Reload, navigation, cross-tab changes, clearing storage, blocked storage and keyboard operation are covered. The earlier System/live-OS behavior is superseded. The same shared control is consumed by existing public, dashboard, reader, assessment, callback and development-reference shells; this does not imply a redesign or exhaustive test of private workflows.

## Verification

| Check | Result |
| --- | --- |
| Unit tests | 148 passed in 8 files; resumed validation via npm test |
| TypeScript and production | npm run build passed, including tsc -b; /cent-s/ output in dist; root build passed in ignored .preview-artifacts/phase31-root |
| Appearance | 5 groups pass in development and compiled root, including startup, persistence, keyboard/focus, cross-tab, migration and blocked storage |
| Public pages | 6 groups, 112 responsive observations across seven widths and both themes, 44 existing solid-background contrast pairs per environment; development and compiled root pass |
| Gradient-aware contrast | 36 additional foreground/surface endpoint pairs per environment pass 4.5:1; this supplements the existing solid-background checks |
| Asset delivery | Both WebPs decode at their expected dimensions under /cent-s/ and /; exact copies present in both build outputs |
| Mock authentication | 75 successful scenario executions: 16 GIS + 9 code/password scenarios for development light, development dark and compiled root |
| Focused lint | 18 files, zero errors or warnings; broader legacy lint debt was not re-audited in this continuation |
| Protected boundaries | 35 protected hashes unchanged; supplied originals, auth state/effects/submission, course access logic, package/config/security headers and original main startup preserved |
| Evidence | 53 final development captures; 8 matched home/login comparisons in the new review index |

[Review index](evidence/phase-3-1/index.html), [development results](evidence/phase-3-1/public-development-final-result.json), [root results](evidence/phase-3-1/public-root-result.json), [gradient development](evidence/phase-3-1/presentation-development-result.json), [gradient root](evidence/phase-3-1/presentation-root-result.json), [appearance development](evidence/phase-3-1/appearance-development-result.json), [appearance root](evidence/phase-3-1/appearance-root-result.json), [lint](evidence/phase-3-1/focused-lint-final.json), [delivery verification](evidence/phase-3-1/delivery-verification.json), [root build log](evidence/phase-3-1/build-root.log). Unit/default-build results above were observed directly during the continuation; separate full output logs were not saved.

The gradient audit initially sampled unsettled inherited colors and a temporary probe incorrectly; these helper failures are retained in the initial failure JSON and logs. The final helper waits for the loaded page and resolves existing semantic surface tokens directly. No product CSS was changed to satisfy the audit. These endpoint checks cover the current gradient compositions, not arbitrary imagery or comprehensive accessibility certification.

## Scope and remaining limits

Work stays uncommitted and unstaged on local main at 8e87191. No push, deployment, migration, backend repository access/source build/edit or production connection. The existing frontend-local Cent.Preview binary was restarted in its original directory, its DEVELOPMENT_MOCK status verified, and public checks used read-only GETs. Authentication suites use synthetic SDK/API fixtures with no real credentials. The task-owned preview services are stopped after validation; run the existing local development setup to review live pages, or open the saved index directly.

Real Google OAuth/signatures/FedCM, production configuration, external payments, complete WCAG/assistive-technology and cross-browser coverage remain unverified. Previously documented study-return synchronization, math: recommendation labels, protected/private/reader/timeout/destructive coverage and legacy lint debt remain deferred. No fresh backend-test claim is made. Visual acceptance of the revised homepage, gradients, auth presentation and shared toggle remains pending; Phase 4 requires separate authorization.
