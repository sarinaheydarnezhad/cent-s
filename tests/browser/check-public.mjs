/* global window, document, getComputedStyle, innerWidth, console */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import process from 'node:process'
import { URL } from 'node:url'
import { chromium } from 'playwright'
import { root, browserOptions, requireLocalPreview } from './environment.mjs'

// Public GETs use the isolated local preview. Failures below are explicitly
// injected; no registration, purchase or real Google request is performed.
await requireLocalPreview()
const out=process.env.ITATEST_PUBLIC_EVIDENCE_DIR || 'docs/refinement/evidence/phase-3/'
fs.mkdirSync(out,{recursive:true})
const label=process.env.ITATEST_EVIDENCE_LABEL||'development'
const captureEnabled=process.env.ITATEST_PUBLIC_CAPTURE!=='0'
const result={label,root,kind:'Actual local public pages; injected failures identified separately',success:false,checks:[],responsive:[],contrast:[],screenshots:[],errors:[]}
const save=()=>fs.writeFileSync(out+`public-${label}-result.json`,JSON.stringify(result,null,2))
const browser=await chromium.launch(browserOptions)
try {
 const context=await browser.newContext({viewport:{width:1440,height:900}})
 await context.route('**/*',route=>{const u=new URL(route.request().url());return /^https?:$/.test(u.protocol)&&!['localhost','127.0.0.1'].includes(u.hostname)?route.abort():route.continue()})
 const page=await context.newPage();page.on('pageerror',e=>{result.errors.push(e.message);save()})
 const check=text=>{result.checks.push(text);save()}
 const capture=async(file,locator=page,kind='Actual rendered local service; no API response mock')=>{
  if(!captureEnabled)return
  await locator.screenshot({path:out+file,...(locator===page?{fullPage:true}:{})})
  result.screenshots.push({file,kind});save()
 }
 const measure=async selectors=>{
  const pairs=await page.evaluate(selectors=>{
   const rgb=str=>str.match(/[\d.]+/g).slice(0,3).map(Number)
   const lum=str=>rgb(str).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)
   const bg=el=>{for(let n=el;n;n=n.parentElement){const c=getComputedStyle(n).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent')return c}return getComputedStyle(document.body).backgroundColor}
   return selectors.map(([selector,property='color',minimum=4.5])=>{const el=document.querySelector(selector),style=getComputedStyle(el),foreground=style[property],background=bg(el);const l=[lum(foreground),lum(background)].sort((a,b)=>b-a);return {selector,property,minimum,foreground,background,ratio:(l[0]+.05)/(l[1]+.05)}})
  },selectors)
  for(const pair of pairs){result.contrast.push({theme:await page.locator('html').getAttribute('data-theme'),...pair});assert.ok(pair.ratio>=pair.minimum,`${pair.selector}: ${pair.ratio}`)}save()
 }
 const routes=[['home','/'],['exam','/exam'],['intro','/diagnostic/intro'],['course','/courses/math'],['login','/login'],['register','/login'],['callback','/auth/google/callback?error=access_denied'],['not-found','/missing-page']]
 for(const [name,route] of routes)for(const theme of ['light','dark']){
  await page.goto(root+route);await page.evaluate(t=>window.ItatestAppearance.setPreference(t),theme)
  if(name==='register')await page.getByRole('button',{name:'ثبت‌نام',exact:true}).click()
  await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready)
  assert.equal(await page.locator('h1').count(),1,`${name} one main heading`)
  assert.equal(await page.getByRole('main').count(),1)
  for(const width of [320,375,390,768,1024,1280,1440]){
   await page.setViewportSize({width,height:900})
   const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,direction:getComputedStyle(document.body).direction}))
   result.responsive.push({name,theme,...metrics});assert.ok(metrics.scroll<=width+1,`${name} ${theme} overflow ${width}: ${metrics.scroll}`);assert.equal(metrics.direction,'rtl')
  }
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});await capture(`after-${name}-${theme}-${width}.png`)
  }
  if(name==='home'){
   const future=page.locator('.public-exam-card').filter({hasText:'در برنامه آینده'})
   assert.equal(await future.count(),2);assert.equal(await future.locator('a,button').count(),0)
   assert.equal(await page.locator('[data-course]').count(),5)
   assert.equal(await page.locator('.public-hero .button-primary').count(),1)
   assert.equal(await page.locator('.public-hero .button-primary').getAttribute('href'),new URL(root+'/diagnostic/intro').pathname)
   await measure([['.public-hero h1'],['.public-hero-copy > p'],['.public-hero .button-primary'],['.public-hero .button-secondary'],['.public-hero .ui-badge-learning'],['.public-art-caption'],['.public-path'],['.public-path p'],['.public-exam-card p'],['.public-exam-available p'],['.public-resources .cent-product p'],['.footer p'],['.footer nav a'],['.footer h2']])
   await capture(`hero-${theme}-1440.png`,page.locator('.public-hero'))
   await capture(`exams-${theme}-1440.png`,page.locator('.public-exam-grid'))
   await capture(`footer-${theme}-1440.png`,page.locator('.footer'))
   await page.setViewportSize({width:390,height:844})
   const trigger=page.locator('[aria-controls="public-navigation"]')
   const nav=page.locator('#public-navigation')
   assert.equal(await trigger.getAttribute('aria-expanded'),'false')
   await nav.locator('a').first().evaluate(el=>el.focus())
   assert.equal(await nav.evaluate(el=>el.contains(document.activeElement)),false,'Closed nav removed from keyboard focus')
   await trigger.focus();await page.keyboard.press('Enter')
   assert.equal(await trigger.getAttribute('aria-expanded'),'true')
   assert.equal(await nav.locator('a').first().evaluate(el=>document.activeElement===el),true,'Open public navigation focuses first destination')
   await capture(`mobile-navigation-${theme}.png`,page,'Actual mobile navigation open; local service')
   await page.keyboard.press('Escape');assert.equal(await trigger.getAttribute('aria-expanded'),'false')
   assert.equal(await trigger.evaluate(el=>el===document.activeElement),true)
   await trigger.click();await nav.getByRole('link',{name:'آشنایی با آزمون',exact:true}).click()
   await page.waitForURL(root+'/exam');assert.equal(await trigger.getAttribute('aria-expanded'),'false')
   await page.goto(root+'/');await page.keyboard.press('Control+Home')
   await page.locator('.public-skip-link').focus();await page.keyboard.press('Enter')
   assert.equal(await page.locator('#public-main').evaluate(el=>el===document.activeElement),true)
  }
  if(name==='login'){
   await measure([['.public-auth h1'],['.public-auth-description'],['.public-auth .ui-field-label'],['.public-auth .ui-field-hint'],['.public-auth .auth-security'],['.public-auth .ui-input','borderTopColor',3],['.auth-tabs .active']])
   const email=page.getByLabel('ایمیل',{exact:true}),password=page.getByLabel('رمز عبور',{exact:true})
   assert.equal(await email.getAttribute('dir'),'ltr');assert.equal(await password.getAttribute('minlength'),'10');assert.equal(await password.getAttribute('maxlength'),'128')
   const hint=await password.getAttribute('aria-describedby');assert.ok(await page.locator(`[id="${hint}"]`).textContent())
   await email.fill('invalid');await page.getByRole('button',{name:'ورود به حساب',exact:true}).click()
   assert.equal(await email.evaluate(el=>el.validity.typeMismatch),true)
   assert.equal(await email.evaluate(el=>el===document.activeElement),true)
   await page.setViewportSize({width:390,height:900});await capture(`native-validation-${theme}.png`,page,'Actual native invalid email presentation; no request')
  }
  if(name==='register'){
   assert.equal(await page.getByLabel('نام و نام خانوادگی',{exact:true}).getAttribute('required'),'')
   await page.getByRole('button',{name:'ساخت حساب',exact:true}).click()
   assert.equal(await page.getByLabel('نام و نام خانوادگی',{exact:true}).evaluate(el=>el===document.activeElement),true)
  }
 }
 check('Eight public/auth states: one h1/main, Persian RTL, 112 responsive observations across seven widths, light/dark matched evidence')
 check('Truthful CEnT-S/future exam availability, actual five-course list, one hero primary; measured rendered contrast')
 check('Mobile menu first-link focus, hidden keyboard exclusion, Escape/restoration, route closure and skip-to-main keyboard navigation')
 check('Login/registration native constraints, exact visible labels, LTR email/password, associated hint and invalid focus retained')

 for(const theme of ['light','dark']){
  await page.goto(root+'/login');await page.evaluate(t=>window.ItatestAppearance.setPreference(t),theme)
  await page.setViewportSize({width:390,height:900})
  let requests=0
  await page.route('**/api/cent/v1/auth/login',async route=>{requests++;await route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({message:'ایمیل یا رمز عبور درست نیست. دوباره بررسی کن.'})})})
  await page.getByLabel('ایمیل',{exact:true}).fill('preview@example.test');await page.getByLabel('رمز عبور',{exact:true}).fill('synthetic-password')
  await page.getByRole('button',{name:'ورود به حساب',exact:true}).click();await page.getByRole('alert').filter({hasText:'ایمیل یا رمز'}).waitFor()
  assert.equal(requests,1);assert.equal(await page.getByLabel('ایمیل',{exact:true}).inputValue(),'preview@example.test')
  await measure([['.public-auth .ui-notice-error']]);await capture(`auth-error-${theme}-390.png`,page,'Injected HTTP401 synthetic authentication failure; no real credential')
  await page.setViewportSize({width:1440,height:900});await capture(`auth-error-${theme}-1440.png`,page,'Injected HTTP401 synthetic authentication failure')
  await page.getByRole('button',{name:'ثبت‌نام',exact:true}).click();assert.equal(await page.getByRole('alert').count(),0)
  await page.unroute('**/api/cent/v1/auth/login')
  let fail=true
  await page.route('**/api/cent/v1/curriculum',route=>fail?route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'نتونستیم اطلاعات رو بارگذاری کنیم.'})}):route.continue())
  await page.goto(root+'/exam');await page.getByRole('alert').waitFor();assert.equal(await page.locator('[data-course]').count(),0)
  await page.setViewportSize({width:390,height:900});await capture(`resource-error-${theme}.png`,page,'Injected HTTP503 curriculum failure; no empty-data fallback')
  fail=false;await page.getByRole('button',{name:'دوباره تلاش کن'}).click();await page.locator('[data-course]').last().waitFor();assert.equal(await page.locator('[data-course]').count(),5)
  await page.unroute('**/api/cent/v1/curriculum')
 }
 check('Persistent injected auth failure preserves fields, no duplicate request, mode clears feedback; injected resource failure retains actual retry/no fake empty data')
 await page.goto(root+'/');await page.emulateMedia({reducedMotion:'reduce'})
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto')
 await page.setViewportSize({width:768,height:1000});await page.evaluate(()=>document.documentElement.style.fontSize='200%')
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% public text reflow')
 await capture('home-text-200.png',page,'Actual 200% root text sample, 768 CSS pixels, reduced motion')
 await page.evaluate(()=>document.documentElement.style.fontSize='')
 await page.goto(root+'/package');await page.locator('[data-course]').last().waitFor()
 for(const theme of ['light','dark'])for(const width of [390,1440]){
  await page.evaluate(t=>window.ItatestAppearance.setPreference(t),theme);await page.setViewportSize({width,height:900})
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
  await capture(`shell-catalog-${theme}-${width}.png`,page,'Actual local commerce catalog; shared shell only, workflow unchanged')
 }
 check('Reduced motion/200% text sample and unchanged catalog workflow in redesigned shared public shell')
 assert.deepEqual(result.errors,[])
 result.success=true;save();console.log(`Public checks passed: ${result.checks.length} groups, ${result.responsive.length} responsive observations, ${result.contrast.length} contrast pairs, ${result.screenshots.length} captures`)
} catch(error){result.failure=error.stack;save();throw error}finally{await browser.close()}
