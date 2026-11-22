import { readFileSync } from 'node:fs'
import { chromium } from 'file:///D:/app/itatest/tests/browser/node_modules/playwright/index.mjs'
import { writeFileSync } from 'node:fs'
import { api, root, artifact, browserOptions, requireLocalPreview } from 'file:///D:/app/itatest/tests/browser/environment.mjs'
await requireLocalPreview()
const login=async email=>fetch(api+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'cent-local-preview-only'})}).then(r=>r.json())
const admin=await login('admin@cent.local');const users=await fetch(api+'/admin/users',{headers:{Authorization:'Bearer '+admin.token}}).then(r=>r.json())
const fixture=JSON.parse(readFileSync('D:/app/itatest/tests/browser/artifacts/result.json','utf8'))
const orders=await fetch(api+'/admin/orders',{headers:{Authorization:'Bearer '+admin.token}}).then(r=>r.json())
const ownOrder=orders.find(o=>o.trainingId===fixture.trainingId)
if(!ownOrder)throw Error('This smoke fixture has no order')
const ownStudent=users.find(u=>u.id===ownOrder.userId)
if(!ownStudent?.email.startsWith('study-'))throw Error('Not a smoke learner')
const student=await login(ownStudent.email)
const notes=await fetch(api+'/me/notes',{headers:{Authorization:'Bearer '+student.token}}).then(r=>r.json());const note=notes.find(n=>n.page===2)
if(!note)throw new Error('No second-page note in the browser fixture')
const browser=await chromium.launch(browserOptions)
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}})
 await page.goto(root+'/login');await page.evaluate(token=>sessionStorage.setItem('cent:session:v1',token),student.token)
 let failures=0;await page.route(/\/api\/cent\/v1\/me$/,async route=>{if(failures++<2)await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Temporary test interruption'})});else await route.continue()})
 await page.goto(root+'/student/study/'+note.documentId+'?page=2');await page.getByText(note.body,{exact:true}).waitFor({timeout:45000});await page.waitForFunction(()=>!document.querySelector('.cent-page-content.concealed'));await page.screenshot({path:artifact('phase0-targeted-recovery.png'),fullPage:true})
 if(failures<3)throw new Error('Recovery did not retry the session check')
 writeFileSync(artifact('phase0-targeted-recovery-result.json'),JSON.stringify({success:true,transientFailures:2,restoredWithoutLogin:true,page:2},null,2));console.log('Recovery passed: two 503 responses, same session restored, correct page and private note visible.')
} finally {await browser.close()}
