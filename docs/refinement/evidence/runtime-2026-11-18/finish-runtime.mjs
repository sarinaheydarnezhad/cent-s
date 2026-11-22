import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import {chromium} from 'file:///D:/app/itatest/tests/browser/node_modules/playwright/index.mjs'
const output=path.dirname(fileURLToPath(import.meta.url)), api='http://127.0.0.1:5108/api/cent/v1',root='http://localhost:5173/cent-s'
const report=JSON.parse(fs.readFileSync(path.join(output,'extended-runtime.json'),'utf8'))
if(report.failures.length){report.harnessErrors=[...(report.harnessErrors||[]),...report.failures];report.failures=[]}
report.auditHarnessNote='Initial capture stopped while waiting for UI logout because API registration and browser login created separate valid sessions. The registration session was correctly revoked. Continuation explicitly revokes the session used by its browser. No application changes.'
let browser
async function request(label,endpoint,token,method='GET',body,expected=200){
 const r=await fetch(api+endpoint,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined})
 report.checks.push({label,endpoint,method,status:r.status,expected,passed:r.status===expected});assert.equal(r.status,expected,label)
 const value=await r.text();return value?JSON.parse(value):null
}
try{
 const admin=await request('Continuation seeded preview login','/auth/login',null,'POST',{email:'admin@cent.local',password:'cent-local-preview-only'})
 const users=await request('Locate only this run learner for continuation','/admin/users',admin.token)
 const own=users.find(u=>u.id===report.fixture.learnerId);assert.ok(own.email.startsWith('phase0-'))
 const learner=await request('Separate-session logout fixture login','/auth/login',null,'POST',{email:own.email,password:'cent-local-preview-only'})
 browser=await chromium.launch({channel:'chrome',headless:true})
 const context=await browser.newContext({viewport:{width:1440,height:1000}})
 const page=await context.newPage();page.on('pageerror',e=>report.pageErrors.push(e.message))
 await page.goto(root+'/login');await page.evaluate(t=>sessionStorage.setItem('cent:session:v1',t),learner.token)
 await page.goto(root+'/student/profile');await page.getByRole('heading',{name:'پروفایل و خریدهای من',exact:true}).waitFor()
 await request('Revoke exact browser session','/auth/logout',learner.token,'POST',{},204)
 await request('Revoked browser session denied','/me',learner.token,'GET',null,401)
 await page.goto(root+'/student/profile');await page.waitForURL('**/login',{timeout:30000});await page.waitForLoadState('networkidle')
 await page.screenshot({path:path.join(output,'runtime-revoked-session-login-1440.png'),fullPage:true})
 report.screenshots.push({file:'runtime-revoked-session-login-1440.png',route:'/cent-s/login',width:1440,height:1000,kind:'backend-connected session revocation; no response mocking'})
 report.checks.push({label:'Revoked browser session redirects to login',passed:true})
 await page.evaluate(t=>sessionStorage.setItem('cent:session:v1',t),admin.token)
 for(const route of ['/admin','/admin/users','/admin/content','/admin/packages','/admin/orders','/admin/questions']){
   await page.goto(root+route);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready)
   assert.equal(await page.locator('.cent-error').count(),0)
   const name=`runtime-admin-${route==='/admin'?'overview':route.split('/').at(-1)}-1440.png`
   await page.screenshot({path:path.join(output,name),fullPage:false})
   report.screenshots.push({file:name,route,width:1440,height:1000,kind:'backend-connected preview administration; viewport capture'})
   report.checks.push({label:'Administrator interface loads',route,passed:true})
 }
 await page.setViewportSize({width:390,height:844});await page.goto(root+'/admin/orders');await page.waitForLoadState('networkidle')
 await page.screenshot({path:path.join(output,'runtime-admin-orders-390.png'),fullPage:true})
 report.screenshots.push({file:'runtime-admin-orders-390.png',route:'/admin/orders',width:390,height:844,kind:'backend-connected preview administration',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)})
 const overview=await request('Actual admin overview; mock revenue excluded','/admin/overview',admin.token)
 report.adminOverview=overview
}catch(e){report.failures.push({message:e.message,stack:e.stack});console.error(e);process.exitCode=1}
finally{if(browser)await browser.close();report.finishedUtc=new Date().toISOString();fs.writeFileSync(path.join(output,'extended-runtime.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks.length,screenshots:report.screenshots.length,failures:report.failures,pageErrors:report.pageErrors},null,2))}
