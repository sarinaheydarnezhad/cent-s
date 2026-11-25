import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
const root='http://127.0.0.1:5173/cent-s',out='docs/educational-reader-pilot/phase-5/verification'
const sessions=JSON.parse(readFileSync('.preview-artifacts/phase5/local-review-sessions.json','utf8'))
const samples=JSON.parse(readFileSync(out+'/lesson-samples.json','utf8')),checks=[],errors=[]
const browser=await chromium.launch({channel:'chrome',headless:true})
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(45000);page.on('pageerror',e=>errors.push(e.message))
 await page.goto(root)
 async function identity(role){await page.evaluate(s=>{sessionStorage.setItem('cent:session:v1',s.token);sessionStorage.setItem('cent:session-expiry:v1',s.expiresAt)},sessions.find(s=>s.role===role))}
 await identity('ADMIN')
 for(const sample of samples){
  await page.goto(root+'/admin/content-preview/'+sample.documentId);await page.locator('.pilot-content').waitFor()
  const select=page.getByLabel('انتخاب بخش')
  if(await select.inputValue()!==sample.sectionId){const loaded=page.waitForResponse(r=>r.url().endsWith('/preview/'+sample.sectionId)&&r.status()===200);await select.selectOption(sample.sectionId);await loaded;await page.locator('.pilot-content').waitFor()}
  if(sample.hasTable)assert.ok(await page.locator('.pilot-content table').count())
  if(sample.hasFormulaMarkup)assert.ok(await page.locator('.pilot-content sup,.pilot-content sub').count())
  if(sample.hasDetails){const detail=page.locator('.pilot-content details').first();const summary=detail.locator('summary').first();await summary.focus();await page.keyboard.press('Enter');assert.ok(await detail.evaluate(el=>el.open));await page.keyboard.press('Enter');assert.ok(await detail.evaluate(el=>!el.open))}
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(sample.subject==='math'){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:out+'/../after/admin-preview-mobile-after.png'})}await page.setViewportSize({width:1440,height:1000})
  checks.push({requirement:sample.subject+'-lesson-interactions',status:'PASS',table:sample.hasTable,formulaMarkup:sample.hasFormulaMarkup,keyboardSelfCheckReveal:sample.hasDetails,mobileViewport:true,reviewRole:'ADMIN',scientificApproval:false})
 }
 await identity('STUDENT')
 await page.goto(root+'/student/practice?assessment=reading-itatest-mock-01')
 await page.locator('.assessment-setup button.button-primary').click();await page.locator('#assessment-question-title').waitFor()
 await page.getByRole('region',{name:'متن مرتبط با سؤال'}).waitFor()
 assert.equal(await page.locator('.assessment-result-summary').count(),0)
 await page.locator('.options-list button').first().click();await page.locator('.assessment-question-map button').last().click()
 await page.getByRole('button',{name:'ثبت و دیدن نتیجه',exact:true}).click();await page.waitForURL('**/student/results/*');await page.locator('.assessment-result-summary').waitFor()
 checks.push({requirement:'reading-assessment-browser-journey',status:'PASS',passageVisible:true,answerSelection:true,submitted:true,resultVisible:true,remainingAnswersBlank:true})
 assert.deepEqual(errors,[])
}catch(e){errors.push(e.stack);process.exitCode=1}
finally{writeFileSync(out+'/normal-interactions.json',JSON.stringify({checks,errors,realDevice:false},null,2));await browser.close()}
