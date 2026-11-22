/* global console */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const normalize = value => value.replace(/\r\n/g, '\n')
const git = (...args) => normalize(execFileSync('git', args, { encoding: 'utf8' }))
const current = path => normalize(readFileSync(path, 'utf8'))
const head = path => git('show', `HEAD:${path}`)
const protectedFiles = ['src/services/cent.ts', 'src/services/scoring.ts', 'src/services/study-return.ts', 'src/services/learning-presentation.ts', 'src/state/AppState.tsx', 'src/types.ts', 'src/pages/CommercePages.tsx', 'src/pages/StudyReader.tsx', 'src/pages/StudentDashboard.tsx', 'src/pages/CourseCatalog.tsx', 'src/pages/admin/CentAdmin.tsx', 'src/components/UI.tsx', 'src/components/CentUI.tsx', 'src/components/ProtectedRoute.tsx', 'src/components/Brand.tsx', 'src/components/AppearanceControl.tsx', 'src/components/DashboardLayout.tsx', 'src/components/useNavigationDisclosure.ts', 'src/components/GoogleSignIn.tsx', 'src/pages/public/LoginPage.tsx', 'src/pages/public/GoogleCallbackPage.tsx', 'src/pages/public/DiagnosticIntroPage.tsx', 'src/foundations.css', 'src/foundation-ui.css', 'src/student.css', 'src/public.css', 'src/styles.css', 'src/cent.css', 'public/appearance.js', 'public/_headers', 'package.json', 'package-lock.json', 'vite.config.ts']
const hashes = {}
for (const path of protectedFiles) { assert.equal(current(path), head(path), path); hashes[path] = createHash('sha256').update(readFileSync(path)).digest('hex') }
const practice = current('src/pages/PracticePages.tsx'), original = head('src/pages/PracticePages.tsx')
assert.equal(practice.slice(practice.indexOf('export function CentExamPage'), practice.indexOf('  return <ExamExperience')), original.slice(original.indexOf('export function CentExamPage'), original.indexOf('  const question = attempt?.questions[index]')))
const results = current('src/pages/PersonalResults.tsx'), previous = head('src/pages/PersonalResults.tsx')
assert.equal(results.slice(results.indexOf('async function loadResults'), results.indexOf('  return <div')), previous.slice(previous.indexOf('async function loadResults'), previous.indexOf('  return <>')))
assert.equal(current('src/App.tsx').replace("import { ReadinessPage } from './pages/ReadinessPage'\n", '').replace('<Route path="preparation" element={<ReadinessPage/>}/>', '<Route path="preparation" element={<LibraryPage/>}/>'), head('src/App.tsx'))
assert.equal(current('src/main.tsx').replace("import './assessment.css'\n", ''), head('src/main.tsx'))
for (const path of ['src/pages/ReadinessPage.tsx', 'src/pages/AssessmentResults.tsx', 'src/pages/LearningProgress.tsx', 'src/components/AssessmentUI.tsx', 'src/components/ExamExperience.tsx']) assert.ok(!/localStorage|sessionStorage|centRequest|fetch\(/.test(current(path)), path)
for (const path of ['dist', '.preview-artifacts/phase5-root']) {
  assert.ok(existsSync(`${path}/index.html`))
  assert.equal(current(`${path}/_headers`), current('public/_headers'))
  assert.equal(existsSync(`${path}/docs`), false)
  assert.equal(existsSync(`${path}/component-reference.html`), false)
  for (const asset of ['brand/symbol.svg', 'brand/symbol-dark.svg', 'images/hero-colosseum.webp']) assert.deepEqual(readFileSync(`${path}/${asset}`), readFileSync(`public/${asset}`))
}
assert.equal(git('diff', '--cached', '--name-only'), '')
assert.ok(git('rev-parse', 'HEAD').startsWith('7c0cbb4'))
assert.equal(git('branch', '--show-current').trim(), 'main')
git('-c', 'core.safecrlf=false', 'diff', '--check')
const lint = JSON.parse(current('docs/refinement/evidence/phase-5/frontend-lint.json'))
assert.equal(lint.reduce((sum, file) => sum + file.errorCount, 0), 6)
assert.deepEqual(lint.filter(file => file.errorCount).map(file => file.filePath.split(/[/\\]/).at(-1)).sort(), ['CentUI.tsx', 'PracticePages.tsx', 'StudyReader.tsx'])
writeFileSync('docs/refinement/evidence/phase-5/delivery-verification.json', JSON.stringify({ success: true, head: git('rev-parse', 'HEAD').trim(), protectedFiles: hashes, checks: ['33 protected files match approved Phase 4.1 HEAD', 'Complete assessment controller/hooks/start/submit match HEAD before presentation return', 'Result loading/filter/comparison/accuracy calculations match HEAD', 'Only readiness element and CSS import change routing/bootstrap', 'No new request contract, scoring, recommendation algorithm or persistence', 'Flat logo/security headers/build exclusions retained in both bases', 'Six baseline lint errors retained; no staged files/new commit/push/deploy/Phase 6'] }, null, 2))
console.log('Phase 5 delivery boundaries verified.')
