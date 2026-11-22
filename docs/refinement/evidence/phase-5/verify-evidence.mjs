/* global console, document, window */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'

const folder = 'docs/refinement/evidence/phase-5/'
const pngs = readdirSync(folder).filter(name => name.endsWith('.png'))
assert.equal(pngs.length, 8)
assert.ok(pngs.every(name => name.startsWith('after-')))
const dimensions = pngs.map(name => { const data = readFileSync(folder + name); assert.equal(data.subarray(1,4).toString(), 'PNG'); return { name, width: data.readUInt32BE(16), height: data.readUInt32BE(20) } })
for (const item of dimensions) assert.deepEqual([item.width, item.height], item.name.includes('1440') ? [1440,1000] : [390,844])
const report = readFileSync('docs/refinement/PHASE_5_REPORT.md', 'utf8')
const links = [...report.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)].map(match => resolve('docs/refinement', match[1]))
for (const path of links) assert.ok(existsSync(path), path)
for (const file of ['assessment-development-result.json', 'assessment-root-result.json', 'simulator-development-result.json', 'accessibility-development-result.json', 'accessibility-root-result.json', 'delivery-verification.json', 'personal-progress-result.json']) assert.equal(JSON.parse(readFileSync(folder + file)).success, true, file)
assert.ok(JSON.parse(readFileSync(folder + 'focused-lint.json')).every(file => !file.errorCount && !file.warningCount))
for (const base of ['', 'root-auth/']) for (const name of ['google-auth-result.json', 'google-gis-result.json', 'appearance-result.json']) assert.equal(JSON.parse(readFileSync(folder + base + name)).success, true, base + name)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage()
  await page.goto(`file:///${resolve(folder + 'index.html').replace(/\\/g, '/')}`)
  await page.locator('article').first().waitFor()
  assert.equal(await page.locator('img').count(), 8)
  for (const image of await page.locator('img').all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(el => el.decode()) }
  for (const width of [1440,390]) {
    await page.setViewportSize({ width, height: 1000 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
  }
} finally { await browser.close() }
writeFileSync(folder + 'validation-summary.json', JSON.stringify({ success: true, screenshotCount: pngs.length, dimensions, reportLinksChecked: links.length, gallery: 'All eight images decoded; desktop/mobile gallery has no overflow', provenance: 'Only connected AFTER viewport images; injected assertion states not captured', retainedBaseline: '170 tests, builds/TypeScript, focused lint; six documented frontend lint errors' }, null, 2))
console.log('Phase 5 evidence verified: eight AFTER images, working report links, successful checks and responsive gallery.')
