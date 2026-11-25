import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
const root='http://127.0.0.1:5173/cent-s',api='http://127.0.0.1:5108/api/cent/v1'
const student=JSON.parse(readFileSync('.preview-artifacts/phase5/local-review-sessions.json','utf8')).find(s=>s.role==='STUDENT')
const result={status:'NOT TESTED',errors:[]}
const browser=await chromium.launch({channel:'chrome',headless:true})
try{
 const library=await fetch(api+'/me/library',{headers:{Authorization:'Bearer '+student.token}}).then(r=>r.json())
 const doc=library.documents.find(d=>!d.sourceId&&library.readableDocumentIds.includes(d.id));assert.ok(doc,'Existing accessible PDF')
 const page=await browser.newPage({viewport:{width:1440,height:1000}})
 page.on('pageerror',e=>result.errors.push(e.message));page.on('dialog',d=>d.accept())
 await page.goto(root);await page.evaluate(s=>{sessionStorage.setItem('cent:session:v1',s.token);sessionStorage.setItem('cent:session-expiry:v1',s.expiresAt)},student)
 await page.goto(root+'/student/study/'+doc.id+'?page=1');await page.locator('canvas:visible').waitFor()
 await page.waitForFunction(()=>{const c=document.querySelector('canvas');return c?.width>100&&!document.querySelector('.cent-page-content.concealed')})
 const draft='Phase 5 PDF draft '+crypto.randomUUID();await page.getByLabel('متن یادداشت',{exact:true}).fill(draft);await page.reload();await page.waitForFunction(value=>document.querySelector('#reading-note-body')?.value===value,draft);assert.equal(await page.getByLabel('متن یادداشت',{exact:true}).inputValue(),draft)
 await page.getByRole('button',{name:'ثبت یادداشت',exact:true}).click();await page.getByText('در حساب شما ذخیره شد',{exact:true}).waitFor()
 const data=await fetch(api+'/documents/'+doc.id,{headers:{Authorization:'Bearer '+student.token}}).then(r=>r.json());const note=data.notes.find(n=>n.body===draft);assert.ok(note)
 const removed=await fetch(api+'/notes/'+note.id+'?revision='+note.revision,{method:'DELETE',headers:{Authorization:'Bearer '+student.token}});assert.equal(removed.status,204)
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
 assert.deepEqual(result.errors,[]);Object.assign(result,{status:'PASS',documentId:doc.id,existingPublishedPdf:true,protectedPageCanvas:true,draftRestore:true,noteSave:true,mobileViewport:true,realDevice:false})
}catch(e){result.status='FAIL';result.errors.push(e.stack);process.exitCode=1}
finally{writeFileSync('docs/educational-reader-pilot/phase-5/verification/normal-pdf.json',JSON.stringify(result,null,2));await browser.close()}
