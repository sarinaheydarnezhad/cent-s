/* global window, document */
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
const browser=await chromium.launch({channel:'chrome',headless:true})
try {
const page=await browser.newPage({viewport:{width:1440,height:1000}})
await page.goto('http://localhost:5173/cent-s/');await page.evaluate(()=>window.ItatestAppearance.setPreference('light'));await page.evaluate(()=>document.fonts.ready)
await page.screenshot({path:'docs/refinement/evidence/phase-3/review-home.png',fullPage:true})
await page.goto('http://localhost:5173/cent-s/login');await page.screenshot({path:'docs/refinement/evidence/phase-3/review-login.png',fullPage:true})
}finally{await browser.close()}
