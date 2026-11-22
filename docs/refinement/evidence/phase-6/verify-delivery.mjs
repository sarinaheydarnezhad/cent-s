/* global console */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const normalize = value => value.replace(/\r\n/g, '\n')
const git = (...args) => normalize(execFileSync('git', args, { encoding: 'utf8' }))
const current = path => normalize(readFileSync(path, 'utf8'))
const head = path => git('show', `HEAD:${path}`)
const protectedFiles = ['src/services/cent.ts', 'src/services/pdf-upload.ts', 'src/services/scoring.ts', 'src/services/study-return.ts', 'src/services/learning-presentation.ts', 'src/services/assessment-presentation.ts', 'src/state/AppState.tsx', 'src/types.ts', 'src/App.tsx', 'src/pages/StudentDashboard.tsx', 'src/pages/CourseCatalog.tsx', 'src/pages/admin/CentAdmin.tsx', 'src/pages/PracticePages.tsx', 'src/pages/AssessmentResults.tsx', 'src/pages/PersonalResults.tsx', 'src/pages/LearningProgress.tsx', 'src/pages/ReadinessPage.tsx', 'src/components/ExamExperience.tsx', 'src/components/AssessmentUI.tsx', 'src/components/UI.tsx', 'src/components/Dialog.tsx', 'src/components/CentUI.tsx', 'src/components/ProtectedRoute.tsx', 'src/components/Brand.tsx', 'src/components/AppearanceControl.tsx', 'src/components/DashboardLayout.tsx', 'src/components/useNavigationDisclosure.ts', 'src/components/GoogleSignIn.tsx', 'src/pages/public/LoginPage.tsx', 'src/pages/public/GoogleCallbackPage.tsx', 'src/foundations.css', 'src/foundation-ui.css', 'src/student.css', 'src/assessment.css', 'src/public.css', 'src/styles.css', 'src/cent.css', 'public/appearance.js', 'public/_headers', 'package.json', 'package-lock.json', 'vite.config.ts']
const hashes = {}
for (const path of protectedFiles) { assert.equal(current(path), head(path), path); hashes[path] = createHash('sha256').update(readFileSync(path)).digest('hex') }
const reader = current('src/pages/StudyReader.tsx'), previous = head('src/pages/StudyReader.tsx')
const controller = text => text.slice(text.indexOf('function Reader({'), text.indexOf('  const currentNotes =') >= 0 ? text.indexOf('  const currentNotes =') : text.indexOf('  return <ReaderExperience'))
assert.equal(controller(reader).replace("behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'", "behavior: 'smooth'"), controller(previous))
const commerce = text => text.slice(0, text.indexOf('export function LibraryPage()') >= 0 ? text.indexOf('export function LibraryPage()') : text.indexOf('export { LibraryPage, NotesPage }')) + text.slice(text.indexOf('export function AccountPage()'))
assert.equal(commerce(current('src/pages/CommercePages.tsx')), commerce(head('src/pages/CommercePages.tsx')))
assert.equal(current('src/main.tsx').replace("import './reading.css'\n", ''), head('src/main.tsx'))
assert.ok(current('src/components/ReaderExperience.tsx').includes('notes.filter(n => n.page === page).sort((a, b) => a.anchorY - b.anchorY)'))
assert.ok(current('src/pages/ReadingLibrary.tsx').includes('remote.data?.filter(n => `${n.body} ${n.documentTitle}`.includes(search)) || []'))
for (const path of ['src/components/ReadingUI.tsx', 'src/components/ReaderExperience.tsx', 'src/pages/ReadingLibrary.tsx']) assert.ok(!/localStorage|sessionStorage|centRequest|fetch\(/.test(current(path)), path)
for (const path of ['dist', '.preview-artifacts/phase6-root']) {
  assert.ok(existsSync(`${path}/index.html`))
  assert.equal(current(`${path}/_headers`), current('public/_headers'))
  assert.equal(existsSync(`${path}/docs`), false)
  assert.equal(existsSync(`${path}/component-reference.html`), false)
  for (const asset of ['brand/symbol.svg', 'brand/symbol-dark.svg', 'images/hero-colosseum.webp']) assert.deepEqual(readFileSync(`${path}/${asset}`), readFileSync(`public/${asset}`))
}
const lint = JSON.parse(current('docs/refinement/evidence/phase-6/frontend-lint.json'))
assert.equal(lint.reduce((sum, file) => sum + file.errorCount, 0), 6)
assert.deepEqual(lint.filter(file => file.errorCount).map(file => [file.filePath.split(/[/\\]/).at(-1), file.errorCount]), [['CentUI.tsx', 1], ['PracticePages.tsx', 1], ['StudyReader.tsx', 4]])
assert.equal(git('diff', '--cached', '--name-only'), '')
assert.ok(git('rev-parse', 'HEAD').startsWith('d428627'))
assert.equal(git('branch', '--show-current').trim(), 'main')
git('-c', 'core.safecrlf=false', 'diff', '--check')
writeFileSync('docs/refinement/evidence/phase-6/delivery-verification.json', JSON.stringify({ success: true, head: git('rev-parse', 'HEAD').trim(), protectedFiles: hashes, checks: [`${protectedFiles.length} complete protected files match approved Phase5 HEAD`, 'Full reader controller remains identical before presentation, except reduced-motion scroll preference', 'Protected image fetch/abort/object URL lifecycle, watermark/canvas, hidden state, 1200ms progress save, drafts, note IDs/revisions/save/delete/confirm handlers unchanged', 'Commerce and account functions unchanged outside extracted library/notes presentation', 'Routes, assessment, dashboard resume/phrase/meter, auth/theme and API/persistence owners unchanged', 'Both builds retain flat logo/security headers and exclude docs/reference', 'Six baseline hook lint errors retained; no staged changes/new commit/push/deploy/Phase7'] }, null, 2))
console.log('Phase 6 delivery boundaries verified.')
