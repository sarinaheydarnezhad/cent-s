import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { readFileSync, writeFileSync } from 'node:fs'
const api = 'http://127.0.0.1:5108/api/cent/v1'
const sessions = JSON.parse(readFileSync('.preview-artifacts/phase5/local-review-sessions.json','utf8'))
const student = sessions.find(s=>s.role==='STUDENT'), admin=sessions.find(s=>s.role==='ADMIN')
const out='docs/educational-reader-pilot/phase-5/verification/normal-http-security.json'
const checks=[], timing=[], errors=[]
async function request(path, token=student.token, method='GET', body, expected=200) {
 const started=performance.now()
 const r=await fetch(api+path,{method,headers:{Authorization:token?'Bearer '+token:'','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:globalThis.AbortSignal.timeout(30000)})
 timing.push({path: path.replace(/[a-f0-9-]{36}/g,'{id}'),milliseconds:performance.now()-started,status:r.status})
 assert.equal(r.status,expected,`${path}: ${r.status} ${await r.clone().text()}`)
 if(token) assert.match(r.headers.get('cache-control'),/no-store/)
 return r
}
async function call(...args){return (await request(...args)).json()}
function secrecy(value) { if(Array.isArray(value)) return value.forEach(secrecy); if(value&&typeof value==='object') for(const [key,child] of Object.entries(value)){ assert.ok(!['correctAnswer','correctOption','explanation','answerIndex'].includes(key),key); secrecy(child) } }
try {
 const library=await call('/me/library'), curriculum=await call('/curriculum')
 for(const course of curriculum.courses){
  const doc=library.documents.find(d=>d.trainingId===course.trainingId&&d.sourceId)
  const rows=await call(`/documents/${doc.id}/source-sections`), path=`/documents/${doc.id}/source-sections/${rows[0].id}`
  const payload=await call(path); assert.match(payload.watermark,/^IT-/); assert.ok(payload.pilotHtml)
  await request(path,null,'GET',undefined,401)
  await request(path,admin.token,'GET',undefined,403)
  for(const asset of payload.assets){
    const r=await request(path+'/assets/'+asset.id); assert.equal(r.headers.get('content-type').split(';')[0],asset.mime)
    await request(path+'/assets/'+asset.id,null,'GET',undefined,401)
  }
  const id=crypto.randomUUID()
  const note=await call('/notes/'+id,student.token,'PUT',{documentId:doc.id,page:1,anchorY:.1,body:'Phase 5 private ownership probe',revision:0})
  await request('/notes/'+id,admin.token,'PUT',{documentId:doc.id,page:1,anchorY:.1,body:'forbidden',revision:note.revision},403)
  await request('/notes/'+id+'?revision='+note.revision,student.token,'DELETE',undefined,204)
  checks.push({requirement:course.code+'-delivery-security',status:'PASS',anonymousDenied:true,unentitledDenied:true,privateCache:true,noteOwnerOnly:true})
 }
 const definitions=await call('/reviewed-assessments/')
 assert.equal(definitions.length,42)
 for(const subject of curriculum.courses.map(c=>c.code)){
  const available=definitions.filter(d=>d.subject===subject)
  const selection=[available.find(d=>d.title.toLowerCase().includes('review')),available.find(d=>!d.title.toLowerCase().includes('review'))].filter(Boolean)
  if(subject!=='math') assert.ok(selection.length,subject+' assessment selection')
  for(const definition of selection){
   const started=await call('/reviewed-assessments/'+definition.id+'/start',student.token,'POST',{requestId:crypto.randomUUID()}); secrecy(started)
   await request('/attempts/'+started.id,student.token,'GET',undefined,404)
   if(subject==='reading'){assert.equal(started.passages.length,2); assert.ok(started.questions.every(q=>started.passages.some(p=>p.id===q.passageId)))}
   const answers=Object.fromEntries(started.questions.map(q=>[q.id,0]))
   const result=await call('/attempts/'+started.id+'/submit',student.token,'POST',{answers})
   const correct=result.review.filter(q=>q.correctAnswer===0).length
   assert.equal(result.result.correct,correct); assert.equal(result.result.incorrect,started.questions.length-correct)
   assert.equal(result.result.unanswered,0)
   const replay=await call('/attempts/'+started.id+'/submit',student.token,'POST',{answers:{}}); assert.deepEqual(replay.result,result.result)
   checks.push({requirement:subject+'-'+definition.id,status:'PASS',attemptId:started.id,preSubmissionKeysAbsent:true,resultBeforeSubmitDenied:true,scoreVerified:true,submissionIdempotent:true,passages:started.passages.length})
  }
 }
 // Realistic pacing is measured separately from the deliberate burst probe.
 const doc=library.documents.find(d=>d.sourceId), rows=await call(`/documents/${doc.id}/source-sections`), path=`/documents/${doc.id}/source-sections/${rows[0].id}`
 const latencies=[]
 for(let i=0;i<8;i++){ const start=performance.now(); await request(path); latencies.push(performance.now()-start); await new Promise(r=>setTimeout(r,2000)) }
 checks.push({requirement:'legitimate-session',status:'PASS',intervalSeconds:2,successfulDeliveries:8,latencyMs:latencies})
 const burst=await Promise.all(Array.from({length:18},()=>fetch(api+path,{headers:{Authorization:'Bearer '+student.token},signal:globalThis.AbortSignal.timeout(30000)})))
 assert.ok(burst.some(r=>r.status===429)); assert.ok(burst.every(r=>[200,429].includes(r.status))); assert.ok(burst.filter(r=>r.status===429).every(r=>Number(r.headers.get('retry-after'))>0))
 checks.push({requirement:'concurrent-burst',status:'PASS',accepted:burst.filter(r=>r.status===200).length,throttled:burst.filter(r=>r.status===429).length,noServerErrors:true})
}catch(e){errors.push(e.stack);process.exitCode=1}
finally{writeFileSync(out,JSON.stringify({provider:'SQLite normal local environment; no SQL Server claim',checks,timing,errors},null,2))}
