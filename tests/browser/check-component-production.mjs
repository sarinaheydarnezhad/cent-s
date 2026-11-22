/* global console, URL */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { browserOptions } from './environment.mjs'
const browser=await chromium.launch(browserOptions)
try {
 const page=await browser.newPage()
 await page.goto('http://localhost:5180/component-reference.html')
 await page.getByRole('heading',{name:'این صفحه پیدا نشد.'}).waitFor()
 assert.equal(await page.locator('.reference-shell').count(),0)
 assert.equal(await page.getByRole('heading',{name:'A shared language for the next step.'}).count(),0)
 const result={success:true,kind:'Compiled root build runtime check; preview path resolves ordinary application fallback, no development reference or mock content',url:page.url()}
 fs.writeFileSync(fileURLToPath(new URL('../../docs/refinement/evidence/phase-2/production-reference-result.json',import.meta.url)),JSON.stringify(result,null,2))
 console.log('Production component reference isolation passed')
}finally{await browser.close()}
