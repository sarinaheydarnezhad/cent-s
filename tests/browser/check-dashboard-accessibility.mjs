/* global document, getComputedStyle, console, process, sessionStorage, localStorage */
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { readFileSync,writeFileSync } from 'node:fs'
import { root,browserOptions } from './environment.mjs'

const fixture=JSON.parse(readFileSync('.preview-artifacts/phase4-fixture.json','utf8'))
const browser=await chromium.launch(browserOptions)
const measurements=[],checks=[]
const label=process.env.ITATEST_PHASE4_LABEL||'development'
try {
  for(const theme of ['light','dark']) {
    const context=await browser.newContext({colorScheme:theme,viewport:{width:1440,height:1000},reducedMotion:'reduce'})
    const page=await context.newPage()
    await page.goto(root)
    await page.evaluate(({token,theme})=>{sessionStorage.setItem('cent:session:v1',token);localStorage.setItem('itatest:appearance:v1',theme)},{token:fixture.returning.token,theme})
    await page.goto(root+'/student');await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready)
    await page.locator('.student-score').waitFor()
    await page.locator('[data-dashboard-resume] h3').waitFor()
    await page.locator('.student-priority-list a').first().waitFor()
    await page.waitForFunction(()=>document.querySelectorAll('[data-dashboard-progress] [role=progressbar]').length===5)
    const pairs=await page.evaluate(()=>{
      const selectors=['.student .side-nav a','.student .demo-badge','.student .logout-button','.student .brand small','.student .dashboard-topbar strong','.student .dashboard-topbar small','.student .student-account-name','.student-overview h1','.student-welcome p','.student-overview .eyebrow','.student-overview .ui-badge','.student-panel h2','.student-caption','.student-progress-label a','.student-progress-label strong','.student-course-progress small','.student-score','.student-score-ring > span','.student-result-kind','.student-result-body p','.student-recommendation > p','.student-priority-list a','.student-resume-book h3','.student-resume-book p','.student-resume-book small','.student-subject-label','.student-reading-position label','.student-resource-list b','.student-resource-list small','.student-notes-link h3','.student-notes-link p','.student-recent h2','.student-recent a','.student-recent time','.student-overview .button','.student-overview .text-link']
      const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number)
      const luminance=color=>rgb(color).map(value=>{const x=value/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((sum,value,i)=>sum+value*[.2126,.7152,.0722][i],0)
      const results=[]
      for(const selector of selectors)for(const element of document.querySelectorAll(selector)) {
        if(!element.getBoundingClientRect().width||getComputedStyle(element).visibility==='hidden')continue
        const foreground=getComputedStyle(element).color
        let node=element,backgrounds=[]
        while(node) {
          const style=getComputedStyle(node)
          if(node.classList.contains('student-score-ring')){backgrounds=[getComputedStyle(node,'::before').backgroundColor];break}
          if(style.backgroundImage!=='none'){ backgrounds=style.backgroundImage.match(/rgba?\([^)]+\)/g)||[];break }
          if(style.backgroundColor!=='rgba(0, 0, 0, 0)'&&style.backgroundColor!=='transparent'){backgrounds=[style.backgroundColor];break}
          node=node.parentElement
        }
        for(const background of backgrounds){const a=luminance(foreground),b=luminance(background);results.push({selector,text:element.textContent.trim().slice(0,55),foreground,background,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)})}
      }
      return results
    })
    measurements.push(...pairs.map(pair=>({...pair,theme})))
    for(const pair of pairs)assert.ok(pair.ratio>=4.5,`${theme} ${pair.selector}: ${pair.ratio} ${pair.foreground} on ${pair.background}`)
    assert.equal(await page.locator('.student-overview').evaluate(element=>getComputedStyle(element).animationName),'none')
    assert.equal(await page.locator('html').getAttribute('dir'),'rtl')
    const account=page.locator('.student-account-access')
    await account.focus()
    assert.notEqual(await account.evaluate(element=>getComputedStyle(element).outlineStyle),'none')
    await page.keyboard.press('Enter');await page.waitForLoadState('networkidle')
    assert.ok(page.url().endsWith('/student/profile'))
    assert.equal(await page.locator('.student-account-profile bdi').getAttribute('dir'),'ltr')
    assert.equal(await page.locator('.side-nav [aria-current=page]').innerText(),'پروفایل')
    await page.goto(root+'/student');await page.waitForLoadState('networkidle')
    await page.keyboard.press('Tab')
    // Direct focus confirms the real skip target, without relying on browser's
    // focus restoration position after a previous page navigation.
    await page.locator('.student-skip-link').focus();await page.keyboard.press('Enter')
    assert.equal(await page.locator('#student-main').evaluate(element=>element===document.activeElement),true)
    await page.setViewportSize({width:390,height:844})
    for(const selector of ['.appearance-toggle','.student-account-access','.dashboard-topbar .mobile-only','[data-dashboard-resume] > .button','.student-recommendation > .button']) {
      const rect=await page.locator(selector).first().boundingBox();assert.ok(rect.width>=44&&rect.height>=44,`${selector}: ${JSON.stringify(rect)}`)
    }
    const trigger=page.getByRole('button',{name:'نمایش منو',exact:true})
    await trigger.click();await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='بستن منو');await page.keyboard.press('Tab')
    assert.equal(await page.locator('.side-nav a').first().evaluate(element=>element===document.activeElement),true)
    const focus=await page.locator('.side-nav a').first().evaluate(element=>({style:getComputedStyle(element).outlineStyle,width:getComputedStyle(element).outlineWidth}))
    assert.notEqual(focus.style,'none');assert.ok(parseFloat(focus.width)>=2)
    await page.keyboard.press('Escape')
    assert.equal(await trigger.getAttribute('aria-expanded'),'false')
    assert.equal(await trigger.evaluate(element=>element===document.activeElement),true)
    checks.push(`${theme}: gradient endpoint text contrast, reduced motion, RTL/LTR identity, account and skip keyboard navigation, mobile targets, drawer focus/Escape`)
    await context.close()
  }
  writeFileSync(`${process.env.ITATEST_DASHBOARD_EVIDENCE || 'docs/refinement/evidence/phase-4/'}accessibility-${label}-result.json`,JSON.stringify({success:true,root,checks,measurements,limits:'Representative Chromium keyboard, semantic and gradient endpoint checks; not full WCAG/assistive-technology or cross-browser certification.'},null,2))
  console.log(`Dashboard accessibility checks passed (${measurements.length} rendered text/gradient endpoint pairs).`)
}finally{await browser.close()}
