/* global console */
import fs from 'node:fs'
import assert from 'node:assert/strict'

const out = 'docs/refinement/evidence/phase-3-1/'
const read = name => JSON.parse(fs.readFileSync(out + name))
const readLog = name => {
  const bytes = fs.readFileSync(out + name)
  return bytes.toString(bytes[0] === 0xff && bytes[1] === 0xfe ? 'utf16le' : 'utf8')
}
for (const file of ['public-development-final-result.json', 'public-root-result.json', 'presentation-development-result.json', 'presentation-root-result.json', 'appearance-development-result.json', 'appearance-root-result.json', 'delivery-verification.json']) {
  assert.equal(read(file).success, true, file)
}
const lint = read('focused-lint-final.json')
assert.equal(lint.reduce((sum, file) => sum + file.errorCount + file.warningCount, 0), 0)
for (const name of ['gis-light', 'gis-dark', 'gis-root']) assert.match(readLog(name + '.log'), /GIS browser checks passed \(16 scenarios\)/)
for (const name of ['auth-light', 'auth-dark', 'auth-root']) assert.match(readLog(name + '.log'), /Google auth browser checks passed \(9 scenarios\)/)

const pairs = []
for (const page of ['home', 'login']) for (const theme of ['light', 'dark']) for (const width of [390, 1440]) {
  const file = `after-${page}-${theme}-${width}.png`
  assert.ok(fs.existsSync(out + file))
  assert.ok(fs.existsSync('docs/refinement/evidence/phase-3/' + file))
  pairs.push(`<article><h2>${page} · ${theme} · ${width}px</h2><div class="pair"><figure><figcaption>Phase 3 delivery</figcaption><a href="../phase-3/${file}"><img loading="lazy" src="../phase-3/${file}" alt="Previous ${page}, ${theme}, ${width} pixels"></a></figure><figure><figcaption>Phase 3.1 revision</figcaption><a href="${file}"><img loading="lazy" src="${file}" alt="Current ${page}, ${theme}, ${width} pixels"></a></figure></div></article>`)
}
fs.writeFileSync(out + 'index.html', `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Itatest · Phase 3.1 review</title><style>body{margin:0;padding:24px;font:16px/1.6 system-ui;color:#29343c;background:#f5f7f7}main{max-width:1400px;margin:auto}h1{font-size:28px}h2{font-size:20px}article{margin:32px 0;padding:20px;background:white;border:1px solid #e0e4e6;border-radius:16px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;min-width:0}figcaption{margin-bottom:12px}img{display:block;width:100%;height:auto;border:1px solid #e0e4e6}a{color:#3d5667}@media(max-width:700px){body{padding:12px}.pair{grid-template-columns:1fr}article{padding:12px}}</style><main><h1>Phase 3.1 · Public presentation and appearance</h1><p>Eight matched comparisons of the delivered Phase 3 pages and the revised homepage/auth presentation. Click an image for its original size. Current pages use actual public GETs from the isolated local Development preview. Login shows the actual unavailable-Google fallback; it is not a real provider sign-in.</p><p><a href="../../PHASE_3_1_REPORT.md">Delivery report</a> · <a href="public-development-final-result.json">Development checks</a> · <a href="public-root-result.json">Compiled-root checks</a></p><p>All 53 final captures are listed in the development result. HTTP 401/503 images deliberately inject failures; synthetic Google checks are separately identified. Earlier review-*.png files are intermediate inspection captures and may contain loading states.</p>${pairs.join('\n')}</main></html>`)

const report = `# Phase 3.1 — public presentation and Light/Dark follow-up

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
| Focused lint | ${lint.length} files, zero errors or warnings; broader legacy lint debt was not re-audited in this continuation |
| Protected boundaries | 35 protected hashes unchanged; supplied originals, auth state/effects/submission, course access logic, package/config/security headers and original main startup preserved |
| Evidence | 53 final development captures; 8 matched home/login comparisons in the new review index |

[Review index](evidence/phase-3-1/index.html), [development results](evidence/phase-3-1/public-development-final-result.json), [root results](evidence/phase-3-1/public-root-result.json), [gradient development](evidence/phase-3-1/presentation-development-result.json), [gradient root](evidence/phase-3-1/presentation-root-result.json), [appearance development](evidence/phase-3-1/appearance-development-result.json), [appearance root](evidence/phase-3-1/appearance-root-result.json), [lint](evidence/phase-3-1/focused-lint-final.json), [delivery verification](evidence/phase-3-1/delivery-verification.json), [root build log](evidence/phase-3-1/build-root.log). Unit/default-build results above were observed directly during the continuation; separate full output logs were not saved.

The gradient audit initially sampled unsettled inherited colors and a temporary probe incorrectly; these helper failures are retained in the initial failure JSON and logs. The final helper waits for the loaded page and resolves existing semantic surface tokens directly. No product CSS was changed to satisfy the audit. These endpoint checks cover the current gradient compositions, not arbitrary imagery or comprehensive accessibility certification.

## Scope and remaining limits

Work stays uncommitted and unstaged on local main at 8e87191. No push, deployment, migration, backend repository access/source build/edit or production connection. The existing frontend-local Cent.Preview binary was restarted in its original directory, its DEVELOPMENT_MOCK status verified, and public checks used read-only GETs. Authentication suites use synthetic SDK/API fixtures with no real credentials. The task-owned preview services are stopped after validation; run the existing local development setup to review live pages, or open the saved index directly.

Real Google OAuth/signatures/FedCM, production configuration, external payments, complete WCAG/assistive-technology and cross-browser coverage remain unverified. Previously documented study-return synchronization, math: recommendation labels, protected/private/reader/timeout/destructive coverage and legacy lint debt remain deferred. No fresh backend-test claim is made. Visual acceptance of the revised homepage, gradients, auth presentation and shared toggle remains pending; Phase 4 requires separate authorization.
`
fs.writeFileSync('docs/refinement/PHASE_3_1_REPORT.md', report)

