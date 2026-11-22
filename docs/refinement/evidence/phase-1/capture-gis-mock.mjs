/* global document */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
const out=path.dirname(fileURLToPath(import.meta.url))
const fixture=fs.readFileSync('tests/browser/check-google-gis.mjs','utf8').match(/const syntheticSdk = `([\s\S]+?)`/)[1]
const browser=await chromium.launch({channel:'chrome',headless:true})
try {
  for(const theme of ['light','dark'])for(const width of [390,1440]) {
    const context=await browser.newContext({colorScheme:theme,viewport:{width,height:1000}})
    await context.route('https://accounts.google.com/**',r=>r.fulfill({contentType:'application/javascript',body:fixture}))
    await context.route('**/api/cent/v1/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(r.request().url().endsWith('/config')?{enabled:true,mode:'GisIdToken',clientId:'synthetic.apps.googleusercontent.com'}:{challengeId:'C'.repeat(42)+'A',nonce:'N'.repeat(42)+'A',browserBinding:'B'.repeat(42)+'A',expiresAt:new Date(Date.now()+300000).toISOString()})}))
    const page=await context.newPage();await page.goto('http://localhost:5173/cent-s/login')
    await page.getByRole('button',{name:'ادامه با Google',exact:true}).waitFor()
    await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700)
    await page.screenshot({path:path.join(out,`gis-mock-${theme}-${width}.png`),fullPage:true})
    await context.close()
  }
  fs.writeFileSync(path.join(out,'gis-screenshots.json'),JSON.stringify({kind:'Mock-backed actual application component; existing synthetic SDK/plain test button and API fixtures. Not the official Google button, real consent or credential validation. No button clicked, real requests or account/session created.',themes:['light','dark'],widths:[390,1440]},null,2))
}finally{await browser.close()}
