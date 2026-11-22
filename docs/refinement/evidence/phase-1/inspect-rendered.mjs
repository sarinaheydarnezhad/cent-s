/* global fetch, document, window, sessionStorage, getComputedStyle, innerWidth, performance */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
const out=path.dirname(fileURLToPath(import.meta.url)),root='http://localhost:5173/cent-s',api='http://127.0.0.1:5108/api/cent/v1'
const report={kind:'Actual local preview states, no mocked responses',responsive:[],states:[],errors:[]}
const browser=await chromium.launch({channel:'chrome',headless:true})
async function call(endpoint,token,body){const r=await fetch(api+endpoint,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});if(!r.ok)throw Error(`${endpoint} ${r.status}`);return r.json()}
async function context(session){const c=await browser.newContext({viewport:{width:1440,height:1000}});await c.addInitScript(({token,expiresAt})=>{sessionStorage.setItem('cent:session:v1',token);sessionStorage.setItem('cent:session-expiry:v1',expiresAt)},session);return c}
async function sample(page,selector) {
  return page.locator(selector).first().evaluate(el=>{
    const s=getComputedStyle(el);let background=s.backgroundColor;let parent=el.parentElement
    while(background==='rgba(0, 0, 0, 0)'&&parent){background=getComputedStyle(parent).backgroundColor;parent=parent.parentElement}
    return {color:s.color,background,outline:s.outlineColor,outlineStyle:s.outlineStyle,border:s.borderColor,font:s.fontFamily,height:el.getBoundingClientRect().height}
  })
}
try {
  const admin=await call('/auth/login',null,{email:'admin@cent.local',password:'cent-local-preview-only'})
  const users=await call('/admin/users',admin.token),orders=await call('/admin/orders',admin.token)
  const fixture=JSON.parse(fs.readFileSync('tests/browser/artifacts/result.json','utf8'))
  const order=orders.find(x=>x.trainingId===fixture.trainingId&&x.status==='PAID'),user=users.find(x=>x.id===order?.userId)
  const learner=await call('/auth/login',null,{email:user.email,password:'cent-local-preview-only'})
  for(const [name,session,route] of [['reader',learner,`/student/study/${fixture.docId}`],['admin',admin,'/admin']]) {
    const c=await context(session),page=await c.newPage();await page.goto(root+route);await page.waitForLoadState('networkidle')
    for(const theme of ['light','dark']) {
      await page.evaluate(t=>window.ItatestAppearance.setPreference(t),theme)
      for(const width of [320,375,390,768,1024,1280,1440]){await page.setViewportSize({width,height:900});report.responsive.push({name,theme,width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)})}
      report.states.push({name,theme,selector:'.appearance-control select',...await sample(page,'.appearance-control select')})
    }
    await c.close()
  }
  const c=await context(learner),page=await c.newPage()
  await page.goto(root+'/diagnostic/test?course=math');await page.getByRole('button',{name:'شروع آزمون',exact:true}).click();await page.locator('.options-list button').first().click()
  for(const theme of ['light','dark']) {
    await page.evaluate(t=>window.ItatestAppearance.setPreference(t),theme)
    await page.locator('.appearance-control select').focus()
    for(const selector of ['.appearance-control select','.options-list button.selected','.options-list button.selected > span','.question-actions button:disabled'])report.states.push({name:'assessment',theme,selector,...await sample(page,selector)})
    await page.locator('.options-list button').nth(1).hover()
    report.states.push({name:'assessment-hover',theme,selector:'.options-list button',...await sample(page,'.options-list button:nth-child(2)')})
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(700);await page.screenshot({path:path.join(out,`assessment-selected-${theme}-390.png`),fullPage:true})
  }
  await c.close()
  const publicContext=await browser.newContext(),publicPage=await publicContext.newPage();await publicPage.goto(root+'/login');await publicPage.evaluate(()=>document.fonts.ready)
  report.fonts=await publicPage.evaluate(()=>({inter:document.fonts.check('700 20px Inter'),vazirmatn600:document.fonts.check('600 16px Vazirmatn'),brand:getComputedStyle(document.querySelector('.brand b')).fontFamily,resources:performance.getEntriesByType('resource').filter(x=>/woff/.test(x.name)).map(x=>x.name.split('/').at(-1))}))
  await publicContext.close()
}catch(error){report.errors.push(error.message);throw error}
finally{fs.writeFileSync(path.join(out,'rendered-states.json'),JSON.stringify(report,null,2));await browser.close()}
