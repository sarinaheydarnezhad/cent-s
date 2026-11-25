import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const api='http://127.0.0.1:5119/api/cent/v1', root='http://127.0.0.1:5189/cent-s'
const out=resolve('docs/educational-reader-pilot/after'); mkdirSync(out,{recursive:true})
const fixtures=JSON.parse(readFileSync('.preview-artifacts/reader-pilot/bin/Cent.Preview/debug/App_Data/isolated/admin-fixtures.json','utf8'))
const learner=fixtures.find(f=>f.role==='STUDENT'), admin=fixtures.find(f=>f.role==='SuperAdmin'), stranger=fixtures.find(f=>f.role==='ExamManager'), outsider=fixtures.find(f=>f.role==='UserManager')
async function call(path,method='GET',body,token=learner.token,expected=200){ const r=await fetch(api+path,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}); assert.equal(r.status,expected,`${path}: ${await r.clone().text()}`); return r.status===204?null:r.json() }
const curriculum=await call('/curriculum'); const course=curriculum.courses.find(c=>c.code==='math'); const doc=curriculum.documents.find(d=>d.trainingId===course.trainingId && d.id==='6d7121b2-4929-1b2b-b2c3-f290ec70c69b')
assert.ok(doc)
const productId=crypto.randomUUID();await call('/admin/products/'+productId,'PUT',{title:'Disposable reader verification',kind:'TRAINING',trainingId:course.trainingId,priceRial:10000,durationDays:null,active:true},admin.token)
if (!(await call('/me/library')).readableDocumentIds.includes(doc.id)) { const order=await call('/checkout','POST',{productId,requestId:crypto.randomUUID()});await call(`/me/orders/${order.id}/verify`,'POST',{}) }
for (const old of (await call(`/documents/${doc.id}`)).notes.filter(n=>['Legacy note without anchor metadata','Pilot note at the first worked step','Edited pilot note'].includes(n.body))) await call('/notes/'+old.id+'?revision='+old.revision,'DELETE',undefined,learner.token,204)
const legacyId=crypto.randomUUID();await call('/notes/'+legacyId,'PUT',{documentId:doc.id,page:1,anchorY:.37,body:'Legacy note without anchor metadata',revision:0})
const rows=await call(`/documents/${doc.id}/source-sections`);const index=rows.findIndex(s=>s.pilotHtml);assert.ok(index>=0);assert.equal(rows.filter(s=>s.pilotHtml).length,1)
await call(`/documents/${doc.id}/source-sections`,'GET',undefined,outsider.token,403)
const unauth=await fetch(api+`/documents/${doc.id}/source-sections`);assert.equal(unauth.status,401)
assert.match((await fetch(api+`/documents/${doc.id}/source-sections`,{headers:{Authorization:`Bearer ${learner.token}`}})).headers.get('cache-control'),/no-store/)
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message))
try{
 await page.goto(root);await page.evaluate(t=>sessionStorage.setItem('cent:session:v1',t),learner.token);await page.goto(`${root}/student/study/${doc.id}?page=${index+1}`);await page.locator('.pilot-lesson h2').waitFor({timeout:90000});await page.evaluate(()=>document.fonts.ready)
 assert.equal(await page.locator('.pilot-lesson .example').count(),3);assert.equal(await page.locator('.pilot-lesson details').count(),3);assert.ok(await page.locator('.pilot-lesson .frac').count()>10)
 await page.screenshot({path:out+'/desktop.png',fullPage:true})
 await page.locator('.pilot-lesson .example').first().scrollIntoViewIfNeeded();await page.screenshot({path:out+'/worked-examples.png'})
 await page.locator('.pilot-lesson .example .steps > div').first().click();await page.getByLabel('متن یادداشت',{exact:true}).fill('Pilot note at the first worked step');await page.getByRole('button',{name:'ثبت یادداشت',exact:true}).click();await page.getByText('در حساب شما ذخیره شد',{exact:true}).waitFor();await page.locator('.pilot-pin').waitFor();await page.screenshot({path:out+'/annotation-created.png'})
 const note=(await call(`/documents/${doc.id}`)).notes.find(n=>n.body==='Pilot note at the first worked step');assert.equal(JSON.parse(note.anchorJson).kind,'html');
 if (!(await call('/me/library','GET',undefined,stranger.token)).readableDocumentIds.includes(doc.id)) { const otherOrder=await call('/checkout','POST',{productId,requestId:crypto.randomUUID()},stranger.token);await call(`/me/orders/${otherOrder.id}/verify`,'POST',{},stranger.token) }
 await call('/notes/'+note.id,'PUT',{...note,body:'forbidden'},stranger.token,404)
 await call('/notes/'+note.id+'?revision='+note.revision,'DELETE',undefined,stranger.token,409)
 await page.reload();await page.locator('.pilot-pin').waitFor();
 const checkPosition=async()=>{await page.waitForTimeout(150);const delta=await page.evaluate(a=>{const block=[...document.querySelectorAll('[data-block]')].find(b=>b.dataset.block===a.block).getBoundingClientRect();const pin=document.querySelector('.pilot-pin').getBoundingClientRect();return Math.abs(pin.left+pin.width/2-(block.left+block.width*a.x))+Math.abs(pin.top+pin.height/2-(block.top+block.height*a.y))},JSON.parse(note.anchorJson));assert.ok(delta<3,`anchor error ${delta}`)}
 await checkPosition();await page.locator('.cent-note-text').click();await page.screenshot({path:out+'/annotation-restored.png'})
 await page.getByRole('button',{name:'بزرگ‌نمایی',exact:true}).click();await page.setViewportSize({width:390,height:844});await page.locator('.pilot-pin').scrollIntoViewIfNeeded();await page.locator('.pilot-pin').click();await checkPosition();assert.equal(await page.getByLabel('متن یادداشت',{exact:true}).inputValue(),note.body)
 await page.getByRole('button',{name:'اندازه معمول',exact:true}).click();await page.getByRole('button',{name:'بستن یادداشت‌ها',exact:true}).click();await page.locator('.pilot-lesson h2').scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:out+'/mobile.png'})
 await page.locator('.pilot-lesson .exercise').scrollIntoViewIfNeeded();await page.locator('.pilot-lesson summary').first().click();await page.screenshot({path:out+'/exercises.png'})
 await page.evaluate(()=>window.ItatestAppearance.setPreference('dark'));await page.locator('.pilot-lesson h2').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/dark.png'})
 await page.goto(`${root}/student/study/${doc.id}?page=${index+2}`);await page.locator('.cent-source-text').waitFor();assert.equal(await page.locator('.pilot-lesson').count(),0)
 await call('/notes/'+note.id,'PUT',{...note,body:'Edited pilot note'});const updated=(await call(`/documents/${doc.id}`)).notes.find(n=>n.id===note.id);assert.equal(updated.body,'Edited pilot note');await call('/notes/'+note.id+'?revision='+updated.revision,'DELETE',undefined,learner.token,204)
 const legacy=(await call(`/documents/${doc.id}`)).notes.find(n=>n.id===legacyId);assert.equal(legacy.anchorY,.37);assert.equal(legacy.body,'Legacy note without anchor metadata');await call('/notes/'+legacyId+'?revision='+legacy.revision,'DELETE',undefined,learner.token,204)
 assert.deepEqual(errors,[]);writeFileSync(out+'/results.json',JSON.stringify({passed:true,actualSource:'math/chapter2.html#section-02',examples:3,exercises:3,annotations:'create/reload/reflow/zoom/edit/delete',access:'401/403/no-store',neighbourLegacy:true,errors},null,2));console.log('Reader pilot checks passed')
}finally{await browser.close()}

