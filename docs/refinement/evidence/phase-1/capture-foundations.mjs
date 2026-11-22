/* global fetch, URL, sessionStorage, window, document, innerWidth, getComputedStyle */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
const out=path.dirname(fileURLToPath(import.meta.url))
const root='http://localhost:5173/cent-s', api='http://127.0.0.1:5108/api/cent/v1'
const manifest={kind:'Actual local Cent.Preview, no response mocking; synthetic seed/local fixture accounts only',screenshots:[],checks:[],errors:[]}
const save=()=>fs.writeFileSync(path.join(out,'screenshots.json'),JSON.stringify(manifest,null,2))
const browser=await chromium.launch({channel:'chrome',headless:true})
async function request(endpoint,token,method='GET',body) {
  const r=await fetch(api+endpoint,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined})
  if(!r.ok)throw Error(`${endpoint}: ${r.status}`)
  return r.json()
}
async function contextFor(session) {
  const context=await browser.newContext({viewport:{width:1440,height:1000}})
  await context.route('**/*',route=>{
    const u=new URL(route.request().url())
    return ['http:','https:'].includes(u.protocol)&&!['localhost','127.0.0.1'].includes(u.hostname)?route.abort():route.continue()
  })
  if(session)await context.addInitScript(({token,expiresAt})=>{sessionStorage.setItem('cent:session:v1',token);sessionStorage.setItem('cent:session-expiry:v1',expiresAt)},session)
  return context
}
async function captures(page,name,route,widths=[390,1440]) {
  for(const width of widths)for(const theme of ['light','dark']) {
    await page.setViewportSize({width,height:width<600?844:1000})
    await page.goto(root+route);await page.waitForSelector('#root > *')
    await page.evaluate(theme=>window.ItatestAppearance.setPreference(theme),theme)
    await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready)
    await page.waitForTimeout(700)
    if(name==='reader')await page.waitForFunction(()=>document.querySelector('canvas')?.width>500&&!document.querySelector('.cent-page-content.concealed'))
    const file=`${name}-${theme}-${width}.png`
    const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,theme:document.documentElement.dataset.theme,body:getComputedStyle(document.body).backgroundColor,alerts:[...document.querySelectorAll('[role=alert]')].map(x=>x.textContent)}))
    await page.screenshot({path:path.join(out,file),fullPage:true})
    manifest.screenshots.push({file,route,width,theme,classification:manifest.kind,...metrics});save()
  }
}
try {
  const status=await request('/status');if(status.payments!=='DEVELOPMENT_MOCK')throw Error('Not isolated mock preview')
  const publicContext=await contextFor();const publicPage=await publicContext.newPage()
  publicPage.on('pageerror',e=>{manifest.errors.push(e.message);save()})
  for(const [name,route] of [['home','/'],['login','/login'],['commerce','/package']])await captures(publicPage,name,route)
  await publicContext.close()
  const admin=await request('/auth/login',null,'POST',{email:'admin@cent.local',password:'cent-local-preview-only'})
  const users=await request('/admin/users',admin.token)
  const orders=await request('/admin/orders',admin.token)
  const fixture=JSON.parse(fs.readFileSync('tests/browser/artifacts/result.json','utf8'))
  const order=orders.find(x=>x.trainingId===fixture.trainingId&&x.status==='PAID')
  const user=users.find(x=>x.id===order?.userId)
  if(!user?.email.startsWith('study-'))throw Error('Missing known local smoke learner')
  const learner=await request('/auth/login',null,'POST',{email:user.email,password:'cent-local-preview-only'})
  const studentContext=await contextFor(learner);const page=await studentContext.newPage()
  page.on('pageerror',e=>{manifest.errors.push(e.message);save()})
  for(const [name,route] of [['dashboard','/student'],['account','/student/profile'],['reader',`/student/study/${fixture.docId}`]])await captures(page,name,route)
  const results=await request('/attempts/',learner.token)
  if(results.length)await captures(page,'results',`/student/results/${results[0].attemptId||results[0].id}`)
  else manifest.checks.push({results:'No existing attempt for smoke learner; captured using real progress-suite learner below if available'})
  await page.goto(root+'/diagnostic/test?course=math')
  await page.getByRole('button',{name:'شروع آزمون',exact:true}).click()
  await page.locator('.options-list button').first().waitFor()
  // Navigate away/back using existing attempt persistence; no answers/submission/timer changes.
  await captures(page,'assessment','/diagnostic/test?course=math')
  await studentContext.close()
  const adminContext=await contextFor(admin);const adminPage=await adminContext.newPage()
  await captures(adminPage,'admin','/admin')
  await adminContext.close()
  save()
} catch(error) {manifest.errors.push(error.message);save();throw error}
finally {await browser.close()}
