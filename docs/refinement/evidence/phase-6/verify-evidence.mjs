/* global document, window, console */
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
import { browserOptions } from '../../../../tests/browser/environment.mjs'

const folder = 'docs/refinement/evidence/phase-6'
const read = name => readFileSync(`${folder}/${name}`, 'utf8')
const result = name => { const value = JSON.parse(read(name)); assert.equal(value.success, true, name); return value }
const shots = readdirSync(folder).filter(name => /\.png$/i.test(name)).sort()
assert.equal(shots.length, 7)
assert.ok(shots.every(name => name.startsWith('after-')))
for (const name of shots) {
  const bytes = readFileSync(`${folder}/${name}`)
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG')
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], name.includes('1440') ? [1440, 1000] : [390, 844])
}
const dev = result('reading-development-result.json'), root = result('reading-root-result.json')
assert.equal(dev.checks.length, 6); assert.equal(root.checks.length, 6)
assert.deepEqual(dev.screenshots.sort(), shots); assert.equal(root.screenshots.length, 0)
const state = result('reading-states-development-result.json')
assert.equal(state.checks.length, 3)
const accessibility = ['development', 'root'].map(label => {
  const value = result(`reading-accessibility-${label}-result.json`)
  assert.equal(value.checks.length, 8); assert.equal(value.observations.length, 40)
  assert.ok(value.measuredTextPairs >= 180)
  assert.ok(value.measurements.every(pair => pair.ratio >= 4.5))
  return { label, checks: value.checks.length, observations: value.observations.length, textPairs: value.measuredTextPairs }
})
for (const name of ['study-return-result.json', 'consecutive-notes-result.json', 'root-regression/study-return-result.json', 'root-regression/consecutive-notes-result.json', 'delivery-verification.json']) result(name)
assert.match(read('unit-tests.log'), /183 passed/)
assert.match(read('build.log'), /built in/); assert.match(read('build.log'), /tsc -b/)
assert.match(read('build-root.log'), /built in/)
assert.match(read('appearance-development.log'), /5 groups/)
const lint = JSON.parse(read('focused-lint.json'))
assert.ok(lint.every(file => file.errorCount === 0 && file.warningCount === 0))
const report = readFileSync('docs/refinement/PHASE_6_REPORT.md', 'utf8')
for (const match of report.matchAll(/\]\((evidence\/phase-6\/[^)#]+)\)/g)) assert.ok(existsSync(`docs/refinement/${match[1]}`), match[1])
const browser = await chromium.launch(browserOptions)
try {
  const page = await browser.newPage()
  await page.goto(pathToFileURL(resolve(folder, 'index.html')).href)
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())))
  assert.equal(await page.locator('img').count(), 7)
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
  }
} finally { await browser.close() }
writeFileSync(`${folder}/validation-summary.json`, JSON.stringify({ success: true, screenshots: shots, readingGroups: { development: dev.checks.length, root: root.checks.length }, additionalStateGroups: state.checks.length, accessibility, unitTests: 183, focusedLintFiles: lint.length, focusedLintErrors: 0, baselineFrontendLintErrors: 6, gallery: 'Seven decoded AFTER images; no overflow at1440/390; no new captures', reportLinks: 'All evidence links resolve' }, null, 2))
console.log('Phase 6 evidence, report links and gallery verified.')
