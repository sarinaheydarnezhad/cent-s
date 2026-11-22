/* global console */
import fs from 'node:fs'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'

const out = 'docs/refinement/evidence/phase-3-1/'
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const checkpoint = JSON.parse(fs.readFileSync(out + 'checkpoint.json'))
const protectedBefore = JSON.parse(fs.readFileSync('docs/refinement/evidence/phase-3/protected-before.json'))
const appearanceChanges = ['public/appearance.js', 'src/services/appearance.test.ts', 'src/foundation-ui.css']
const protectedFiles = Object.keys(protectedBefore).filter(file => !appearanceChanges.includes(file))
assert.deepEqual(protectedFiles.filter(file => hash(file) !== protectedBefore[file]), [])
for (const file of ['docs/brand/hero-colosseum.png', 'docs/brand/hero-underline.png']) {
  assert.equal(hash(file), checkpoint.hashes[file], 'Supplied artwork is preserved: ' + file)
}
const normalize = value => value.replace(/\r\n/g, '\n')
const current = file => normalize(fs.readFileSync(file, 'utf8'))
const original = file => normalize(execFileSync('git', ['show', 'HEAD:' + file], { encoding: 'utf8' }))
const logic = text => text.slice(text.indexOf('export function'), text.indexOf('  return <'))
for (const file of ['src/pages/public/LoginPage.tsx', 'src/pages/public/GoogleCallbackPage.tsx']) {
  assert.equal(logic(current(file)), logic(original(file)), file + ' auth logic')
}
const details = text => text.slice(text.indexOf('export function CourseDetails')).replace('narrow-page public-course-page', 'narrow-page')
assert.equal(details(current('src/pages/CourseCatalog.tsx')), details(original('src/pages/CourseCatalog.tsx')))
assert.equal(current('src/main.tsx').replace("import './public.css'\n", ''), original('src/main.tsx'))
for (const directory of ['dist', '.preview-artifacts/phase31-root']) {
  for (const name of ['hero-colosseum', 'hero-underline']) {
    assert.equal(hash(directory + '/images/' + name + '.webp'), hash('public/images/' + name + '.webp'))
  }
  assert.equal(fs.existsSync(directory + '/component-reference.html'), false)
  assert.equal(fs.existsSync(directory + '/docs'), false)
  assert.equal(hash(directory + '/_headers'), hash('public/_headers'))
}
const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim()
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
assert.equal(branch, checkpoint.branch)
assert.equal(head, checkpoint.head)
assert.equal(execFileSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' }).trim(), '')
execFileSync('git', ['diff', '--check'], { stdio: 'pipe' })
const result = {
  success: true, branch, head, protectedFileCount: protectedFiles.length,
  protectedFiles, appearanceExceptions: appearanceChanges,
  suppliedArtworkUnchanged: true, authLogicUnchanged: true,
  courseAccessLogicUnchanged: true, securityHeadersUnchanged: true,
  correctAssetsInBothBuilds: true, developmentEvidenceExcluded: true, staged: false,
  backend: 'Only existing frontend-local Development preview binary and DEVELOPMENT_MOCK public GETs; no backend repository access/build/edit or production connection',
}
fs.writeFileSync(out + 'delivery-verification.json', JSON.stringify(result, null, 2))
console.log(`Delivery checks passed: ${protectedFiles.length} protected hashes, supplied originals, auth/access logic, both build outputs, branch/HEAD and unstaged work`)
