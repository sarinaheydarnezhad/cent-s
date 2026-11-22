import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
import { browserOptions } from '../../../../tests/browser/environment.mjs'
const browser = await chromium.launch(browserOptions)
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  for (const [name, path, theme, width] of [['home','/','light',1440],['home','/','dark',390],['login','/login','light',1440],['login','/login','dark',390]]) {
    await page.setViewportSize({width,height:1000})
    await page.goto('http://127.0.0.1:5173/cent-s'+path)
    await page.evaluate(t => window.ItatestAppearance.setPreference(t),theme)
    await page.waitForLoadState('networkidle')
    await page.screenshot({path:`docs/refinement/evidence/phase-3-1/review-${name}-${theme}-${width}.png`,fullPage:true})
  }
} finally { await browser.close() }