const current = `# Current follow-up — Phase 3.1 delivered for review

The resumed public presentation and shared appearance follow-up is complete. The supplied Colosseum/underline assets, revised headline, semantic gradients, learning-band/auth composition and two-state Sun/Moon toggle supersede the earlier SVG-only, no-gradient and System-selector descriptions below. Device preference is resolved once and persisted; live OS following is no longer offered. Phase 4 has not started.

Verified: 148 unit tests; both production bases; 75 mocked auth executions; 5 appearance groups, 112 public responsive observations and 36 gradient endpoint contrast pairs per environment. Focused lint is clean. Work remains local, unstaged and uncommitted; real provider/production/payment/full accessibility and the recorded legacy limitations remain unverified or deferred. See [current report](PHASE_3_1_REPORT.md) and [eight matched comparisons](evidence/phase-3-1/index.html). Earlier records below are preserved history.

---

`
for (const name of ['PROGRAM_STATUS.md', 'PROGRAM_BRIEF.md', 'IMPLEMENTATION_PLAN.md', 'DECISION_LOG.md', 'DESIGN_SYSTEM.md', 'UX_WRITING.md', 'ACCEPTANCE_CRITERIA.md', 'AUDIT_COVERAGE.md', 'REGRESSION_REPORT.md', 'VISUAL_REVIEW.md', 'OPEN_QUESTIONS.md', 'COMPONENT_INVENTORY.md', 'COMPONENT_USAGE_GUIDE.md', 'FEEDBACK_PATTERNS.md']) {
  const file = 'docs/refinement/' + name
  const prior = fs.readFileSync(file, 'utf8')
  if (!prior.startsWith('# Current follow-up — Phase 3.1')) fs.writeFileSync(file, current + prior)
}
const priorReport = 'docs/refinement/PHASE_3_REPORT.md'
const previous = fs.readFileSync(priorReport, 'utf8')
if (!previous.startsWith('> Historical delivery')) fs.writeFileSync(priorReport, '> Historical delivery record. The current Phase 3.1 revision and verification are documented in [PHASE_3_1_REPORT.md](PHASE_3_1_REPORT.md).\n\n' + previous)
const brandFile = 'docs/brand/README.md'
const brandPrior = fs.readFileSync(brandFile, 'utf8')
if (!brandPrior.startsWith('# Phase 3.1 artwork')) fs.writeFileSync(brandFile, '# Phase 3.1 artwork and presentation\n\nThe supplied hero-colosseum.png and hero-underline.png are preserved originals. Local transparency-preserving WebP derivatives are shipped in public/images. The current headline is «سردرگم نمون، هدفمند بخون.»; the public presentation includes semantic gradients. Earlier SVG-only/no-gradient descriptions below are historical. See [current report](../refinement/PHASE_3_1_REPORT.md) and [asset metadata](../refinement/evidence/phase-3-1/assets.json).\n\n---\n\n' + brandPrior)
fs.writeFileSync(out + 'README.md', '# Phase 3.1 review evidence\n\nOpen [matched comparisons](index.html) or the [report](../../PHASE_3_1_REPORT.md). The 53 final screenshots listed in public-development-final-result.json use actual isolated local public GETs; auth-error/resource-error captures explicitly inject HTTP 401/503. Google logs use synthetic SDK/API fixtures. review-* images are intermediate inspections and may contain loading states. The source checkpoint, original artwork hashes and earlier evidence are retained.\n\nAppearance results cover the new Light/Dark contract. Presentation results add gradient endpoint contrast coverage to the existing public suite. Initial helper failures are retained and are not counted as passing. Broader historical limitations remain as recorded in the report.\n')
console.log('Phase 3.1 report, current document notices and eight matched comparisons written')
