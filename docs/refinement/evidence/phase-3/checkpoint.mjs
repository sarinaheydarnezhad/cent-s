/* global window, document, innerWidth, fetch, URL */
import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
const out='docs/refinement/evidence/phase-3'
fs.mkdirSync(out,{recursive:true})
const files=['src/components/GoogleSignIn.tsx','src/state/AppState.tsx','src/App.tsx',...fs.readdirSync('src/services').map(x=>'src/services/'+x),'public/appearance.js','public/_headers','vite.config.ts','package.json','package-lock.json',...fs.readdirSync('public/brand').map(x=>'public/brand/'+x),'src/components/UI.tsx','src/components/Fields.tsx','src/components/Dialog.tsx','src/foundations.css','src/foundation-ui.css']
fs.writeFileSync(out+'/protected-before.json',JSON.stringify(Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')])),null,2))
fs.writeFileSync(out+'/git-before.json',JSON.stringify({branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),status:execFileSync('git',['status','--short'],{encoding:'utf8'})},null,2))
const status=await (await fetch('http://127.0.0.1:5108/api/cent/v1/status')).json()
if(status.payments!=='DEVELOPMENT_MOCK')throw Error('Expected existing local preview')
fs.writeFileSync(out+'/preview-status.json',JSON.stringify({status,source:'Existing local service; no backend repository access',isolation:'Prior verified frontend-local Cent.Preview SQLite; read-only public GET captures only at baseline'},null,2))
fs.writeFileSync(out+'/authorization.md','# Phase 3 authorization checkpoint\n\n2026-11-18: Owner visually approved Phase 2 and authorized Phase 3 public/auth presentation only. Phase 2 is closed with its documented limitations retained. Frontend main at 8e87191 was clean before this evidence directory was added. No commit/push/deploy, backend repository access or Phase 4 work. Existing services at 5173/5108 are reused; a duplicate frontend was stopped and duplicate preview startup exited on occupied port. No existing process was stopped.\n\nNo password recovery API/route, About/Help/Contact/Legal page exists. Do not fabricate these. CEnT-S available; IMAT/SAT explicitly unavailable. Commerce/assessment/student/admin logic and official GIS button remain protected.\n')
const browser=await chromium.launch({channel:'chrome',headless:true})
const captures=[]
try{
const context=await browser.newContext()
await context.route('**/*',r=>{const u=new URL(r.request().url());return /^https?:$/.test(u.protocol)&&!['localhost','127.0.0.1'].includes(u.hostname)?r.abort():r.continue()})
const page=await context.newPage()
for(const [name,route] of [['home','/'],['exam','/exam'],['intro','/diagnostic/intro'],['course','/courses/math'],['login','/login'],['register','/login'],['callback','/auth/google/callback?error=access_denied'],['not-found','/missing-page']])for(const theme of ['light','dark'])for(const width of [390,1440]){
await page.setViewportSize({width,height:900});await page.goto('http://localhost:5173/cent-s'+route)
await page.evaluate(t=>window.ItatestAppearance.setPreference(t),theme)
if(name==='register')await page.getByRole('button',{name:'ثبت‌نام',exact:true}).click()
await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready)
const file=`before-${name}-${theme}-${width}.png`;await page.screenshot({path:out+'/'+file,fullPage:true})
captures.push({file,route,theme,width,kind:'Actual rendered local page; local backend public GETs; callback missing-proof recovery; external requests blocked',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)})
}
fs.writeFileSync(out+'/before-captures.json',JSON.stringify(captures,null,2))
}finally{await browser.close()}
