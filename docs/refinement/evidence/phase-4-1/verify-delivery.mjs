/* global console */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const folder = 'docs/refinement/evidence/phase-4-1/'
const normalize = value => value.replace(/\r\n/g, '\n')
const current = path => normalize(readFileSync(path, 'utf8'))
const git = (...args) => normalize(execFileSync('git', args, { encoding: 'utf8' }))
const head = path => git('show', `HEAD:${path}`)
const protectedFiles = ['src/App.tsx', 'src/state/AppState.tsx', 'src/services/cent.ts', 'src/services/scoring.ts', 'src/services/study-return.ts', 'src/pages/StudyReader.tsx', 'src/pages/PersonalResults.tsx', 'src/pages/LearningProgress.tsx', 'src/components/ProtectedRoute.tsx', 'src/components/useNavigationDisclosure.ts', 'src/components/GoogleSignIn.tsx', 'src/components/Brand.tsx', 'src/pages/public/LoginPage.tsx', 'src/pages/public/GoogleCallbackPage.tsx', 'public/appearance.js', 'public/_headers', 'package.json', 'package-lock.json', 'vite.config.ts', 'src/foundations.css', 'src/foundation-ui.css', 'src/public.css', 'src/styles.css', 'src/cent.css', 'src/pages/admin/CentAdmin.tsx']
const hashes = {}
for (const path of protectedFiles) {
  assert.equal(current(path), head(path), path)
  hashes[path] = createHash('sha256').update(readFileSync(path)).digest('hex')
}
const appearance = current('src/components/AppearanceControl.tsx').replace('<Sun key="sun" size={20}', '<Sun size={21}').replace('<Moon key="moon" size={20}', '<Moon size={21}')
assert.equal(appearance, head('src/components/AppearanceControl.tsx'))
const practice = current('src/pages/PracticePages.tsx'), originalPractice = head('src/pages/PracticePages.tsx')
assert.equal(practice.slice(practice.indexOf('export function CentExamPage')), originalPractice.slice(originalPractice.indexOf('export function CentExamPage')))
const commerce = current('src/pages/CommercePages.tsx'), originalCommerce = head('src/pages/CommercePages.tsx')
assert.equal(commerce.slice(commerce.indexOf('export function CatalogPage'), commerce.indexOf('export function AccountPage')), originalCommerce.slice(originalCommerce.indexOf('export function CatalogPage'), originalCommerce.indexOf('export function AccountPage')))
const account = commerce.slice(commerce.indexOf('export function AccountPage')), originalAccount = originalCommerce.slice(originalCommerce.indexOf('export function AccountPage'))
assert.equal(account.slice(0, account.indexOf('  return')), originalAccount.slice(0, originalAccount.indexOf('  return')))
assert.equal(account.slice(account.indexOf('<section className="cent-membership">')), originalAccount.slice(originalAccount.indexOf('<section className="cent-membership">')))
assert.equal(git('diff', '--cached', '--name-only'), '')
assert.ok(git('rev-parse', 'HEAD').trim().startsWith('1ed76ee'))
assert.equal(git('branch', '--show-current').trim(), 'main')
git('-c', 'core.safecrlf=false', 'diff', '--check')
const dashboard = current('src/pages/StudentDashboard.tsx')
assert.ok(!/localStorage|sessionStorage|centRequest|fetch\(/.test(dashboard))
for (const phrase of ['سردرگم نمون، هدفمند بخون.', 'از همان‌جایی که مانده بودی، ادامه بده']) assert.ok(dashboard.includes(phrase))
for (const path of ['dist', '.preview-artifacts/phase41-root']) {
  assert.ok(existsSync(`${path}/index.html`))
  assert.equal(readFileSync(`${path}/_headers`, 'utf8'), readFileSync('public/_headers', 'utf8'))
  assert.equal(existsSync(`${path}/component-reference.html`), false)
  assert.equal(existsSync(`${path}/docs`), false)
  for (const asset of ['brand/symbol.svg', 'brand/symbol-dark.svg', 'images/hero-colosseum.webp', 'images/hero-underline.webp']) assert.deepEqual(readFileSync(`${path}/${asset}`), readFileSync(`public/${asset}`))
}
writeFileSync(folder + 'delivery-verification.json', JSON.stringify({ success: true, head: git('rev-parse', 'HEAD').trim(), protectedFiles: hashes, checks: ['25 protected files match HEAD', 'Theme implementation matches HEAD except decorative SVG keys and 21→20px size', 'Assessment/result/simulator functions, commerce/library/notes, account hooks and transaction markup preserved', 'No dashboard persistence or new requests/contracts', 'Both builds preserve flat logo/assets/security headers and exclude dev reference/documentation', 'No staged files or new commit; local main remains at owner checkpoint; no push/deploy/Phase 5'] }, null, 2))
console.log('Phase 4.1 delivery boundaries verified.')
