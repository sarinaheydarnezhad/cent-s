/* global document, getComputedStyle, console */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
const out='docs/refinement/evidence/phase-2'
const browser=await chromium.launch({channel:'chrome',headless:true})
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}})
 await page.goto(pathToFileURL(path.resolve(out,'index.html')).href)
 const metrics=await page.evaluate(()=>({pairs:document.querySelectorAll('.pair').length,gridColumns:getComputedStyle(document.querySelector('.grid')).gridTemplateColumns,images:document.querySelectorAll('img').length}))
 assert.equal(metrics.pairs,12);assert.notEqual(metrics.gridColumns,'none')
 await page.screenshot({path:out+'/visual-index-desktop.png'})
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=390));await page.screenshot({path:out+'/visual-index-mobile.png'})
 fs.writeFileSync(out+'/visual-index-verification.json',JSON.stringify({success:true,...metrics,kind:'HTML evidence index verified locally; index screenshots are navigation aids, excluded from 92 implementation images'},null,2));console.log('Visual evidence index desktop/mobile checks passed')
}finally{await browser.close()}
