/* global document, window, innerWidth, getComputedStyle, URL, console */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { root, browserOptions } from './environment.mjs'

const out=fileURLToPath(new URL('../../docs/refinement/evidence/phase-2/',import.meta.url))
const result={kind:'Actual shared React components with explicitly illustrative preview values and injected feedback; no backend operations',checks:[],responsive:[],contrast:[],states:[],screenshots:[],errors:[]}
const save=()=>fs.writeFileSync(out+'components-result.json',JSON.stringify(result,null,2))
const browser=await chromium.launch(browserOptions)
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000}})
 await context.route('**/*',route=>{const u=new URL(route.request().url());return /^https?:$/.test(u.protocol)&&!['localhost','127.0.0.1'].includes(u.hostname)?route.abort():route.continue()})
 const page=await context.newPage();page.on('pageerror',error=>{result.errors.push(error.message);save()})
 await page.goto(root+'/component-reference.html');await page.getByRole('heading',{name:'A shared language for the next step.'}).waitFor();await page.evaluate(()=>document.fonts.ready)
 const check=(description)=>{result.checks.push(description);save()}
 const capture=async(file,locator=page,fullPage=true)=>{await locator.screenshot({path:out+file,...(locator===page?{fullPage}:{})});result.screenshots.push({file,kind:result.kind});save()}
 for(const theme of ['light','dark']) {
  await page.evaluate(value=>window.ItatestAppearance.setPreference(value),theme)
  for(const width of [320,375,390,768,1024,1280,1440]) {
   await page.setViewportSize({width,height:1000})
   const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,direction:getComputedStyle(document.body).direction}))
   result.responsive.push({theme,...metrics});assert.ok(metrics.scrollWidth<=width+1,`${theme} overflow ${width}`);assert.equal(metrics.direction,'rtl')
  }
  for(const width of [390,1440]) {
   await page.setViewportSize({width,height:1000})
   await capture(`reference-${theme}-${width}.png`)
   for(const section of ['buttons','surfaces','fields','selection','feedback','learning','states']) await capture(`${section}-${theme}-${width}.png`,page.locator('#'+section))
  }
  await page.setViewportSize({width:1440,height:1000})
  const primary=page.locator('[data-example="button-variants"] .button-primary')
  await primary.hover()
  const color=()=>primary.evaluate(el=>({background:getComputedStyle(el).backgroundColor,foreground:getComputedStyle(el).color,outline:getComputedStyle(el).outlineStyle}))
  result.states.push({theme,state:'hover',...await color()});await capture(`buttons-hover-${theme}.png`,page.locator('#buttons'))
  await page.mouse.down();result.states.push({theme,state:'pressed',...await color()});await capture(`buttons-pressed-${theme}.png`,page.locator('#buttons'));await page.mouse.up()
  await primary.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab')
  assert.equal(await primary.evaluate(el=>el.matches(':focus-visible')),true)
  assert.equal((await color()).outline,'solid');result.states.push({theme,state:'keyboard-focus',...await color()});await capture(`buttons-focus-${theme}.png`,page.locator('#buttons'))
  const pairs=await page.evaluate(()=>{
   const selectors=['[data-example="button-variants"] .button-primary','[data-example="button-variants"] .button-secondary','[data-example="button-variants"] .button-tertiary','[data-example="button-variants"] .button-destructive','.ui-card-learning','.ui-card-recommendation','.ui-badge-learning','.ui-badge-recommendation','.ui-badge-success','.ui-badge-warning','.ui-badge-error','.ui-badge-info','.ui-notice-info','.ui-notice-success','.ui-notice-warning','.ui-notice-error','.ui-field-hint','.ui-required','.ui-input']
   const rgb=str=>str.match(/[\d.]+/g)?.slice(0,3).map(Number)
   function luminance(color) {return color.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0)}
   const ratio=(a,b)=>{const l=[luminance(rgb(a)),luminance(rgb(b))].sort((x,y)=>y-x);return (l[0]+.05)/(l[1]+.05)}
   const background=el=>{let current=el;while(current){const c=getComputedStyle(current).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent')return c;current=current.parentElement}return getComputedStyle(document.body).backgroundColor}
   const pairs=selectors.map(selector=>{const el=document.querySelector(selector),style=getComputedStyle(el);const bg=background(el);return {selector,foreground:style.color,background:bg,ratio:ratio(style.color,bg),minimum:4.5}})
   for(const selector of ['.ui-input','.progress-value.primary','.progress-value.action']) {
    const el=document.querySelector(selector),style=getComputedStyle(el);const fg=selector==='.ui-input'?style.borderTopColor:style.backgroundColor;const bg=background(selector==='.ui-input'?el:el.parentElement)
    pairs.push({selector,kind:'control border or progress fill',foreground:fg,background:bg,ratio:ratio(fg,bg),minimum:3})
   }
   return pairs
  });for(const pair of pairs){result.contrast.push({theme,...pair});assert.ok(pair.ratio>=pair.minimum,`${theme} ${pair.selector} ${pair.ratio}`)}
 }
 check('Both themes: 14 responsive observations, rendered text/control contrast, hover/pressed/keyboard-focus screenshots, Persian RTL and mobile/desktop reference')
 await page.setViewportSize({width:1440,height:1000})
 const loading=page.getByRole('button',{name:'آزمایش بارگذاری',exact:true})
 const before=await loading.boundingBox();await loading.click();const busy=page.getByRole('button',{name:'در حال آماده‌سازی…',exact:true});assert.equal(await busy.isDisabled(),true);assert.equal(await busy.getAttribute('aria-busy'),'true');const after=await busy.boundingBox();assert.equal(before.width,after.width);assert.equal(before.height,after.height)
 await busy.evaluate(el=>{window.__duplicateClicks=0;el.addEventListener('click',()=>window.__duplicateClicks++);el.click();el.click()});assert.equal(await page.evaluate(()=>window.__duplicateClicks),0)
 await page.getByRole('button',{name:'پایان آزمایش',exact:true}).click();check('Loading buttons reserve dimensions, expose busy state and reject repeated native activation')
 await page.getByRole('button',{name:'نمایش خطای نمونه',exact:true}).click()
 const field=page.getByLabel('ایمیل نمونه',{exact:true});assert.equal(await field.getAttribute('aria-invalid'),'true');const ids=(await field.getAttribute('aria-describedby')).split(' ');assert.equal(ids.length,2)
 for(const id of ids)assert.ok(await page.locator(`[id="${id}"]`).textContent())
 assert.equal(await field.getAttribute('dir'),'ltr');assert.equal(await page.getByLabel('فقط خواندنی',{exact:true}).getAttribute('readonly'),'')
 for(const theme of ['light','dark']) {
  await page.evaluate(value=>window.ItatestAppearance.setPreference(value),theme)
  await capture(`fields-invalid-${theme}.png`,page.locator('#fields'))
  const pairs=await page.evaluate(()=>{
   const rgb=str=>str.match(/[\d.]+/g).slice(0,3).map(Number)
   const luminance=color=>rgb(color).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0)
   return [['.ui-field-error','color',4.5],['.ui-input[aria-invalid="true"]','borderTopColor',3]].map(([selector,property,minimum])=>{const style=getComputedStyle(document.querySelector(selector));const foreground=style[property],background=getComputedStyle(document.body).backgroundColor;const l=[luminance(foreground),luminance(background)].sort((a,b)=>b-a);return {selector,foreground,background,minimum,ratio:(l[0]+.05)/(l[1]+.05)}})
  });for(const pair of pairs){result.contrast.push({theme,...pair});assert.ok(pair.ratio>=pair.minimum)}
 }
 await page.getByRole('button',{name:'پاک‌کردن خطای نمونه',exact:true}).click();assert.equal(await field.getAttribute('aria-invalid'),null)
 check('Dynamic field errors/hints attach to their native inputs; clearing errors removes invalid state; readonly/LTR retained')
 const filters=page.getByRole('group',{name:'فیلتر درس نمونه'});await filters.getByRole('button',{name:'ریاضی',exact:true}).click();assert.equal(await filters.getByRole('button',{name:'ریاضی',exact:true}).getAttribute('aria-pressed'),'true');assert.equal(await filters.getByRole('button',{name:'همه',exact:true}).getAttribute('aria-pressed'),'false')
 const radios=page.getByRole('group',{name:'روش مطالعه نمونه'});await radios.getByRole('radio',{name:'مرور',exact:true}).focus();await page.keyboard.press('ArrowDown');assert.equal(await radios.getByRole('radio',{name:'تمرین',exact:true}).isChecked(),true)
 const card=page.locator('.ui-card-interactive');assert.equal(await card.getAttribute('aria-pressed'),'false');await card.focus();await page.keyboard.press('Space');assert.equal(await card.getAttribute('aria-pressed'),'true')
 check('Filters expose a single pressed choice; native radio arrows and whole-card Space activation work')
 for(const theme of ['light','dark'])for(const width of [390,1440]) {
  await page.evaluate(value=>window.ItatestAppearance.setPreference(value),theme);await page.setViewportSize({width,height:900})
  const trigger=page.getByRole('button',{name:'تأیید حذف نمونه',exact:true});await trigger.click()
  const dialog=page.getByRole('dialog',{name:'یادداشت نمونه حذف بشه؟',exact:true});await dialog.waitFor();const cancel=dialog.getByRole('button',{name:'انصراف',exact:true});const confirm=dialog.getByRole('button',{name:'حذف نمونه',exact:true})
  assert.equal(await cancel.evaluate(el=>el===document.activeElement),true);assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden')
  await page.keyboard.press('Shift+Tab');assert.equal(await confirm.evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Tab');assert.equal(await cancel.evaluate(el=>el===document.activeElement),true)
  await capture(`dialog-${theme}-${width}.png`,page,false)
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);assert.notEqual(await page.evaluate(()=>document.body.style.overflow),'hidden')
 }
 await page.getByRole('button',{name:'گفت‌وگوی بدون خروج با Escape',exact:true}).click();const locked=page.getByRole('dialog',{name:'نمونه تصمیم ضروری',exact:true});await page.keyboard.press('Escape');assert.equal(await locked.isVisible(),true);await locked.getByRole('button',{name:'بستن',exact:true}).click();await locked.waitFor({state:'hidden'})
 await page.getByRole('button',{name:'بازکردن گفت‌وگو',exact:true}).click();const info=page.getByRole('dialog',{name:'جزئیات نمونه',exact:true});assert.ok(await info.getAttribute('aria-describedby'));await info.getByRole('button',{name:'بستن',exact:true}).click()
 check('Dialog safe initial focus, bidirectional native focus containment, Escape, guarded dismissal, accessible name/description, scroll lock and restoration in both themes/mobile/desktop')
 await page.getByRole('button',{name:'نمایش تأیید نمونه',exact:true}).click();await page.getByRole('status').filter({hasText:'ذخیره شد'}).waitFor()
 await page.getByRole('button',{name:'دوباره تلاش کن',exact:true}).last().click();await page.getByRole('status').filter({hasText:'نمونه بازیابی شد'}).waitFor();assert.equal(await page.getByRole('alert').count(),0)
 check('Polite status acknowledges save; contextual recovery replaces its injected error after explicit retry')
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.cent-spinner').first().evaluate(el=>getComputedStyle(el).animationName),'none');check('Reduced-motion removes spinner animation; label continues to communicate loading')
 await page.setViewportSize({width:720,height:900});await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await capture('reference-text-200-dark.png');await page.evaluate(()=>document.documentElement.style.fontSize='');check('200% text-size sample and 320 CSS-pixel reflow fit without document overflow; not a full assistive-technology audit')
 assert.deepEqual(result.errors,[]);result.success=true;save();console.log(`Component browser checks passed: ${result.checks.length} groups, ${result.contrast.length} contrast pairs, ${result.responsive.length} responsive observations`)
} catch(error) {result.failure=error.stack;save();throw error} finally {await browser.close()}
