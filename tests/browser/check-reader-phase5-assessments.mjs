import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
const path='docs/educational-reader-pilot/phase-5/verification/normal-http-security.json'
const evidence=JSON.parse(readFileSync(path,'utf8'))
const content=JSON.parse(readFileSync('../Backend/backend/Cent.Module/Content/reviewed-v4.json','utf8'))
const bank=new Map(content.questionBank.map(q=>[q.Id,q]))
const token=JSON.parse(readFileSync('.preview-artifacts/phase5/local-review-sessions.json','utf8')).find(s=>s.role==='STUDENT').token
async function call(path,body,expected=200){const r=await fetch('http://127.0.0.1:5108/api/cent/v1'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}); assert.equal(r.status,expected,await r.clone().text());return expected===200?r.json():null}
try{
 for(const subject of ['biology','chemistry','physics','logic','reading']){
  const definitions=content.assessments.filter(a=>a.subject===subject)
  for(const kind of ['chapter-review','subject-mock']){
   const a=definitions.find(a=>kind==='subject-mock'?a.questionIds.every(id=>bank.get(id).Kind==='package-only'):a.questionIds.every(id=>bank.get(id).Kind!=='package-only'))
   if(!a)continue
   const existing=evidence.checks.find(c=>c.requirement===subject+'-'+a.id&&c.scoreVerified)
   if(existing){existing.assessmentKind=kind;continue}
   const started=await call('/reviewed-assessments/'+a.id+'/start',{requestId:crypto.randomUUID()})
   for(const q of started.questions){assert.ok(!('correctAnswer'in q));assert.ok(!('explanation'in q))}
   await call('/attempts/'+started.id,undefined,404)
   const result=await call('/attempts/'+started.id+'/submit',{answers:Object.fromEntries(started.questions.map(q=>[q.id,0]))})
   assert.equal(result.result.correct,result.review.filter(q=>q.correctAnswer===0).length)
   assert.equal(result.result.incorrect,result.review.filter(q=>q.correctAnswer!==0).length)
   evidence.checks.push({requirement:subject+'-'+a.id,status:'PASS',assessmentKind:kind,attemptId:started.id,preSubmissionKeysAbsent:true,resultBeforeSubmitDenied:true,scoreVerified:true,passages:started.passages.length})
  }
 }
}catch(e){evidence.errors.push(e.stack);process.exitCode=1}
finally{writeFileSync(path,JSON.stringify(evidence,null,2))}
