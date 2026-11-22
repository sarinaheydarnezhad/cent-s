import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
const directory='docs/refinement/evidence/phase-1'
const read=name=>JSON.parse(fs.readFileSync(`${directory}/${name}`,'utf8'))
const captures=read('screenshots.json'),review=read('foundation-review.json'),rendered=read('rendered-states.json'),summary=read('evidence-summary.json')
const rootGIS=read('root-google-gis.json'),rootCode=read('root-google-auth.json')
const differences=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n')
const initialLint=read('baseline-authored-lint.json'),finalLint=read('final-authored-lint.json')
const diagnostics=rows=>rows.flatMap(row=>row.messages.map(m=>({file:row.filePath.replaceAll('\\','/'),rule:m.ruleId,message:m.message.split('\n\n')[0]}))).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
const protectedFiles=['src/App.tsx','src/state/AppState.tsx','src/components/GoogleSignIn.tsx','src/services/cent.ts','src/services/google-auth.ts','src/services/google-identity.ts','src/services/google-identity-api.ts','src/services/google-identity-sdk.ts','src/services/scoring.ts','public/_headers','vite.config.ts','package.json','package-lock.json','tests/browser/check-study-return.mjs']
const protectedHashes=protectedFiles.map(file=>{const before=execFileSync('git',['show',`HEAD:${file}`]);const current=fs.readFileSync(file);const normalized=value=>value.toString().replaceAll('\r\n','\n');return{file,unchanged:normalized(before)===normalized(current),sha256:crypto.createHash('sha256').update(current).digest('hex')}})
const backendStatus=execFileSync('git',['-c','safe.directory=D:/Lerona/Backend','-C','D:/Lerona/Backend','status','--short'],{encoding:'utf8'}).trim()
const final={branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),trackedModified:differences,staged:execFileSync('git',['diff','--cached','--name-only'],{encoding:'utf8'}).trim(),backendStatus,protectedHashes,authoredBaselineErrors:initialLint.reduce((s,x)=>s+x.errorCount,0),authoredFinalErrors:finalLint.reduce((s,x)=>s+x.errorCount,0),sameAuthoredDiagnostics:JSON.stringify(diagnostics(initialLint))===JSON.stringify(diagnostics(finalLint)),mainScreenshots:captures.screenshots.length,responsiveCases:review.responsive.length+rendered.responsive.length,overflow:[...review.responsive,...rendered.responsive].filter(x=>x.overflow),pageErrors:[...captures.errors,...review.errors,...rendered.errors],semanticColorPairs:summary.contrast.length,colorFailures:summary.contrastFailures,renderedStateObservations:rendered.states.length,fonts:rendered.fonts,rootMockAuthScenarios:rootGIS.passed.length+rootCode.passed.length}
fs.writeFileSync(`${directory}/final-verification.json`,JSON.stringify(final,null,2))
const screenshotRows=[...captures.screenshots.map(s=>({name:s.file,route:s.route,width:s.width,theme:s.theme,kind:'Real isolated preview, no response mocks'})),...['light','dark'].flatMap(theme=>[390,1440].map(width=>({name:`results-${theme}-${width}.png`,route:'Saved backend-confirmed assessment result; progress fixture',width,theme,kind:'Real isolated preview'}))),...['light','dark'].map(theme=>({name:`assessment-selected-${theme}-390.png`,route:'Active diagnostic, selected answer',width:390,theme,kind:'Real isolated preview'}))]
const screenshotTable='| Actual page/state | Width | Theme | Evidence |\n| --- | --- | --- | --- |\n'+screenshotRows.map(s=>`| ${s.route} | ${s.width} | ${s.theme} | [${s.name}](evidence/phase-1/${s.name}) |`).join('\n')
const files=['public/appearance.js','src/components/AppearanceControl.tsx','src/foundations.css','src/foundation-ui.css','src/services/appearance.test.ts','tests/browser/check-appearance.mjs','tests/browser/run-themed-auth.mjs']
const report=`# Phase 1 — brand foundations and dual-theme architecture

## 1. Executive summary

**Implementation completed for owner review. Final visual acceptance is pending.** Itatest branding, provisional SVG variants, semantic colors, local typography and Light/Dark/System preferences are implemented in the existing React/TypeScript/Vite frontend. No page restructure, new business feature, backend change or Phase 2 work was performed. Conditional Phase 0 acceptance and its defects remain explicit.

## 2. Git branch and working tree

Frontend branch: **${final.branch}**, HEAD c8df574. Initial state: only untracked docs/; existing assets/documents preserved. ${differences.length} tracked files modified; additional source/assets/docs are untracked. Nothing staged, committed or pushed. No branch creation/switch or history change. Shared backend HEAD87525a7; final tracked/untracked Git status is clean. Ignore entry .preview-artifacts/ keeps temporary backend compilation/test data out of Git.

## 3. Post-GIS baseline

[Checkpoint](POST_GIS_CHECKPOINT.md) distinguishes this from Phase 0. Both expected commits are in history. Frontend114/114 unit tests and production/TypeScript build passed before UI edits; isolated16GIS+9code/password scenarios passed. Authored lint93 existing errors; completed global lint154 including historical audit helpers. Existing backend test binaries: Cent108 passed; Lerona396 passed/3 existing skips. TRX files in [Cent results](evidence/phase-1/backend-cent/) and [Lerona results](evidence/phase-1/backend-lerona/). They are explicitly prebuilt-assembly checks, not a fresh backend test build.

Existing preview executable was stale (discovery404). Current Cent.Preview source built to frontend-local ignored artifacts and runs against copied isolated SQLite data, reporting DEVELOPMENT_MOCK. Current-source discovery works and authoritatively disables Google locally. Courses/curriculum/progress checkpoint passes. Initial stale/overlapping smoke failures (404/429) are retained; sequential final smoke passes. No critical auth/shared-backend source regression was established. No migration/upgrade flags or provider configuration were changed. Cached NuGet restore emitted NU1900 because vulnerability feed was unavailable; no clean dependency vulnerability audit is claimed.

## 4. Implementation summary

One early public appearance owner; semantic token mappings and compatibility aliases for existing CSS; flat interface surfaces; restrained light shadows/no dark shadows; common48px control and focus foundations; labeled native appearance selectors in current shells; local fonts; platform metadata/Brand/favicon. Existing breakpoints, routes and code splitting remain. Source/persistence algorithms are untouched.

## 5. Files created and modified

New core files:

${files.map(file=>`- [${file}](../../${file})`).join('\n')}

Modified tracked files:

${differences.map(file=>`- [${file}](../../${file})`).join('\n')}

New assets: [brand directory](../../public/brand/) (primary/dark wordmarks, standalone light/dark symbols, monochrome/inverted, SVG favicon and32/180/192PNG icons); [font directory](../../public/fonts/) (official Inter WOFF2, SIL license and provenance). All required program documents updated; this report/checkpoint and evidence added. Historical Phase0 evidence preserved. One-time migration/capture helpers live only under documentation and are not production routes or bundles.

## 6. Public brand identity

Shared header/footer/sidebar marks, accessible home link, account/auth/admin platform labels, browser title, description, site-name/social metadata and favicon use Itatest/ایتاتست. Approved tagline is displayed. Actual exam CEnT-S remains. Cent class/module/API/env/storage identifiers and old asset compatibility are retained. No IMAT/SAT routes, products or future claims were added.

## 7. Theme architecture and behavior

Parser-blocking same-origin appearance.js runs in head before application modules. It resolves data-theme, color-scheme, initial background and theme-color, so the page is dark even if React entry fails. One localStorage key itatest:appearance:v1 stores light/dark/system. Absent/invalid values use OS appearance. Live matchMedia updates apply only in system; storage events sync other tabs; blocked storage falls back to in-memory use. React subscribes via useSyncExternalStore. Native select labels: ظاهر, روشن, تاریک, مطابق تنظیمات دستگاه. Public/student/admin headers and standalone diagnostic/reader/callback expose it; practice/simulator reuse dashboard control. No backend/auth state dependency or global inversion. Reduced motion retained; no new theme animation.

Nine appearance browser check groups pass on /cent-s development and compiled / root. Ten unit cases cover resolution, persistence, invalid/blocked storage, explicit overrides, live OS changes, subscriptions and storage events. Startup evidence proves initial background/attribute before React; it is not a frame-by-frame production paint trace.

## 8. Implemented light tokens

Page#F5F7F7, surface/elevated#FFFFFF, subtle#EDF1F2; text#29343C, secondary/muted#5E6D77; border#E0E4E6, interactive border#758793. Action#4D687A/white; hover#3D5667, pressed#304959. Secondary action#A5B5A1/#29343C. Selected#E8EEE6/#344D32. Success#486644 on#E8EEE6; warning#79551C on#F8F0E2; error#A33E3E on#F8EAEA; info#3D5667 on#E7EEF2. Focus#3D5667; progress#557451. Five approved core brand colors are exact. Supporting candidates were darkened for reliable normal-text contrast. [Complete actual token table](DESIGN_SYSTEM.md) includes disabled, overlays, skeletons, charts, links, inputs, strong surfaces and all dimensions.

## 9. Implemented dark tokens

Page#182127, surface#222D35, elevated/subtle#2B3841; text#F5F7F7, secondary/muted#B7C3CA; border#3C4A53, interactive border#8296A3. Action#9CB8C9/#182127; hover#B1C8D5, pressed#8DAABA. Secondary#A5B5A1/#182127; selected#303D34/#C6D8C2. Success#A8C6A2 on#303D34; warning#E2BC78 on#403728; error#F0A3A3 on#442F34; info#9CB8C9 on#2C3D49. Focus#9CB8C9; progress#A5B5A1. Shadows none. This remains a proposed visual implementation requiring owner review, not a newly declared immutable brand palette.

## 10. Typography and visual foundations

Local Vazirmatn400/500/600/700/800; previous900 declarations mapped to800. Inter variable locally hosted for Latin brand/interface fields, with SIL1.1 license, SHA256 and source URLs in font README; no dependency or font CDN. Body16px/1.8, page28px, section foundation22px, hero40px max, card16px, label14px. Existing tiny metadata remains a later-phase issue. Math/science/PDF rendering preserved. Spacing4/8/12/16/24/32/48/64; controls48px; radius8/12/16/24/pill; focus2px/3px offset. Existing content-driven responsive breakpoints retained. Not every legacy page spacing/radius/layer was standardized.

Bundle cost: post-GIS baseline CSS81.80KB gzip17.04 and appJS127.77KB gzip34.90; final default CSS100.94KB gzip18.86 and appJS129.10KB gzip35.28. Root build CSS100.72KB/appJS129.05KB differs in base-path lengths. Inter adds one ~344KiB local variable font; real600/800 Vazirmatn weights add local subset assets. Font loading is swap and language/range based. No Web Vitals/Lighthouse or blanket performance claim.

## 11. Logo assets and comparison

[Visual comparison](evidence/phase-1/logo-comparison.png), [review HTML](evidence/phase-1/logo-comparison.html), [SVG symbol](../../public/brand/symbol.svg). Flat paths reconstruct the supplied sage large chevron/slate smaller chevron/charcoal diamond; no gradient, extra symbol or redesign. Dark lower form uses off-white and middle light slate for visibility. Exact geometry/wordmark/dark variant remain provisional. Wordmark SVG retains live text/fallback rather than claiming an outlined final master. Main app wordmark uses the local Inter font.

Missing files named by the brand README: logo-original-reference.png and brand-board-reference.png. The comparison uses the supplied logo-reference.png only. Please provide missing originals for exact comparison, or confirm that supplied PNG should be the geometry source. No inaccessible file is represented as reviewed.

## 12. Actual screenshot evidence

${captures.screenshots.length} main real backend-connected captures plus four saved-results and two selected-answer captures. Native Google discovery is disabled locally; main login screenshots truthfully show that state. Separate [mock light GIS](evidence/phase-1/gis-mock-light-390.png) and [mock dark GIS](evidence/phase-1/gis-mock-dark-390.png) use synthetic SDK/API responses and are not real Google UI/provider evidence. [Before/light/dark comparison](evidence/phase-1/visual-comparisons.html) preserves actual Phase0 shots and labels differing local data/API availability. [Screenshot manifest](evidence/phase-1/screenshots.json). No generated mockups.

${screenshotTable}

## 13. Accessibility

${summary.contrast.length} measured computed semantic pairs meet applicable4.5text/3control targets; [ratios](evidence/phase-1/evidence-summary.json). ${rendered.states.length} actual selector/default/selected/hover/disabled/focus observations in [rendered state evidence](evidence/phase-1/rendered-states.json); disabled controls are not counted as AA contrast passes. New select has real associated label/native keyboard behavior,48px height and visible focus; startup/blocked-storage/reduced-motion are supported. Interactive borders strengthened; selected letter foreground corrected for dark. PDF/source sheets stay light with appropriate text, diagrams unaffected.

Not full WCAG2.2AA certification: legacy menu expanded/name/focus behavior, answer selected semantics, progress semantics, tiny labels and canvas alternatives remain deferred. No comprehensive screen-reader/axe/dialog/all-state audit was done. Layout/semantic-token tests do not prove all rendered contrasts.

## 14. Responsive findings

${final.responsiveCases} actual page/theme/width observations at320/375/390/768/1024/1280/1440 across home/login/dashboard/account/diagnostic setup/catalog/results/reader/admin; ${final.overflow.length} document overflow observations. Additional active assessment screenshots at390/1440. New controls remain usable; mobile system label may truncate inside the closed native select, while options/accessibility text remain complete. Existing mobile hierarchy, dense reader controls, table scrolling and navigation focus need later phases. No essential function was hidden to pass width checks.

## 15. Google authentication protection

GIS SDK component/services, token/challenge transport, session/AppState, retained code flow, router/Vite and security headers match HEAD (normalized line endings). Callback page changed only brand copy and an appearance control. Provider iframe remains untouched; code button retains official multicolor mark/neutral styling. Password/backend sessions and protected resource access exercised normally. Final auth:25 mock scenarios in development light +25dark +25compiled root =75 executions; checkpoint25 separately. Real Google UI, signatures, FedCM/consent, production CORS/config/headers remain unverified. No real provider credentials or settings were used/changed.

## 16. Test, lint, TypeScript and build results

| Verification | Actual result/evidence |
| --- | --- |
| npm.cmd test |124 passed,7files; [log](evidence/phase-1/final-unit-frozen.log) |
| npm.cmd run build (tsc -b included) |Passed default and root builds; [root log](evidence/phase-1/root-build.log); final default build log retained separately |
| Authored ESLint src/scripts/config/browser |93 existing errors,0warnings; [JSON](evidence/phase-1/final-authored-lint.json); diagnostics unchanged ignoring line shifts |
| npm.cmd run lint |Completed,154 existing errors incl historical helpers; [log](evidence/phase-1/final-global-lint-verified.log); not a pass |
| New application/evidence/test code lint |Zero errors/warnings; [JSON](evidence/phase-1/new-code-lint-final.json) |
| Appearance browser |9 check groups pass on development/root; [root](evidence/phase-1/root-appearance.json) |
| GIS/code/password mocked browser |16+9 each dev theme and root; [root GIS](evidence/phase-1/root-google-gis.json), [root code](evidence/phase-1/root-google-auth.json), per-theme logs retained |
| Existing connected smoke |Passed; [log](evidence/phase-1/final-smoke-semantic-selector.log) |
| Connected courses/curriculum/progress |Passed; final-courses.log, final-curriculum.log, final-progress.log in evidence directory |
| Qualified notes/recovery |Passed; [notes](evidence/phase-1/phase1-safe-notes-result.json), [recovery](evidence/phase-1/phase1-targeted-recovery-result.json). Copies preserve prior safe exclusions; injected503 conditions labeled. Original destructive/arbitrary-account variants not run |
| Backend existing binaries |Cent108 passed; Lerona396 passed/3skipped, not fresh source rebuild |
| git diff --check / boundaries |Passed; [final boundary verification](evidence/phase-1/final-verification.json) |

## 17. Baseline versus regressions

Phase0=61 unit/9mock code; post-GIS=114unit/25mock; Phase1=124unit/75final mock executions. Authored lint stays93; global154 includes61prior evidence-helper errors. New-code lint is clean; no rule disabled. Fixed within scope: asset double-base handling, test-only Node typing, migrated foreground/sidebar contrast, selector ambiguity and favicon test strictness. Failed intermediate logs remain; initial repeated-handler smoke output preserved compressed with a readable failure excerpt. Original study-return and recommendation math: text remain unchanged. No newly established critical functional regression remains; coverage limits prevent blanket regression signoff.

## 18. Shared backend / Lerona protection

Backend source/config/schema/migrations/dependencies and Lerona are untouched; Git status clean. Backend compilation output is frontend-local and ignored. The first owned stale preview used its existing isolated test DB; final runtime uses a frontend-local copy. Only local API test fixtures/mock orders/notes/attempts changed. No production DB, migrations, real payment, unrelated service, destructive operation or user-owned process termination. Existing binary test evidence is scoped explicitly. No deployment/publish/commit/push.

## 19. Remaining limitations / blockers

Owner visual review is required for logo/dark appearance. Two separately named reference images are missing. Real Google/provider/production delivery unavailable; external payment states/timeouts/destructive operations/full accessibility not verified. Backend binary tests are not a fresh full shared source build. NU1900 prevented vulnerability metadata retrieval. No runtime font CDN, new dependency or application-backend coupling was introduced.

## 20. Deferred issues

Study-return synchronization (Phase6); exposed math: recommendation prefixes (Phases4/5); richer selected/progress/menu accessibility and reusable feedback/components (Phase2 onward); page hierarchy/small metadata/table/reader density and exhaustive theme states in their page phases. Protected assessment answer-count/expiry/payment request sequencing findings require separate approval if behavior changes are proposed. No unrelated lint remediation.

## 21. Owner decisions

1. Approve/revise provisional symbol geometry, wordmark and dark/monochrome variants; provide missing original references or confirm available PNG as source.
2. Approve/revise dark visual appearance and supporting token adjustments against actual screenshots.
3. Accept Phase1 with explicit known limits, or request scoped revisions. Phase2 requires separate explicit authorization.

## 22. Phase 1 acceptance readiness

**Ready for owner visual/implementation review, not finally accepted.** Functional foundations and scoped evidence are delivered; baseline failures and unverified states remain visible. No commit, push or deployment. Local development frontend and isolated preview remain available for review; the temporary compiled-root preview was stopped after verification.

## 23. Proposed Phase 2 scope

Extend existing UI.tsx/CentUI.tsx for reusable button/form/card/notice/tab/table/progress states, semantic selection/errors, keyboard/focus and development-only component review. No new framework/backend work, no page restructuring or scoring/reader/commerce algorithm changes. Stop here; no Phase2 implementation is authorized or started.
`
fs.writeFileSync('docs/refinement/PHASE_1_REPORT.md',report)
fs.writeFileSync(`${directory}/README.md`,'# Phase 1 evidence\n\nStart with [Phase 1 report](../../PHASE_1_REPORT.md). Main screenshots are actual local preview without response mocking. Saved-results/selected-answer renders are supplemental. GIS images are explicitly mocked. Historical failures remain; compressed baseline smoke preserves repeated original output. Helpers are audit/development artifacts, not production code or routes.\n\n'+screenshotTable.replaceAll('(evidence/phase-1/','(')+'\n')
