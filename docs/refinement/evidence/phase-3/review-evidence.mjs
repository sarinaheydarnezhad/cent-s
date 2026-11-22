/* global document, innerWidth, getComputedStyle, console */
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
const out='docs/refinement/evidence/phase-3/'
const files=['PHASE_3_REPORT.md','PROGRAM_BRIEF.md','PROGRAM_STATUS.md','DECISION_LOG.md','DESIGN_SYSTEM.md','UX_WRITING.md','ACCEPTANCE_CRITERIA.md','AUDIT_COVERAGE.md','REGRESSION_REPORT.md','VISUAL_REVIEW.md','OPEN_QUESTIONS.md','IMPLEMENTATION_PLAN.md','COMPONENT_USAGE_GUIDE.md','FEEDBACK_PATTERNS.md','COMPONENT_INVENTORY.md','PHASE_2_REPORT.md']
const links=[]
for(const file of files){
 const text=fs.readFileSync('docs/refinement/'+file,'utf8').split('\n---\n')[0]
 for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
  const target=match[1]
  if(/^(?:https?:|#)/.test(target))continue
  const resolved=path.resolve('docs/refinement',target.split('#')[0])
  assert.ok(fs.existsSync(resolved),file+' -> '+target);links.push({file,target})
 }
}
const browser=await chromium.launch({channel:'chrome',headless:true})
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto('http://localhost:5173/cent-s/docs/refinement/evidence/phase-3/index.html')
 await page.getByRole('heading',{name:'Before & after',exact:true}).waitFor()
 assert.equal(await page.locator('details').count(),32)
 await page.screenshot({path:out+'visual-index-desktop.png',fullPage:false})
 await page.locator('#theme').selectOption('dark');await page.locator('#width').selectOption('390')
 assert.equal(await page.locator('details:not([hidden])').count(),8)
 await page.setViewportSize({width:390,height:844})
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
 assert.equal(await page.locator('.pair').first().evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),1)
 await page.screenshot({path:out+'visual-index-mobile.png',fullPage:false})
 await page.goto('http://localhost:5180/component-reference.html')
 await page.getByRole('heading',{name:'این صفحه پیدا نشد.'}).waitFor()
 assert.equal(await page.locator('.reference-shell').count(),0)
 await page.goto('http://localhost:5180/docs/refinement/evidence/phase-3/index.html')
 await page.getByRole('heading',{name:'این صفحه پیدا نشد.'}).waitFor()
 assert.equal(await page.locator('details').count(),0)
 assert.deepEqual(errors,[])
 fs.writeFileSync(out+'documentation-validation.json',JSON.stringify({success:true,documents:files.length,links:links.length,comparisonPairs:32,indexDesktopMobile:true,themeWidthFilters:true,noMobileOverflow:true,productionReferenceEvidenceExcluded:true,errors},null,2))
 console.log('Review index/doc links and compiled reference/evidence isolation passed')
}finally{await browser.close()}
