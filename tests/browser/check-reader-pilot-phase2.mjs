import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const api='http://127.0.0.1:5119/api/cent/v1', root='http://127.0.0.1:5189/cent-s'
const out=resolve('docs/educational-reader-pilot/phase-2/after'); mkdirSync(out,{recursive:true})
const fixtures=JSON.parse(readFileSync('.preview-artifacts/reader-pilot-phase2/bin/Cent.Preview/debug/App_Data/isolated/admin-fixtures.json','utf8'))
const learner=fixtures.find(f=>f.role==='STUDENT'), admin=fixtures.find(f=>f.role==='SuperAdmin'), stranger=fixtures.find(f=>f.role==='ExamManager'), outsider=fixtures.find(f=>f.role==='UserManager')
async function call(path,method='GET',body,token=learner.token,expected=200){ const r=await fetch(api+path,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}); assert.equal(r.status,expected,`${method} ${path}: ${await r.clone().text()}`); return r.status===204?null:r.json() }
const curriculum=await call('/curriculum');const course=curriculum.courses.find(c=>c.code==='math'), doc=curriculum.documents.find(d=>d.id==='6d7121b2-4929-1b2b-b2c3-f290ec70c69b');assert.ok(doc)
const productId=crypto.randomUUID();await call('/admin/products/'+productId,'PUT',{title:'Disposable phase 2 verification',kind:'TRAINING',trainingId:course.trainingId,priceRial:10000,durationDays:null,active:true},admin.token)
async function grant(who){if(!(await call('/me/library','GET',undefined,who.token)).readableDocumentIds.includes(doc.id)){const order=await call('/checkout','POST',{productId,requestId:crypto.randomUUID()},who.token);await call(`/me/orders/${order.id}/verify`,'POST',{},who.token)}}
await grant(learner);await grant(stranger)
for(const n of (await call(`/documents/${doc.id}`)).notes.filter(n=>n.body.startsWith('P2:')))await call('/notes/'+n.id+'?revision='+n.revision,'DELETE',undefined,learner.token,204)
const rows=await call(`/documents/${doc.id}/source-sections`), index=rows.findIndex(s=>s.pilot), section=rows[index];assert.ok(index>=0)
assert.ok(rows.every(s=>s.text===''&&!s.pilotHtml));assert.equal(rows.filter(s=>s.pilot).length,1)
const path=`/documents/${doc.id}/source-sections/${section.id}`
const payload=await call(path);assert.equal(payload.text,'');assert.ok(payload.pilotHtml);assert.match(payload.watermark,/^IT-[a-f0-9]{32}$/);assert.ok(!payload.watermark.includes('@'))
await call(path,'GET',undefined,outsider.token,403);assert.equal((await fetch(api+path)).status,401)
assert.match((await fetch(api+path,{headers:{Authorization:`Bearer ${learner.token}`}})).headers.get('cache-control'),/no-store/)
await call(`/documents/${doc.id}/pages/${index+1}`,'GET',undefined,learner.token,404)
const browser=await chromium.launch({channel:'chrome',headless:true}), page=await browser.newPage({viewport:{width:1440,height:1000}}), errors=[]
page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept())
try{
 await page.goto(root);await page.evaluate(t=>sessionStorage.setItem('cent:session:v1',t),learner.token)
 const url=`${root}/student/study/${doc.id}?page=${index+1}`;await page.goto(url);await page.locator('.pilot-lesson h2').waitFor({timeout:90000});await page.evaluate(()=>document.fonts.ready)
 assert.equal(await page.locator('.pilot-lesson .example').count(),3);assert.equal(await page.locator('.pilot-lesson details').count(),3)
 assert.ok(await page.locator('.pilot-lesson .frac').count()>10)
 assert.equal(await page.locator('.pilot-lesson .ltr').evaluateAll(els=>els.some(el=>/[\u06f0-\u06f9\u0660-\u0669]/.test(el.textContent))),false)
 assert.ok(await page.locator('.pilot-lesson .ltr').evaluateAll(els=>els.every(el=>getComputedStyle(el).direction==='ltr'&&getComputedStyle(el).unicodeBidi==='isolate')))
 assert.ok(await page.locator('.pilot-lesson .steps').first().innerText())
 await page.screenshot({path:out+'/desktop.png',fullPage:true})
 await page.locator('.pilot-lesson .example').first().evaluate(el=>el.scrollIntoView({block:'start'}));await page.screenshot({path:out+'/formulas.png'})
 await page.locator('.pilot-lesson .example .steps > div').first().click();await page.getByLabel('\u0645\u062a\u0646 \u06cc\u0627\u062f\u062f\u0627\u0634\u062a',{exact:true}).fill('P2: unsaved anchored draft')
 const savedDraft=await page.evaluate(()=>JSON.parse(Object.entries(localStorage).find(([k])=>k.startsWith('cent:draft:'))[1]));assert.equal(JSON.parse(savedDraft.anchorJson).revision,payload.contentRevision)
 await page.reload();await page.locator('.pilot-lesson').waitFor();assert.equal(await page.locator('#reading-note-body').inputValue(),'P2: unsaved anchored draft');assert.equal(await page.locator('.pilot-anchor-selected').count(),1)
 await page.getByRole('button',{name:'\u062b\u0628\u062a \u06cc\u0627\u062f\u062f\u0627\u0634\u062a',exact:true}).click();await page.getByText('\u062f\u0631 \u062d\u0633\u0627\u0628 \u0634\u0645\u0627 \u0630\u062e\u06cc\u0631\u0647 \u0634\u062f',{exact:true}).waitFor()
 let note=(await call(`/documents/${doc.id}`)).notes.find(n=>n.body==='P2: unsaved anchored draft');assert.equal(note.id,savedDraft.id);assert.equal(note.anchorJson,savedDraft.anchorJson)
 await page.screenshot({path:out+'/annotations.png'})
 await call('/notes/'+note.id,'PUT',{...note,body:'forbidden'},stranger.token,404);await call('/notes/'+note.id+'?revision='+note.revision,'DELETE',undefined,stranger.token,409);assert.ok(!(await call(`/documents/${doc.id}`,'GET',undefined,stranger.token)).notes.some(n=>n.id===note.id));assert.ok(!(await call('/me/notes','GET',undefined,stranger.token)).some(n=>n.id===note.id))
 const legacy=await call('/notes/'+crypto.randomUUID(),'PUT',{documentId:doc.id,page:index+1,anchorY:.37,body:'P2: legacy fallback',revision:0})
 const oldAnchor=JSON.parse(note.anchorJson);delete oldAnchor.revision
 await call('/notes/'+crypto.randomUUID(),'PUT',{documentId:doc.id,page:index+1,anchorY:note.anchorY,anchorJson:JSON.stringify(oldAnchor),body:'P2: phase-one anchor',revision:0})
 await call('/notes/'+crypto.randomUUID(),'PUT',{documentId:doc.id,page:index+1,anchorY:note.anchorY,anchorJson:note.anchorJson,body:'P2: nearby note',revision:0})
 const unresolved=await call('/notes/'+crypto.randomUUID(),'PUT',{documentId:doc.id,page:index+1,anchorY:.65,anchorJson:JSON.stringify({...oldAnchor,block:'missing',quote:'missing',revision:'older-source'}),body:'P2: unresolved anchor',revision:0})
 const answerAnchor=await page.locator('.pilot-lesson .ans-steps > div').first().evaluate(el=>({kind:'html',block:el.dataset.block,quote:el.dataset.anchorQuote,x:.5,y:.5}))
 const answerNote=await call('/notes/'+crypto.randomUUID(),'PUT',{documentId:doc.id,page:index+1,anchorY:.85,anchorJson:JSON.stringify({...answerAnchor,revision:payload.contentRevision}),body:'P2: expandable answer anchor',revision:0})
 await page.reload();await page.locator('.pilot-pin').first().waitFor()
 async function geometry(){await page.waitForTimeout(200);const result=await page.evaluate(()=>{const content=document.querySelector('.pilot-content').getBoundingClientRect(), pins=[...document.querySelectorAll('.pilot-pin')].map(el=>({rect:el.getBoundingClientRect(),y:Number(el.dataset.anchorTop),root:el.closest('article').getBoundingClientRect()}));return {overText:pins.some(p=>p.rect.left<content.right-1&&p.rect.right>content.left+1),overlap:pins.some((p,i)=>pins.some((q,j)=>i<j&&p.rect.bottom>q.rect.top+.5&&q.rect.bottom>p.rect.top+.5)),delta:Math.max(0,...pins.map(p=>Math.abs(p.rect.top+p.rect.height/2-p.root.top-p.y)))}});assert.equal(result.overText,false);assert.equal(result.overlap,false);assert.ok(result.delta<2)}
 await geometry()
 await page.locator('.cent-note-text').filter({hasText:answerNote.body}).click();assert.equal(await page.locator('.pilot-lesson details').first().getAttribute('open'),'')
 await geometry();await page.locator('.pilot-lesson summary').first().click();await page.locator(`[data-note-id="${answerNote.id}"]`).click();assert.equal(await page.locator('.pilot-lesson details').first().getAttribute('open'),'');await geometry()
 assert.ok(await page.locator('.pilot-pin sup').count()>0)
 await page.locator('.cent-note-text').filter({hasText:'P2: phase-one anchor'}).click();assert.equal(await page.locator('.pilot-anchor-selected').count(),1);await geometry()
 await page.locator('.cent-note-text').filter({hasText:unresolved.body}).click();assert.equal(await page.locator('.pilot-anchor-status').count(),2);assert.equal(await page.locator('.pilot-pin[data-fallback=true]').count(),2)
 await page.locator('.cent-note-text').filter({hasText:note.body}).click()
 await page.getByRole('button',{name:'\u0628\u0632\u0631\u06af\u200c\u0646\u0645\u0627\u06cc\u06cc',exact:true}).click();await geometry()
 await page.locator('.pilot-lesson').evaluate(el=>el.style.fontSize='21px');await geometry();await page.locator('.pilot-lesson').evaluate(el=>el.style.removeProperty('font-size'))
 await page.setViewportSize({width:390,height:844});await geometry();await page.getByRole('button',{name:'\u0628\u0633\u062a\u0646 \u06cc\u0627\u062f\u062f\u0627\u0634\u062a\u200c\u0647\u0627',exact:true}).click();await page.locator('.pilot-pin').first().click();assert.equal(await page.locator('#reading-note-body').inputValue(),note.body);await page.waitForTimeout(200);assert.ok(await page.evaluate(()=>document.querySelector('.pilot-anchor-selected').getBoundingClientRect().top<document.querySelector('.cent-reader-notes').getBoundingClientRect().top));await page.screenshot({path:out+'/annotations-mobile.png'})
 await page.getByRole('button',{name:'\u0628\u0633\u062a\u0646 \u06cc\u0627\u062f\u062f\u0627\u0634\u062a\u200c\u0647\u0627',exact:true}).click();await page.getByRole('button',{name:'\u0627\u0646\u062f\u0627\u0632\u0647 \u0645\u0639\u0645\u0648\u0644',exact:true}).click()
 await page.locator('.pilot-lesson h2').scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await page.locator('.cent-reader-toolbar').evaluate(el=>el.getBoundingClientRect().height<65));await page.screenshot({path:out+'/mobile.png'})
 await page.locator('.pilot-lesson details').first().evaluate(el=>el.open=true);await geometry();await page.locator('.pilot-lesson .exercise').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/exercises.png'})
 await page.evaluate(()=>window.ItatestAppearance.setPreference('dark'));await page.locator('.pilot-lesson h2').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/dark.png'})
 await page.setViewportSize({width:1440,height:1000});await page.locator('[aria-controls=reading-notes-panel]').click();await page.locator('.cent-note-text').filter({hasText:note.body}).click();await geometry();await page.screenshot({path:out+'/annotation-restored.png'})
 await page.goto(`${root}/student/study/${doc.id}?page=${index+2}`);await page.locator('.cent-source-text').waitFor();await page.waitForFunction(()=>document.querySelector('.cent-source-text>div')?.textContent.length>50);assert.equal(await page.locator('.pilot-lesson').count(),0)
 // Existing legacy metadata and optimistic revisions are retained after old-client edits.
 await call('/notes/'+note.id,'PUT',{documentId:doc.id,page:note.page,anchorY:note.anchorY,body:'P2: edited by old client',revision:note.revision});note=(await call(`/documents/${doc.id}`)).notes.find(n=>n.id===note.id);assert.equal(note.anchorJson,savedDraft.anchorJson)
 await call('/notes/'+note.id,'PUT',{...note,body:'P2: stale',revision:note.revision-1},learner.token,409)
 assert.equal((await call(`/documents/${doc.id}`)).notes.find(n=>n.id===legacy.id).anchorY,.37)
 await page.route('**/source-sections/'+section.id,async route=>{const response=await route.fetch();const body=await response.json();body.pilotHtml+='<img src="/xss-probe" onerror="window.pilotXss=1"><script>window.pilotXss=1</script><div onclick="window.pilotXss=1" style="color:red"><a href="javascript:window.pilotXss=1">probe</a></div>';await route.fulfill({response,json:body})})
 await page.goto(url);await page.locator('.pilot-lesson').waitFor();assert.equal(await page.locator('.pilot-content script,.pilot-content img,.pilot-content a,.pilot-content [onclick],.pilot-content [style]').count(),0);assert.equal(await page.evaluate(()=>window.pilotXss),undefined);await page.unroute('**/source-sections/'+section.id)
 // Sequential automation avoids the pre-existing global admission limiter, exercising the pilot's speed detector.
 await page.waitForTimeout(11000);let throttled=false,retry=0
 for(let i=0;i<20;i++){const r=await fetch(api+path,{headers:{Authorization:`Bearer ${learner.token}`}});if(r.status===429){const body=await r.json();assert.equal(body.code,'pilot_throttled');retry=Number(r.headers.get('retry-after'));assert.ok(retry>0);throttled=true;break}assert.equal(r.status,200)}assert.ok(throttled)
 await page.waitForTimeout((retry+1)*1000);await call(path)
 for(const n of (await call(`/documents/${doc.id}`)).notes.filter(n=>n.body.startsWith('P2:')))await call('/notes/'+n.id+'?revision='+n.revision,'DELETE',undefined,learner.token,204)
 assert.deepEqual(errors,[]);writeFileSync(out+'/results.json',JSON.stringify({passed:true,source:'math/chapter2.html#section-02',examples:3,exercises:3,westernMathDigits:true,marginMarkers:true,sanitization:true,answerAnchors:true,nearbyGrouping:true,draftAnchorRestored:true,legacyAndRevisionFallback:true,ownership:true,bulkDeliveryClosed:true,bulkThrottle:{status:429,retryAfter:retry,recovered:true},watermark:'opaque audit-mapped identifier',errors},null,2));console.log('Phase 2 reader checks passed')
}finally{await browser.close()}
