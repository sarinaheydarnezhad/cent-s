/* global document, getComputedStyle, sessionStorage, localStorage, console */
import assert from 'node:assert/strict'
import process from 'node:process'
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { root, artifact, browserOptions, requireLocalPreview } from './environment.mjs'
await requireLocalPreview()
const label = process.env.ITATEST_PHASE7_LABEL || 'development'
const fixture = JSON.parse(readFileSync(`.preview-artifacts/phase7-${label}-fixture.json`, 'utf8'))
const measurements = [], checks = [], errors = []
const browser = await chromium.launch(browserOptions)
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
    await context.addInitScript(({ token, theme }) => { sessionStorage.setItem('cent:session:v1', token); if (!localStorage.getItem('itatest:appearance:v1')) localStorage.setItem('itatest:appearance:v1', theme) }, { token: fixture.learner.token, theme })
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message))
    for (const path of ['/package', `/courses/${fixture.course.code}`, '/package?kind=SUBSCRIPTION', `/checkout?product=${fixture.plans[0].id}`, `/checkout/success?order=${fixture.paid.id}`, '/student/profile']) {
      await page.goto(root + path); await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready)
      const pairs = await page.evaluate(() => {
        const lum = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { const x = v / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4 }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
        const pairs = []
        for (const el of document.querySelectorAll('.commerce-page h1,.commerce-page h2,.commerce-page h3,.commerce-page p,.commerce-page .button,.commerce-page .text-link,.commerce-page .ui-badge,.commerce-page .eyebrow,.commerce-page strong,.commerce-page dt,.commerce-page dd,.commerce-page li,.commerce-page summary,.commerce-account h1,.commerce-account h2,.commerce-account h3,.commerce-account p,.commerce-account .button,.commerce-account .ui-badge,.commerce-account strong,.commerce-account dt,.commerce-account dd,.commerce-account summary')) {
          if (!el.getBoundingClientRect().width || !el.getBoundingClientRect().height || !el.textContent.trim() || el.closest('[disabled]') || getComputedStyle(el).visibility === 'hidden') continue
          const fg = getComputedStyle(el).color; let node = el, backgrounds = []
          while (node) {
            const style = getComputedStyle(node)
            if (style.backgroundImage !== 'none') { backgrounds = style.backgroundImage.match(/rgba?\([^)]+\)/g) || []; break }
            if (!['transparent', 'rgba(0, 0, 0, 0)'].includes(style.backgroundColor)) { backgrounds = [style.backgroundColor]; break }
            node = node.parentElement
          }
          for (const bg of backgrounds) { const a = lum(fg), b = lum(bg); pairs.push({ text: el.textContent.trim().slice(0, 60), foreground: fg, background: bg, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }) }
        }
        return pairs
      })
      for (const pair of pairs) assert.ok(pair.ratio >= 4.5, `${theme}/${path}: ${JSON.stringify(pair)}`)
      measurements.push(...pairs.map(pair => ({ theme, path, ...pair })))
      const toggle = page.locator('.appearance-toggle').first(); await toggle.click()
      const opposite = theme === 'light' ? 'dark' : 'light'
      assert.equal(await page.locator('html').getAttribute('data-theme'), opposite)
      await page.reload(); await page.waitForLoadState('networkidle'); assert.equal(await page.locator('html').getAttribute('data-theme'), opposite)
      await toggle.click()
      checks.push(`${theme} ${path}: text/gradient contrast and single-click persisted appearance`)
    }
    await context.close()
  }
  assert.deepEqual(errors, [])
  writeFileSync(artifact(`commerce-accessibility-${label}-result.json`), JSON.stringify({ success: true, checks, measuredTextPairs: measurements.length, measurements, errors }, null, 2))
  console.log(JSON.stringify({ success: true, checks: checks.length, pairs: measurements.length }))
} finally { await browser.close() }
