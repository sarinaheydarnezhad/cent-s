/* global fetch, sessionStorage, document, window, console, getComputedStyle */
import fs from 'node:fs'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
const r=await fetch('http://127.0.0.1:5108/api/cent/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@cent.local',password:'cent-local-preview-only'})});const session=await r.json()
const browser=await chromium.launch({channel:'chrome',headless:true})
try{
 const page=await browser.newPage({viewport:{width:390,height:844}})
 await page.addInitScript(({token,expiresAt})=>{sessionStorage.setItem('cent:session:v1',token);sessionStorage.setItem('cent:session-expiry:v1',expiresAt);window.__focusEvents=[];document.addEventListener('focusin',event=>window.__focusEvents.push({tag:event.target.tagName,label:event.target.getAttribute('aria-label')}))},session)
 await page.goto('http://localhost:5173/cent-s/admin');await page.getByRole('button',{name:'نمایش منو',exact:true}).click()
 const inspect=()=>page.evaluate(()=>({active:document.activeElement.outerHTML,events:window.__focusEvents,close:[...document.querySelectorAll('.sidebar button')].map(el=>({html:el.outerHTML,tab:el.tabIndex,display:getComputedStyle(el).display,visibility:getComputedStyle(el).visibility,rect:el.getBoundingClientRect().toJSON()}))}))
 const immediate=await inspect();await page.waitForTimeout(300);const settled=await inspect();await page.getByRole('button',{name:'بستن منو',exact:true}).focus();const explicit=await inspect()
 const result={immediate,settled,explicit};fs.writeFileSync('docs/refinement/evidence/phase-2/navigation-focus-investigation.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result))
}finally{await browser.close()}
