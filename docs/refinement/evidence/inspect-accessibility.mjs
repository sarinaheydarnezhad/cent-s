/* global console, document, getComputedStyle */
import fs from 'node:fs'
import { URL } from 'node:url'
import { chromium } from '../../../tests/browser/node_modules/playwright/index.mjs'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } })
  await page.goto('http://127.0.0.1:5173/cent-s/login')
  await page.getByRole('heading', { name: 'خوش برگشتی' }).waitFor()
  const menu = page.getByRole('button', { name: 'نمایش منو' })
  const expanded = await menu.getAttribute('aria-expanded')
  await menu.click()
  await page.keyboard.press('Escape')
  const remainsOpenAfterEscape = await page.locator('.public-nav').isVisible()
  await menu.click()
  await page.goto('http://127.0.0.1:5173/cent-s/login')
  const focus = []
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    focus.push(await page.evaluate(() => {
      const e = document.activeElement, css = getComputedStyle(e)
      return { tag: e.tagName, name: e.getAttribute('aria-label') || e.textContent.trim().slice(0, 80), type: e.getAttribute('type'), outline: css.outline, rect: { width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height } }
    }))
  }
  const fields = await page.locator('input').evaluateAll(inputs => inputs.map(input => ({ type: input.type, labels: [...input.labels].map(x => x.textContent.trim()), direction: input.dir, autoComplete: input.autocomplete, describedBy: input.getAttribute('aria-describedby') })))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reducedAnimation = await page.locator('.auth-card').evaluate(e => getComputedStyle(e).animationDuration)
  const report = { scope: 'Actual local login/public menu only; no screen-reader/axe/full WCAG audit', menu: { expanded, remainsOpenAfterEscape }, focus, fields, reducedAnimation }
  fs.writeFileSync(new URL('accessibility-baseline.json', import.meta.url), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} finally { await browser.close() }
