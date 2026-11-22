/* global document, getComputedStyle, sessionStorage, localStorage, console, window */
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'
import { chromium } from 'playwright'
import { root, artifact, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
const label = process.env.ITATEST_PHASE6_LABEL || 'development'
const fixture = JSON.parse(readFileSync(`.preview-artifacts/phase6-${label}-fixture.json`, 'utf8'))
const browser = await chromium.launch(browserOptions)
const checks = [], measurements = [], observations = [], errors = []
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', colorScheme: theme })
    await context.addInitScript(({ token, theme }) => { sessionStorage.setItem('cent:session:v1', token); if (!localStorage.getItem('itatest:appearance:v1')) localStorage.setItem('itatest:appearance:v1', theme) }, { token: fixture.learner.token, theme })
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message))
    for (const path of ['/student/content', '/student/notes', `/student/study/${fixture.doc.id}`, `/student/study/${fixture.mathDoc.id}?page=${fixture.mathPage}`]) {
      await page.goto(root + path); await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready)
      if (path.includes('/study/')) {
        await page.waitForFunction(() => !document.querySelector('.cent-page-content.concealed') && document.querySelector('[aria-label="انتخاب صفحه"]')?.value !== '0')
        const saved = page.locator('.reading-saved-position summary')
        if (await saved.count()) await saved.click()
        const note = page.locator('.cent-note-text').first()
        if (await note.count()) await note.click()
      }
      const pairs = await page.evaluate(() => {
        const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { const x = v / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4 }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
        const pairs = []
        for (const el of document.querySelectorAll('.reading-library h1,.reading-library h2,.reading-library h3,.reading-library p,.reading-library label,.reading-library b,.reading-library .button,.reading-library .ui-badge,.reading-library .reading-access a,.reading-cover strong,.reading-cover span,.reading-notes h1,.reading-notes p,.reading-notes header span,.reading-notes time,.reading-notes .button,.reading-notes input,.reading-workspace h1,.reading-workspace h2,.reading-workspace p,.reading-workspace small,.reading-workspace label,.reading-workspace .button,.reading-workspace .cent-reader-pagination span,.reading-workspace .cent-reader-zoom span,.reading-workspace .cent-note-text span,.reading-workspace .cent-page-footer span,.reading-workspace summary,.reading-workspace textarea,.reading-workspace .cent-note-pin')) {
          if (!el.getBoundingClientRect().width || !el.getBoundingClientRect().height || (!el.textContent.trim() && !el.value) || el.closest('[disabled]') || getComputedStyle(el).visibility === 'hidden' || el.classList.contains('reading-cover-curve')) continue
          const fg = getComputedStyle(el).color; let node = el, backgrounds = []
          while (node) {
            const style = getComputedStyle(node)
            if (style.backgroundImage !== 'none') { backgrounds = style.backgroundImage.match(/rgba?\([^)]+\)/g) || []; break }
            if (!['transparent', 'rgba(0, 0, 0, 0)'].includes(style.backgroundColor)) { backgrounds = [style.backgroundColor]; break }
            node = node.parentElement
          }
          for (const bg of backgrounds) { const a = luminance(fg), b = luminance(bg); pairs.push({ text: (el.textContent || el.value).trim().slice(0, 60), foreground: fg, background: bg, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }) }
        }
        return pairs
      })
      for (const pair of pairs) assert.ok(pair.ratio >= 4.5, `${theme}/${path}: ${JSON.stringify(pair)}`)
      measurements.push(...pairs.map(pair => ({ theme, path, ...pair })))
      assert.equal(await page.locator('html').getAttribute('dir'), 'rtl')
      for (const viewport of [{ width: 320, height: 844 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }, { width: 1024, height: 768 }]) {
        await page.setViewportSize(viewport)
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${theme}/${path}/${viewport.width}: shell overflow`)
        const targets = await page.locator('.reading-library .button,.reading-notes .button,.reading-notes input,.reading-workspace button:not([disabled]),.reading-workspace select,.reading-workspace input,.reading-workspace .button').evaluateAll(els => els.filter(el => el.getBoundingClientRect().width && getComputedStyle(el).visibility !== 'hidden').map(el => ({ text: el.textContent.trim().slice(0, 40), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })))
        for (const target of targets) assert.ok(target.width >= 44 && target.height >= 44, `${theme}/${path}/${viewport.width}: ${JSON.stringify(target)}`)
        observations.push({ theme, path, ...viewport, shellOverflow: false, targets: targets.length })
      }
      const first = page.locator('.reading-library .button,.reading-notes input,.reading-workspace .reading-library-link').first()
      await first.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab')
      const focus = await first.evaluate(el => ({ active: el === document.activeElement, style: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth }))
      assert.ok(focus.active && focus.style !== 'none' && parseFloat(focus.width) >= 2, `${path}: visible keyboard focus`)
      const toggle = page.locator('.appearance-toggle').first()
      await toggle.click(); assert.equal(await page.locator('html').getAttribute('data-theme'), theme === 'light' ? 'dark' : 'light')
      await page.reload(); await toggle.waitFor(); assert.equal(await page.locator('html').getAttribute('data-theme'), theme === 'light' ? 'dark' : 'light')
      await toggle.click()
      if (path.includes('/study/')) {
        const close = page.getByRole('button', { name: 'بستن یادداشت‌ها', exact: true })
        await close.waitFor(); await close.focus(); await page.keyboard.press('Enter')
        assert.equal(await page.locator('.cent-reader-header button[aria-expanded]').getAttribute('aria-expanded'), 'false')
        assert.equal(await page.locator('.cent-reader-header button[aria-expanded]').evaluate(el => el === document.activeElement), true)
        await page.keyboard.press('Enter'); assert.equal(await page.locator('#reading-notes-panel').evaluate(el => el === document.activeElement), true)
        assert.equal(await page.locator('#reading-notes-panel').getAttribute('aria-labelledby'), 'reading-notes-title')
        await page.getByRole('button', { name: 'اندازه معمول', exact: true }).click()
        for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'بزرگ‌نمایی', exact: true }).click()
        assert.equal(await page.getByRole('button', { name: 'بزرگ‌نمایی', exact: true }).isDisabled(), true)
        assert.equal(await page.locator('.cent-page-shell').getAttribute('style'), 'width: 200%;')
        for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'کوچک‌نمایی', exact: true }).click()
        assert.equal(await page.getByRole('button', { name: 'کوچک‌نمایی', exact: true }).isDisabled(), true)
        const motion = await page.locator('.cent-reader-toolbar button').first().evaluate(el => getComputedStyle(el).transitionDuration)
        assert.equal(motion, '0s')
        assert.equal(await page.locator('.cent-page-shell').evaluate(el => getComputedStyle(el).filter), 'none')
      }
      checks.push(`${theme} ${path}: rendered contrast, RTL, five portrait/landscape sizes, touch targets, keyboard focus, notes panel focus/return, zoom bounds, reduced motion, persisted single-click appearance`)
    }
    await context.close()
  }
  assert.deepEqual(errors, [])
  writeFileSync(artifact(`reading-accessibility-${label}-result.json`), JSON.stringify({ success: true, checks, observations, measuredTextPairs: measurements.length, measurements, browserErrors: errors, scope: 'Representative local Chromium; manual visual review supplements these assertions; not full WCAG/screen-reader/cross-browser acceptance.' }, null, 2))
  console.log(`Phase 6 accessibility passed: ${checks.length} screen/theme checks, ${observations.length} viewport observations, ${measurements.length} text pairs.`)
} finally { await browser.close() }
