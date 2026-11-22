import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { chromium } from 'file:///D:/app/itatest/tests/browser/node_modules/playwright/index.mjs'
const output = path.dirname(fileURLToPath(import.meta.url))
const root = 'http://localhost:5173/cent-s', api = 'http://127.0.0.1:5108/api/cent/v1'
const report = {startedUtc:new Date().toISOString(),kind:'Backend-connected local preview, no response mocking',checks:[],screenshots:[],httpErrors:[],pageErrors:[],blockedExternalRequests:[],failures:[]}
const save = () => fs.writeFileSync(path.join(output,'extended-runtime.json'),JSON.stringify(report,null,2))
let browser
async function request(label, endpoint, token, method='GET', body, expected=200) {
  const r = await fetch(api+endpoint,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined})
  const text = await r.text(); let data; try{data=JSON.parse(text)}catch{data=text}
  report.checks.push({label,endpoint,method,status:r.status,expected,passed:r.status===expected});save()
  assert.equal(r.status,expected,label+': '+text.slice(0,200))
  return data
}
try {
  const status=await request('Preview mode','/status');assert.equal(status.payments,'DEVELOPMENT_MOCK')
  const admin=await request('Seeded preview administrator login','/auth/login',null,'POST',{email:'admin@cent.local',password:'cent-local-preview-only'})
  const password='cent-local-preview-only', email=`phase0-${Date.now()}@test.local`
  const learner=await request('Dedicated learner registration','/auth/register',null,'POST',{email,password,name:'Phase 0 local learner'})
  const other=await request('Separate unauthorized learner registration','/auth/register',null,'POST',{email:`phase0-other-${Date.now()}@test.local`,password,name:'Phase 0 isolated peer'})
  const fixture=JSON.parse(fs.readFileSync('D:/app/itatest/tests/browser/artifacts/result.json','utf8'))
  report.fixture={trainingId:fixture.trainingId,documentId:fixture.docId,learnerId:learner.user.id,peerId:other.user.id}
  await request('Guest session denied','/me',null,'GET',null,401)
  await request('Invalid session denied','/me','invalid-phase0-token','GET',null,401)
  await request('Guest PDF metadata denied',`/documents/${fixture.docId}`,null,'GET',null,401)
  await request('Unentitled PDF metadata denied',`/documents/${fixture.docId}`,other.token,'GET',null,403)
  await request('Unentitled PDF page denied',`/documents/${fixture.docId}/pages/1`,other.token,'GET',null,403)
  await request('Unsubscribed simulator denied','/attempts/',other.token,'POST',{kind:'simulator',requestId:crypto.randomUUID()},403)
  for(const endpoint of ['/admin/overview','/admin/users','/admin/trainings','/admin/orders','/admin/questions/']) {
    await request('Student admin API denied',endpoint,learner.token,'GET',null,403)
    await request('Guest admin API denied',endpoint,null,'GET',null,401)
  }
  browser=await chromium.launch({channel:'chrome',headless:true})
  const context=await browser.newContext({viewport:{width:1440,height:1000}})
  await context.route('**/*', route=>{
    const u=new URL(route.request().url())
    if(['http:','https:'].includes(u.protocol)&&!['localhost','127.0.0.1','[::1]'].includes(u.hostname)){report.blockedExternalRequests.push(u.origin+u.pathname);return route.abort()}
    return route.continue()
  })
  const page=await context.newPage()
  page.on('pageerror',e=>report.pageErrors.push(e.message))
  page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({url:r.url(),status:r.status()})})
  async function settled(){await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready)}
  async function capture(name, route, width=1440) {
    await page.setViewportSize({width,height:width===390?844:1000})
    if(route)await page.goto(root+route)
    await settled()
    const file=`runtime-${name}-${width}.png`
    await page.screenshot({path:path.join(output,file),fullPage:!name.startsWith('admin-')})
    report.screenshots.push({file,route:new URL(page.url()).pathname+new URL(page.url()).search,width,height:width===390?844:1000,kind:'backend-connected; no response mocking',...(await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,alerts:[...document.querySelectorAll('[role=alert]')].map(x=>x.textContent)})))})
    save()
  }
  await capture('home','/')
  await capture('catalog','/package',390)
  await page.setViewportSize({width:1440,height:1000})
  await page.goto(root+'/login')
  await page.getByLabel('ایمیل',{exact:true}).fill(email)
  await page.getByLabel('رمز عبور',{exact:false}).fill(password)
  await page.getByRole('button',{name:'ورود به حساب',exact:true}).click()
  await page.waitForURL('**/student');await settled()
  const browserToken=await page.evaluate(()=>sessionStorage.getItem('cent:session:v1'))
  report.checks.push({label:'Real password login reaches student dashboard',passed:true})
  await capture('dashboard-empty')
  await capture('profile-empty','/student/profile')
  await capture('library-empty','/student/content')
  await capture('notes-empty','/student/notes')
  await page.goto(root+'/admin');await page.waitForURL('**/student');report.checks.push({label:'Student admin UI redirects to student dashboard',passed:true})
  await capture('checkout-missing-product','/checkout')
  await capture('payment-missing-order','/checkout/success')
  await page.getByRole('alert').filter({hasText:'شناسه سفارش موجود نیست.'}).waitFor()
  await capture('payment-unknown-order',`/checkout/success?order=${crypto.randomUUID()}`)
  await page.getByRole('alert').filter({hasText:'سفارش پیدا نشد.'}).waitFor()
  const catalog=await request('Actual product catalog','/catalog')
  const product=catalog.products.find(p=>p.trainingId===fixture.trainingId);assert.ok(product)
  await capture('checkout-training',`/checkout?product=${product.id}`)
  await page.getByRole('button',{name:'ادامه و پرداخت',exact:true}).click()
  await page.waitForURL('**/checkout/success?order=*')
  await page.getByText('خریدت تأیید شد؛ وقت یادگیری است.',{exact:true}).waitFor()
  await capture('payment-paid')
  const trainingOrder=new URL(page.url()).searchParams.get('order');report.fixture.orderId=trainingOrder
  await request('Peer order verification denied',`/me/orders/${trainingOrder}/verify`,other.token,'POST',{},404)
  await capture('reader-pdf',`/student/study/${fixture.docId}`)
  await page.locator('canvas').waitFor();await page.waitForFunction(()=>document.querySelector('canvas')?.width>500&&!document.querySelector('.cent-page-content.concealed'))
  await page.getByLabel('متن یادداشت').fill('Phase 0 runtime persistence evidence')
  await page.getByRole('button',{name:'ثبت یادداشت',exact:true}).click()
  await page.getByText('در حساب شما ذخیره شد',{exact:true}).waitFor()
  await page.reload();await page.getByText('Phase 0 runtime persistence evidence',{exact:true}).waitFor()
  await capture('reader-note',null,390)
  const privateDoc=await request('Owner PDF metadata and persisted note',`/documents/${fixture.docId}`,learner.token)
  assert.ok(privateDoc.notes.some(n=>n.body==='Phase 0 runtime persistence evidence'))
  await request('Peer note edit denied',`/notes/${privateDoc.notes[0].id}`,other.token,'PUT',{documentId:fixture.docId,page:1,anchorY:0.5,body:'Unauthorized write must fail',revision:privateDoc.notes[0].revision},403)
  await capture('notes-saved','/student/notes',390)
  const curriculum=await request('Imported curriculum','/curriculum')
  const topic=curriculum.topics.find(t=>t.courseCode==='math'&&t.title==='عبارت‌های جبری')
  const bank=await request('Admin answer key for deterministic local fixture','/admin/questions/',admin.token)
  await page.setViewportSize({width:1440,height:1000})
  await page.goto(`${root}/diagnostic/test?course=math&topic=${topic.id}`)
  await page.getByRole('button',{name:'شروع آزمون',exact:true}).click()
  await page.locator('.sim-question h2').waitFor()
  await capture('diagnostic-active')
  const attempt=await page.evaluate(()=>JSON.parse(sessionStorage.getItem(Object.keys(sessionStorage).find(k=>k.startsWith('cent:exam:')))).attempt)
  assert.ok(attempt.questions.every(q=>!('correctAnswer'in q)))
  report.checks.push({label:'Diagnostic questions omit answer keys',passed:true,questions:attempt.questions.length})
  for(let i=0;i<attempt.questions.length;i++){
    const q=attempt.questions[i], key=bank.find(b=>b.id===q.id).correctAnswer
    await page.locator('.options-list button').nth((key+1)%q.options.length).click()
    await page.getByRole('button',{name:i===attempt.questions.length-1?'ثبت و دیدن نتیجه':'بعدی',exact:true}).click()
  }
  await page.waitForURL('**/student/results/*')
  await page.getByText('مرور پاسخ‌ها',{exact:true}).waitFor()
  const outcome=await request('Persisted diagnostic result',`/attempts/${attempt.id}`,learner.token)
  assert.equal(outcome.result.percentage,0);assert.ok(outcome.analysis.priorityTopics.length);assert.equal(outcome.analysis.provider,'rules')
  report.checks.push({label:'Actual zero-score result contains rule-based weak-topic recommendations',passed:true,percentage:outcome.result.percentage,provider:outcome.analysis.provider})
  await capture('diagnostic-result')
  await capture('diagnostic-result',null,390)
  await request('Peer assessment result denied',`/attempts/${attempt.id}`,other.token,'GET',null,404)
  const repeated=await request('Repeat submission returns saved result',`/attempts/${attempt.id}/submit`,learner.token,'POST',{answers:{}})
  assert.equal(repeated.result.percentage,0)
  await capture('dashboard-populated','/student',390)
  await capture('mastery','/student/analysis',390)
  const subscriptionId=crypto.randomUUID()
  await request('Create dedicated local subscription product',`/admin/products/${subscriptionId}`,admin.token,'PUT',{title:'Phase 0 local subscription verification',kind:'SUBSCRIPTION',trainingId:null,priceRial:10000,durationDays:30,active:true})
  const requestId=crypto.randomUUID()
  const subscription=await request('Development mock subscription checkout','/checkout',learner.token,'POST',{productId:subscriptionId,requestId})
  const again=await request('Checkout idempotency same request','/checkout',learner.token,'POST',{productId:subscriptionId,requestId})
  assert.equal(again.id,subscription.id)
  await request('Paid subscription verification',`/me/orders/${subscription.id}/verify`,learner.token,'POST',{})
  const lib=await request('Subscription entitlement active','/me/library',learner.token);assert.equal(lib.hasSubscription,true)
  const orders=await request('Actual order history','/me/orders',learner.token)
  assert.ok(orders.every(o=>o.status==='PAID'&&o.provider==='MOCK'))
  report.checks.push({label:'Subscription active; duplicate checkout returns one order; mock orders paid',passed:true,orders:orders.length})
  await capture('profile-subscription','/student/profile')
  await capture('profile-subscription',null,390)
  await capture('library-entitled','/student/content',390)
  await page.setViewportSize({width:1440,height:1000})
  await page.goto(root+'/student/simulators/test')
  await page.getByRole('button',{name:'شروع آزمون',exact:true}).click();await page.locator('.sim-question h2').waitFor()
  await capture('simulator-active')
  const sim=await page.evaluate(()=>JSON.parse(sessionStorage.getItem(Object.keys(sessionStorage).find(k=>k.includes(':simulator:')))).attempt)
  for(let i=0;i<sim.questions.length;i++){
    await page.locator('.options-list button').first().click()
    await page.getByRole('button',{name:i===sim.questions.length-1?'ثبت و دیدن نتیجه':'بعدی',exact:true}).click()
  }
  await page.waitForURL('**/student/results/*');await page.getByText('مرور پاسخ‌ها',{exact:true}).waitFor();await capture('simulator-result')
  report.checks.push({label:'Subscribed simulator starts and submits through actual UI',passed:true,questions:sim.questions.length})
  await request('Dedicated session logout','/auth/logout',browserToken,'POST',{},204)
  await request('Revoked session denied','/me',browserToken,'GET',null,401)
  await page.goto(root+'/student/profile');await page.waitForURL('**/login');await capture('revoked-session-login')
  const adminContext=await browser.newContext({viewport:{width:1440,height:1000}})
  const adminPage=await adminContext.newPage()
  await adminPage.goto(root+'/login');await adminPage.evaluate(token=>sessionStorage.setItem('cent:session:v1',token),admin.token)
  for(const route of ['/admin','/admin/users','/admin/content','/admin/packages','/admin/orders','/admin/questions']){
    await adminPage.goto(root+route);await adminPage.waitForLoadState('networkidle');await adminPage.evaluate(()=>document.fonts.ready)
    assert.equal(await adminPage.locator('.cent-error').count(),0)
    const name=`runtime-admin-${route==='/admin'?'overview':route.split('/').at(-1)}-1440.png`
    await adminPage.screenshot({path:path.join(output,name),fullPage:false})
    report.screenshots.push({file:name,route,width:1440,height:1000,kind:'backend-connected preview administration; viewport capture'})
    report.checks.push({label:'Administrator interface loads',route,passed:true})
  }
} catch(e) {report.failures.push({message:e.message,stack:e.stack});console.error(e);process.exitCode=1}
finally{if(browser)await browser.close();report.finishedUtc=new Date().toISOString();save();console.log(JSON.stringify({checks:report.checks.length,screenshots:report.screenshots.length,failures:report.failures,pageErrors:report.pageErrors},null,2))}
