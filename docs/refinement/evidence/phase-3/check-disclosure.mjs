/* global document, sessionStorage, console */
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { URL } from 'node:url'
const browser=await chromium.launch({channel:'chrome',headless:true})
try {
const context=await browser.newContext({viewport:{width:390,height:844}})
await context.route('**/api/cent/v1/**',route=>{
 const path=new URL(route.request().url()).pathname
 const data=path.endsWith('/me')?{id:'disclosure-fixture',name:'نمونه بررسی منو',email:'fixture@example.test',role:'STUDENT'}:path.endsWith('/library')?{trainings:[],documents:[],notes:[],progress:[],entitlements:[],hasSubscription:false,readableTrainingIds:[]}:[]
 return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)})
})
const page=await context.newPage()
await page.goto('http://localhost:5173/cent-s/login')
await page.evaluate(()=>sessionStorage.setItem('cent:session:v1','A'.repeat(64)))
await page.goto('http://localhost:5173/cent-s/student/profile')
const trigger=page.locator('[aria-controls="dashboard-navigation"]')
await trigger.click()
const close=page.getByRole('button',{name:'بستن منو',exact:true})
assert.equal(await close.evaluate(el=>el===document.activeElement),true,'Existing dashboard safe close focus retains priority over links')
await page.keyboard.press('Escape')
assert.equal(await trigger.evaluate(el=>el===document.activeElement),true)
assert.equal(await trigger.getAttribute('aria-expanded'),'false')
fs.writeFileSync('docs/refinement/evidence/phase-3/disclosure-result.json',JSON.stringify({success:true,kind:'Synthetic student session; focus regression only; no private-page redesign',checks:['Safe close button still takes focus','Escape closes/restores trigger']},null,2))
console.log('Existing dashboard disclosure focus preserved')
}finally{await browser.close()}
