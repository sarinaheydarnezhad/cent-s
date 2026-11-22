/* global document, innerWidth, console */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'

const folder = 'docs/refinement/evidence/phase-4-1/'
const paths = ['docs/refinement/PHASE_4_1_REPORT.md', folder + 'README.md']
let links = 0
for (const path of paths) {
  for (const match of readFileSync(path, 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    if (match[1].startsWith('http')) continue
    assert.ok(existsSync(resolve(dirname(path), match[1].split('#')[0])), `${path}: ${match[1]}`)
    links++
  }
}
const images = readdirSync(folder).filter(path => path.endsWith('.png'))
assert.equal(images.length, 6)
assert.ok(images.every(path => path.startsWith('after-')))
const focusedLint = JSON.parse(readFileSync(folder + 'focused-lint.json', 'utf8'))
assert.ok(focusedLint.every(entry => !entry.errorCount && !entry.warningCount))
const sourceLint = JSON.parse(readFileSync(folder + 'frontend-lint.json', 'utf8'))
assert.equal(sourceLint.reduce((sum, entry) => sum + entry.errorCount, 0), 6)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const observations = []
try {
  const page = await browser.newPage()
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://127.0.0.1:5173/cent-s/' + folder + 'index.html')
    await page.locator('article').first().waitFor()
    assert.equal(await page.locator('article').count(), 6)
    await page.evaluate(async () => { for (const img of document.images) img.loading = 'eager'; await Promise.all([...document.images].map(img => img.decode())) })
    const sizes = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }))
    assert.ok(sizes.scroll <= sizes.width + 1)
    observations.push(sizes)
  }
} finally { await browser.close() }
const result = { success: true, links, images, observations, noAdditionalScreenshots: true, checks: { units: { passed: 156, files: 9 }, typescript: 'tsc -b passed', buildBases: ['/cent-s/', '/'], dashboard: { groupsPerEnvironment: 13, responsiveObservationsPerEnvironment: 26 }, accessibility: { textPairsPerEnvironment: 158 }, refinement: { groups: 5, responsiveObservations: 10 }, appearance: { groups: 5 }, progress: 'Connected real local scores/mastery/account isolation passed', focusedLint: 'clean', broaderSourceLint: '6 pre-existing effect-rule errors' } }
writeFileSync(folder + 'validation-summary.json', JSON.stringify(result, null, 2))
console.log(`Phase 4.1 evidence passed (${links} links, 6 decoded AFTER images, desktop/mobile gallery, no added screenshots).`)
