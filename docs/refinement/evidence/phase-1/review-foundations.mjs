/* global fetch, sessionStorage, window, document, innerWidth, getComputedStyle */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
const out=path.dirname(fileURLToPath(import.meta.url)),root='http://localhost:5173/cent-s',api='http://127.0.0.1:5108/api/cent/v1'
const report={responsive:[],contrast:[],states:[],errors:[]}
const browser=await chromium.launch({channel:'chrome',headless:true})
async function call(endpoint,token,method='GET',body){const r=await fetch(api+endpoint,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});if(!r.ok)throw Error(`${endpoint} ${r.status}`);return r.json()}
try {
  const admin=await call('/auth/login',null,'POST',{email:'admin@cent.local',password:'cent-local-preview-only'})
  const users=await call('/admin/users',admin.token)
  const learner=users.filter(x=>x.email.startsWith('progress-')&&!x.email.startsWith('progress-other-')).at(-1)
  if(!learner)throw Error('Missing progress suite local learner')
  const session=await call('/auth/login',null,'POST',{email:learner.email,password:'progress-local-check'})
  const context=await browser.newContext({viewport:{width:1440,height:1000}})
  await context.addInitScript(({token,expiresAt})=>{sessionStorage.setItem('cent:session:v1',token);sessionStorage.setItem('cent:session-expiry:v1',expiresAt)},session)
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message))
  const results=await call('/attempts/',session.token)
  const routes=[['home','/'],['login','/login'],['dashboard','/student'],['account','/student/profile'],['assessment','/diagnostic/test?course=math'],['commerce','/package']]
  if(results.length)routes.push(['results',`/student/results/${results[0].result?.id||results[0].attemptId||results[0].id}`])
  for(const [name,route] of routes) {
    await page.goto(root+route);await page.waitForSelector('#root > *');await page.waitForLoadState('networkidle')
    for(const theme of ['light','dark']) {
      await page.evaluate(t=>window.ItatestAppearance.setPreference(t),theme)
      for(const width of [320,375,390,768,1024,1280,1440]) {
        await page.setViewportSize({width,height:900})
        report.responsive.push({name,route,theme,width,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,appearance:[...document.querySelectorAll('.appearance-control select')].filter(e=>e.getBoundingClientRect().width).map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))}))})
      }
      const pairs=await page.evaluate(()=>{
        const roles=['text','text-secondary','action-text','selected-text','success','warning','error','info','focus','border-interactive','progress','on-strong','on-strong-secondary','secondary-action-text']
        const backgrounds=['page','surface','action','selected','success-surface','warning-surface','error-surface','info-surface','surface','surface','progress-track','strong-surface','strong-surface','secondary-action']
        return roles.map((role,i)=>{
          const probe=document.createElement('span');probe.style.color=`var(--color-${role})`;probe.style.backgroundColor=`var(--color-${backgrounds[i]})`;document.body.append(probe);const computed=getComputedStyle(probe);const pair={role,backgroundRole:backgrounds[i],foreground:computed.color,background:computed.backgroundColor};probe.remove();return pair
        })
      })
      report.contrast.push({name,theme,pairs})
      if(name==='results')for(const width of [390,1440]) {
        await page.setViewportSize({width,height:width===390?844:1000});await page.waitForTimeout(700);await page.screenshot({path:path.join(out,`results-${theme}-${width}.png`),fullPage:true})
      }
    }
  }
  await context.close()
}catch(error){report.errors.push(error.message);throw error}
finally {fs.writeFileSync(path.join(out,'foundation-review.json'),JSON.stringify(report,null,2));await browser.close()}
