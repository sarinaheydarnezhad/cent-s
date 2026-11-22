/* global fetch, URL, document, window, sessionStorage, innerWidth, console */
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
const out='docs/refinement/evidence/phase-2', root='http://localhost:5173/cent-s', api='http://127.0.0.1:5108/api/cent/v1'
const result={kind:'Actual rendered local Cent.Preview responses; local synthetic test accounts; no production data',screenshots:[],checks:[],responsive:[],errors:[]}
const save=()=>fs.writeFileSync(`${out}/consumer-result.json`,JSON.stringify(result,null,2))
async function request(route,token,body) {const r=await fetch(api+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});if(!r.ok)throw Error(`${route} ${r.status}`);return r.json()}
assert.equal((await request('/status')).payments,'DEVELOPMENT_MOCK')
const browser=await chromium.launch({channel:'chrome',headless:true})
async function contextFor(session) {
 const context=await browser.newContext({viewport:{width:1440,height:1000}})
 await context.route('**/*',route=>{const u=new URL(route.request().url());return /^https?:$/.test(u.protocol)&&!['localhost','127.0.0.1'].includes(u.hostname)?route.abort():route.continue()})
 if(session)await context.addInitScript(({token,expiresAt})=>{sessionStorage.setItem('cent:session:v1',token);sessionStorage.setItem('cent:session-expiry:v1',expiresAt)},session)
 return context
}
async function capture(page,name,route,widths=[390,1440]) {
 for(const width of widths)for(const theme of ['light','dark']) {
  await page.setViewportSize({width,height:900});await page.goto(root+route);await page.evaluate(theme=>window.ItatestAppearance.setPreference(theme),theme);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready)
  const file=`after-final-${name}-${theme}-${width}.png`;await page.screenshot({path:`${out}/${file}`,fullPage:true})
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`${name} ${theme} ${width}`)
  result.screenshots.push({file,route,theme,width,kind:result.kind,overflow});result.responsive.push({name,theme,width,overflow});save()
 }
}
try {
 const publicContext=await contextFor();const page=await publicContext.newPage();page.on('pageerror',e=>result.errors.push(e.message))
 for(const [name,route] of [['login','/login'],['catalog','/package'],['course','/courses/math']])await capture(page,name,route)
 await page.setViewportSize({width:390,height:844});await page.goto(root+'/login');const trigger=page.locator('[aria-controls="public-navigation"]');const nav=page.getByRole('navigation',{name:'ناوبری اصلی',includeHidden:true})
 assert.equal(await nav.isVisible(),false);assert.equal(await trigger.getAttribute('aria-expanded'),'false');await trigger.click();assert.equal(await trigger.getAttribute('aria-expanded'),'true');await nav.getByRole('link').first().focus();await page.keyboard.press('Escape');assert.equal(await nav.isVisible(),false);assert.equal(await trigger.evaluate(el=>el===document.activeElement),true)
 await trigger.click();await page.getByRole('heading',{name:'خوش برگشتی'}).click();assert.equal(await nav.isVisible(),false)
 await trigger.click();const publicMenu='after-public-menu-dark-390.png';await page.screenshot({path:`${out}/${publicMenu}`,fullPage:true});result.screenshots.push({file:publicMenu,kind:result.kind});await page.keyboard.press('Escape')
 await page.setViewportSize({width:1440,height:900});assert.equal(await nav.isVisible(),true);result.checks.push('Public mobile disclosure: hidden closed content, expanded/controls, Escape restoration, outside dismissal, desktop remains visible')
 await page.route('**/api/cent/v1/curriculum',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'نتونستیم اطلاعات رو بارگذاری کنیم. دوباره تلاش کن.'})}))
 await page.goto(root+'/courses/math');await page.getByRole('alert').waitFor();const file='injected-course-recovery-dark-1440.png';await page.screenshot({path:`${out}/${file}`,fullPage:true});result.screenshots.push({file,kind:'Actual application render with deliberately injected local HTTP503 response; not a naturally occurring backend failure'});await page.unroute('**/api/cent/v1/curriculum');await page.getByRole('button',{name:'دوباره تلاش کن',exact:true}).click();await page.getByRole('heading',{name:'ریاضیات',exact:true}).waitFor().catch(async()=>{await page.locator('.page-header h1').waitFor()});assert.equal(await page.getByRole('alert').count(),0);result.checks.push('Shared recovery notice renders injected503; actual retry restores real course content')
 await publicContext.close()
 const admin=await request('/auth/login',null,{email:'admin@cent.local',password:'cent-local-preview-only'});const users=await request('/admin/users',admin.token);const learner=users.filter(u=>u.email.startsWith('progress-')&&!u.email.startsWith('progress-other-')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0];assert.ok(learner)
 const session=await request('/auth/login',null,{email:learner.email,password:'progress-local-check'});const studentContext=await contextFor(session);const studentPage=await studentContext.newPage();studentPage.on('pageerror',e=>result.errors.push(e.message))
 for(const [name,route] of [['dashboard','/student'],['learning','/student/analysis'],['results','/student/results']])await capture(studentPage,name,route)
 const attempts=await request('/attempts/',session.token);if(attempts[0])await capture(studentPage,'recommendation','/student/results/'+attempts[0].id)
 await studentPage.setViewportSize({width:390,height:844});await studentPage.goto(root+'/student');const studentTrigger=studentPage.getByRole('button',{name:'نمایش منو',exact:true});const sidebar=studentPage.locator('.sidebar');assert.equal(await sidebar.isVisible(),false);await studentTrigger.click();assert.equal(await studentTrigger.getAttribute('aria-expanded'),'true');assert.equal(await studentPage.getByRole('button',{name:'بستن منو',exact:true}).evaluate(el=>el===document.activeElement),true)
 const menu='after-student-menu-dark-390.png';await studentPage.screenshot({path:`${out}/${menu}`,fullPage:true});result.screenshots.push({file:menu,kind:result.kind});await studentPage.keyboard.press('Escape');assert.equal(await sidebar.isVisible(),false);assert.equal(await studentTrigger.evaluate(el=>el===document.activeElement),true);await sidebar.locator('a').first().evaluate(el=>el.focus());assert.equal(await sidebar.locator('a').first().evaluate(el=>el===document.activeElement),false);result.checks.push('Student sidebar: named trigger, safe open focus, Escape return, hidden links cannot receive focus')
 await studentContext.close();const adminContext=await contextFor(admin);const adminPage=await adminContext.newPage();await capture(adminPage,'admin','/admin');await adminContext.close()
 assert.deepEqual(result.errors,[]);result.success=true;save();console.log(`Consumer evidence passed: ${result.screenshots.length} captures, ${result.responsive.length} responsive observations, ${result.checks.length} groups`)
}catch(error){result.failure=error.stack;save();throw error}finally{await browser.close()}
