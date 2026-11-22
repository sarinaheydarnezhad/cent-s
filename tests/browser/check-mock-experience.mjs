/* global window, document, sessionStorage */
// Browser contract fixtures only. All API calls are intercepted; no database or
// running backend is contacted. Engine transitions are verified in Cent.Exam.Tests.
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import process from 'node:process'

const root = process.env.CENT_MOCK_WEB_URL || 'http://127.0.0.1:5184/cent-s'
assert.ok(['127.0.0.1','localhost'].includes(new URL(root).hostname))
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 950 } })
await context.addInitScript(() => sessionStorage.setItem('cent:session:v1', 'isolated-browser-fixture'))
const checks=[], errors=[]
const id='00000000-0000-0000-0000-000000000001'
const subjects=['reading','math','logic','biology','chemistry','physics']
const quotas=[10,15,15,10,10,5], seconds=[1800,1800,1800,1200,1200,600]
let active=0, revision=1, ended=false, loseAnswer=true, loseStart=true
const answers=new Map(), receipts=new Map(), commands=[], starts=[]
function state() {
  const now=Date.now()
  const sections=subjects.map((subjectId,i)=>({sectionId:'section-'+i, sectionKey:subjectId,order:i+1,subjectId,questionCount:quotas[i],durationSeconds:seconds[i],state:ended||i<active?'CLOSED_EARLY':i===active?'ACTIVE':'PENDING',deadline:new Date(now+seconds[i]*1000).toISOString()}))
  return {attemptId:id,examVersionId:'fixture-current',configurationRevision:'fixture-r1',revision,status:ended?'EXPIRED':'ACTIVE',serverNow:new Date(now).toISOString(),activeSectionId:ended?null:'section-'+active,activeSection:ended?null:sections[active],sections,...(ended?{effectiveEndedAt:new Date(now).toISOString()}: {})}
}
const options=['Alpha','Beta','Gamma','Delta','Epsilon'].map((text,i)=>({id:String.fromCharCode(97+i),text}))
function content() {
  return {attemptId:id,revision,serverNow:state().serverNow,sectionId:ended?null:'section-'+active,activeSection:ended?null:state(),passages:active===0?[{passageSnapshotId:'passage',text:'Original Reading context.\n\nEvidence comes before conclusions.'}]:[],questions:ended?[]:Array.from({length:quotas[active]},(_,i)=>({questionId:`${subjects[active]}-${i}`,position:i+1,stem:`${subjects[active]} question ${i+1}`,options,passageSnapshotId:active===0?'passage':null,selectedOptionId:answers.get(`${subjects[active]}-${i}`)??null}))}
}
const counts={questionCount:65,correctCount:1,incorrectCount:0,unansweredCount:64,answeredCount:1,rawScore:'1.00',maximumRawScore:'65.00',accuracy:{displayPercent:'100.00'},completionRate:{displayPercent:'1.54'}}
const practice={id:'practice-fixture',kind:'practice',expiresAt:new Date(Date.now()+3600000).toISOString(),contentContract:'passage-v1',passages:[{id:'p',text:'Original Practice passage.'}],questions:[0,1].map(i=>({id:'pq'+i,subject:'reading',topic:'Evidence',text:'Practice question '+i,options:['One','Two','Three','Four','Five'],difficulty:'medium',passageId:'p'}))}
const curriculum={syllabusRevisionId:'fixture-syllabus',courses:subjects.map(code=>({code,title:code,trainingId:code})),chapters:[],documents:[],topics:[{id:'topic',chapterId:'chapter',courseCode:'reading',title:'Evidence',questionCount:2,contentContract:'passage-v1'}]}
let practiceAnswers={}
const outcome=()=>({result:{attemptId:practice.id,createdAt:new Date().toISOString(),total:2,correct:1,incorrect:0,unanswered:1,percentage:50,bySubject:{reading:{total:2,correct:1,incorrect:0,unanswered:1,percentage:50}},byTopic:{},answers:practiceAnswers},analysis:{status:'COMPLETED',priorityTopics:[],suggestedNextStep:'',personalizedExplanation:''},passages:practice.passages,review:practice.questions.map(q=>({...q,correctAnswer:0,explanation:'English Practice explanation based on the passage.'}))})
await context.route('**/api/cent/v1/**',async route=>{
  const req=route.request(), path=new URL(req.url()).pathname.replace('/api/cent/v1','')
  const json=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)})
  if(path==='/me')return json({id:'owner',name:'دانشجوی آزمایشی',role:'STUDENT',email:'fixture@example.invalid'})
  if(path==='/me/library')return json({trainings:[],documents:[],notes:[],progress:[],entitlements:[],hasSubscription:true,readableTrainingIds:[]})
  if(path==='/me/orders')return json([])
  if(path==='/curriculum')return json(curriculum)
  if(path==='/me/mastery')return json({courses:[]})
  if(path==='/documents/doc-fixture')return json({document:{id:'doc-fixture',trainingId:'reading',sourceId:'source',title:'درس آزمایشی',pageCount:1,sortOrder:1},sections:[{title:'درس آزمایشی',startPage:1}],notes:[],progress:null,watermark:'fixture'})
  if(path==='/documents/doc-fixture/source-sections')return json([{id:'section',topicId:'topic',heading:'درس آزمایشی',sortOrder:1,text:'آموزش فارسی برای بررسی بازگشت به مطالعه.'}])
  if(path==='/documents/doc-fixture/progress')return json({documentId:'doc-fixture',lastPage:1,furthestPage:1,updatedAt:new Date().toISOString()})
  if(path==='/attempts/' && req.method()==='POST')return json(practice)
  if(path==='/attempts/')return json([])
  if(path==='/attempts/practice-fixture/submit'){practiceAnswers=req.postDataJSON().answers;return json(outcome())}
  if(path==='/attempts/practice-fixture')return json(outcome())
  if(path==='/assessment/exam-versions')return json({versions:[{examVersionId:'fixture-current',label:'آزمون آزمایشی',totalQuestions:65,totalDurationSeconds:8400,availableForNewStarts:true}]})
  if(path.endsWith('/configuration'))return json({examVersionId:'fixture-current',configurationRevision:'fixture-r1',totalQuestions:65,totalDurationSeconds:8400,availableForNewStarts:true,sections:subjects.map((subjectId,i)=>({sectionKey:subjectId,order:i+1,subjectId,questionCount:quotas[i],durationSeconds:seconds[i]})),scoring:{correct:'1.00',incorrect:'-0.25',unanswered:'0.00'}})
  if(path==='/assessment/mock-attempts/' && req.method()==='POST') {starts.push(req.postDataJSON());if(loseStart){loseStart=false;return route.abort('failed')}return json(state())}
  if(path==='/assessment/mock-attempts/')return json({items:[state()],nextCursor:null})
  if(!path.startsWith('/assessment/mock-attempts/'+id))return json({message:'Not found'},404)
  if(path.endsWith('/active-section'))return json(content())
  if(path.endsWith('/result'))return ended?json({...counts,...state(),sections:subjects.map((subjectId,i)=>({sectionId:'section-'+i,subjectId,counts:{...counts,questionCount:quotas[i]}}))}):json({message:'Not final'},409)
  if(path.endsWith('/review'))return ended?json({passages:[{passageRevisionId:'passage',text:'Original Reading context.'}],questions:[{questionId:'reading-0',position:1,sectionSubjectId:'reading',stem:'reading question 1',options,passageRevisionId:'passage',selectedOptionId:'b',correctOptionId:'b',explanation:'English terminal explanation.'}]}):json({message:'Not final'},409)
  if(['PUT','POST'].includes(req.method())) {
    const input=req.postDataJSON();commands.push(input)
    if(receipts.has(input.commandId))return json(receipts.get(input.commandId))
    revision++
    if(path.endsWith('/answers'))answers.set(input.questionId,input.selectedOptionId)
    else if(path.endsWith('/advance')){assert.equal(input.confirmForfeitRemainingTime,true);active++}
    else if(path.endsWith('/complete'))ended=true
    const response={receipt:{commandId:input.commandId,accepted:true,appliedRevision:revision},currentState:state()};receipts.set(input.commandId,response)
    if(path.endsWith('/answers')&&loseAnswer){loseAnswer=false;return route.abort('failed')}
    return json(response)
  }
  return json(state())
})
let page=await context.newPage()
page.on('pageerror',e=>errors.push(e.message))
try {
  await page.goto(root+'/student/mock-exams')
  await page.getByRole('button',{name:/مشاهده شرایط/}).click()
  const start=page.getByRole('button',{name:'شروع آزمون جامع',exact:true})
  assert.equal(await start.isDisabled(),true)
  await page.getByRole('checkbox').check();await start.click()
  await page.getByText('شروع آزمون تأیید نشد.',{exact:false}).waitFor()
  await start.click();await page.waitForURL('**/student/mock-exams/'+id)
  assert.deepEqual(starts[0],starts[1]);checks.push('Consent and stable start identity after lost response')
  await page.getByRole('heading',{name:'reading question 1',exact:true}).waitFor()
  assert.equal(await page.getByText('Original Reading context.',{exact:true}).count(),1)
  assert.equal(await page.getByText('English terminal explanation.').count(),0)
  await page.locator('.options-list button').nth(1).click()
  await page.getByRole('button',{name:'تلاش مجدد برای ثبت',exact:true}).waitFor()
  assert.equal(await page.locator('.options-list button').first().isDisabled(),true)
  const attemptUrl=page.url();await page.close();page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
  await page.goto(attemptUrl)
  await page.getByRole('button',{name:'تلاش مجدد برای ثبت',exact:true}).click()
  await page.getByText('پاسخ در سرور ذخیره شد.',{exact:true}).waitFor()
  assert.deepEqual(commands[0],commands[1]);assert.equal(await page.locator('.options-list button').nth(1).getAttribute('aria-pressed'),'true')
  checks.push('Reading context, terminal privacy, browser closure, exact answer retry and server acknowledgment')
  await page.getByRole('button',{name:'سؤال بعدی',exact:true}).click()
  await page.getByRole('heading',{name:'reading question 2',exact:true}).waitFor()
  await page.getByRole('button',{name:'پایان این بخش و ادامه',exact:true}).click()
  await page.getByRole('dialog').waitFor()
  await page.getByRole('button',{name:'ادامه پاسخ‌دادن',exact:true}).click()
  assert.equal(active,0)
  await page.setViewportSize({width:390,height:900})
  await page.getByRole('button',{name:'پایان این بخش و ادامه',exact:true}).click()
  const dialog=page.getByRole('dialog');await dialog.waitFor()
  assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)),'Confirmation owns keyboard focus')
  await page.keyboard.press('Tab')
  assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)),'Native dialog traps keyboard focus')
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Mobile confirmation fits viewport')
  await page.keyboard.press('Escape');assert.equal(await dialog.count(),0);assert.equal(active,0)
  await page.setViewportSize({width:1280,height:950})
  await context.setOffline(true)
  await page.getByText('ارتباط قطع است.',{exact:false}).waitFor()
  assert.equal(await page.locator('.options-list button').first().isDisabled(),true)
  await context.setOffline(false)
  await page.getByRole('button',{name:'همگام‌سازی با سرور',exact:true}).click()
  await page.getByRole('button',{name:'پایان این بخش و ادامه',exact:true}).click()
  await page.getByRole('button',{name:'تأیید و بستن بخش',exact:true}).click()
  await page.getByRole('heading',{name:'math question 1',exact:true}).waitFor()
  checks.push('Active-section navigation, cancelable irreversible confirmation, offline/reconnect and section advancement')
  // The server fixture, rather than a client timer, selects the section after a deadline.
  active=3;revision++
  await page.getByRole('button',{name:'همگام‌سازی با سرور',exact:true}).click()
  await page.getByRole('heading',{name:'biology question 1',exact:true}).waitFor()
  assert.equal(await page.getByRole('heading',{name:'reading question 1',exact:true}).count(),0)
  for(const width of [390,768,1280]) {
    await page.setViewportSize({width,height:900})
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'No horizontal page overflow at '+width)
  }
  checks.push('Server-driven overdue-section recovery and mobile/tablet/desktop layout')
  active=5;revision++;await page.getByRole('button',{name:'همگام‌سازی با سرور',exact:true}).click()
  await page.getByRole('heading',{name:'physics question 1',exact:true}).waitFor()
  await page.getByRole('button',{name:'پایان آزمون',exact:true}).click()
  await page.getByRole('button',{name:'تأیید و بستن بخش',exact:true}).click()
  await page.waitForURL('**/result')
  await page.getByText('پایان زمان آزمون',{exact:true}).waitFor()
  await page.locator('.assessment-review summary').click()
  await page.getByText('English terminal explanation.',{exact:true}).waitFor()
  assert.ok(await page.getByText('این نمره تراز یا نمره نرمال‌شده رسمی CISIA نیست.',{exact:false}).count())
  await page.getByRole('link',{name:'آزمون‌ها و تاریخچه',exact:true}).click()
  await page.getByRole('link',{name:'مشاهده نتیجه',exact:true}).waitFor()
  checks.push('Terminal timeout feedback, raw score caveat, passage review and history links')
  await page.goto(root+'/student/practice?course=reading&topic=topic')
  await page.getByRole('button',{name:'شروع آزمون',exact:true}).click()
  await page.getByText('Original Practice passage.',{exact:true}).waitFor()
  await page.locator('.options-list button').first().click()
  await page.getByRole('button',{name:'بعدی',exact:true}).click()
  await page.getByRole('button',{name:'ثبت و دیدن نتیجه',exact:true}).click()
  await page.waitForURL('**/student/results/practice-fixture')
  await page.locator('.assessment-review summary').first().click()
  await page.getByText('English Practice explanation based on the passage.',{exact:true}).first().waitFor()
  assert.ok(await page.getByText('Original Practice passage.',{exact:true}).count())
  checks.push('Passage-aware topic Practice submission, saved result and English feedback review')
  await page.goto(root+'/student/study/doc-fixture')
  await page.getByText('آموزش فارسی برای بررسی بازگشت به مطالعه.',{exact:true}).waitFor()
  await page.getByRole('textbox',{name:'متن یادداشت',exact:true}).fill('پیش‌نویس آزمایشی محفوظ')
  page.on('dialog',dialog=>void dialog.accept())
  await page.reload()
  await page.getByText('آموزش فارسی برای بررسی بازگشت به مطالعه.',{exact:true}).waitFor()
  assert.equal(await page.getByRole('textbox',{name:'متن یادداشت',exact:true}).inputValue(),'پیش‌نویس آزمایشی محفوظ')
  checks.push('Existing Persian source reader and local note draft survive refresh')
  assert.deepEqual(errors,[])
  writeFileSync(new URL('./artifacts/mock-experience.json',import.meta.url),JSON.stringify({checks,errors,apiMode:'intercepted fixtures only; no backend/database',completedAt:new Date().toISOString()},null,2))
  process.stdout.write(JSON.stringify({passed:checks.length,checks},null,2)+'\n')
} finally { await browser.close() }
