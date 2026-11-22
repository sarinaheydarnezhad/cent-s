/* global document, getComputedStyle, sessionStorage, localStorage, console, window, fetch */
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'
import { chromium } from 'playwright'
import { api, root, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
const label = process.env.ITATEST_PHASE5_LABEL || 'development'
const fixture = JSON.parse(readFileSync(`.preview-artifacts/phase5-${label}-fixture.json`, 'utf8'))
const browser = await chromium.launch(browserOptions)
const measurements = [], checks = [], errors = []
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce' })
    await context.addInitScript(({ token, theme }) => { sessionStorage.setItem('cent:session:v1', token); localStorage.setItem('itatest:appearance:v1', theme) }, { token: fixture.learner.token, theme })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    for (const path of ['/student/preparation', '/diagnostic/test?course=math', '/student/practice?course=math', '/student/results', `/student/results/${fixture.attemptId}`, '/student/analysis', '/student/simulators']) {
      await page.goto(root + path); await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready)
      if (path.startsWith('/student/practice')) {
        await page.getByRole('button', { name: 'شروع آزمون', exact: true }).click()
        await page.locator('.sim-question').waitFor()
        await page.locator('.options-list button').first().click()
      }
      const chapter = page.locator('.assessment-chapter summary').first()
      if (await chapter.count()) await chapter.click()
      const review = page.locator('.assessment-review summary').first()
      if (await review.count()) await review.click()
      const pairs = await page.evaluate(() => {
        const luminance = color => color.match(/[\d.]+/g).slice(0,3).map(Number).map(value => { const x = value / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4 }).reduce((sum, value, i) => sum + value * [.2126,.7152,.0722][i], 0)
        const pairs = []
        for (const el of document.querySelectorAll('.assessment-page h1,.assessment-page h2,.assessment-page h3,.assessment-page p,.assessment-page .eyebrow,.assessment-page .button,.assessment-page .text-link,.assessment-page .ui-badge,.assessment-page label,.assessment-page dt,.assessment-page dd,.assessment-page .assessment-muted,.assessment-score-ring strong,.assessment-score-ring > span,.assessment-page .stat-card strong,.assessment-page .stat-card small,.assessment-page .stat-card span,.assessment-page .options-list b,.assessment-page .options-list button > span,.assessment-page .cent-exam-dots button,.assessment-page .assessment-timer,.assessment-page summary')) {
          if (!el.getBoundingClientRect().width || !el.getBoundingClientRect().height || !el.textContent.trim() || el.closest('[disabled]')) continue
          const fg = getComputedStyle(el).color
          let node = el, backgrounds = []
          while (node) {
            const style = getComputedStyle(node)
            if (node.classList.contains('assessment-score-ring')) { backgrounds = [getComputedStyle(node, '::before').backgroundColor]; break }
            if (style.backgroundImage !== 'none') { backgrounds = style.backgroundImage.match(/rgba?\([^)]+\)/g) || []; break }
            if (!['transparent', 'rgba(0, 0, 0, 0)'].includes(style.backgroundColor)) { backgrounds = [style.backgroundColor]; break }
            node = node.parentElement
          }
          for (const bg of backgrounds) { const a = luminance(fg), b = luminance(bg); pairs.push({ text: el.textContent.trim().slice(0,60), foreground: fg, background: bg, ratio: (Math.max(a,b) + .05) / (Math.min(a,b) + .05) }) }
        }
        return pairs
      })
      for (const pair of pairs) assert.ok(pair.ratio >= 4.5, `${theme}/${path}: ${pair.text}: ${pair.ratio.toFixed(2)} ${pair.foreground} on ${pair.background}`)
      measurements.push(...pairs.map(pair => ({ theme, path, ...pair })))
      assert.equal(await page.locator('html').getAttribute('dir'), 'rtl')
      for (const width of [768, 390]) {
        await page.setViewportSize({ width, height: 844 })
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
        const targets = await page.locator('.assessment-page button:not([disabled]),.assessment-page select,.assessment-page .button').evaluateAll(els => els.filter(el => el.getBoundingClientRect().width && getComputedStyle(el).visibility !== 'hidden').map(el => ({ text: el.textContent.trim().slice(0,40), height: el.getBoundingClientRect().height, width: el.getBoundingClientRect().width })))
        for (const target of targets) assert.ok(target.height >= 44 && target.width >= 44, `${path}: ${JSON.stringify(target)}`)
      }
      await page.setViewportSize({ width: 1440, height: 1000 })
      const button = page.locator('.assessment-page .button:not([disabled])').first()
      if (await button.count()) {
        await button.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab')
        const focus = await button.evaluate(el => ({ focus: el === document.activeElement, width: getComputedStyle(el).outlineWidth, style: getComputedStyle(el).outlineStyle }))
        assert.ok(focus.focus && parseFloat(focus.width) >= 2 && focus.style !== 'none', `${path}: visible keyboard focus`)
      }
      if (await chapter.count()) {
        const details = page.locator('.assessment-chapter').first()
        await chapter.focus(); await page.keyboard.press('Enter'); assert.equal(await details.getAttribute('open'), null)
        await page.keyboard.press('Enter'); assert.notEqual(await details.getAttribute('open'), null)
      }
      assert.equal(await page.locator('.assessment-page').evaluate(el => getComputedStyle(el).animationName), 'none')
      checks.push(`${theme} ${path}: contrast, RTL, tablet/mobile, 44px controls, keyboard focus/disclosures, reduced motion`)
    }
    await context.close()
  }
  assert.deepEqual(errors, [])
  const status = await fetch(api + '/status').then(response => response.json())
  assert.equal(status.payments, 'DEVELOPMENT_MOCK')
  writeFileSync(`docs/refinement/evidence/phase-5/accessibility-${label}-result.json`, JSON.stringify({ success: true, checks, measuredTextPairs: measurements.length, measurements, browserErrors: errors, scope: 'Representative Chromium checks; not full WCAG or assistive-technology acceptance' }, null, 2))
  console.log(`Phase 5 accessibility passed: ${checks.length} screen/theme checks, ${measurements.length} text/gradient pairs.`)
} finally { await browser.close() }
