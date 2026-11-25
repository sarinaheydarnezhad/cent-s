import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'

// The PDF reader delivers private rendered page images, never original.pdf.
// Create only a new synthetic page fixture in the disposable Phase 4 database.
const api='http://127.0.0.1:5124/api/cent/v1',root='http://127.0.0.1:5194/cent-s'
const fixtures=JSON.parse(readFileSync('.preview-artifacts/reader-phase4-final-build/bin/Cent.Preview/debug/App_Data/isolated/admin-fixtures.json','utf8'))
const student=fixtures.find(f=>f.role==='STUDENT'),admin=fixtures.find(f=>f.role==='SuperAdmin')
async function call(path,method='GET',body,token=student.token,type='application/json') {
  const response=await fetch(api+path,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':type},body:body===undefined?undefined:type==='application/json'?JSON.stringify(body):body})
  assert.ok(response.ok,`${path}: ${response.status} ${await response.clone().text()}`)
  return response
}
const curriculum=await(await call('/curriculum')).json(),training=curriculum.courses.find(c=>c.code==='math').trainingId
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1280,height:900}})
page.on('dialog',d=>d.accept())
try {
  await page.goto(root+'/')
  const pixels=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=800;c.height=1100;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,800,1100);x.fillStyle='#294251';x.font='32px sans-serif';x.fillText('PDF page compatibility fixture',65,120);x.font='24px sans-serif';x.fillText('Synthetic page, private delivery and notes.',65,190);return c.toDataURL('image/webp')})
  const doc=await(await call('/admin/documents','POST',{trainingId:training,title:'P4 synthetic PDF page fixture',pageCount:1,sortOrder:9999},admin.token)).json()
  await call(`/admin/documents/${doc.id}/pages/1?width=800&height=1100`,'PUT',Buffer.from(pixels.split(',')[1],'base64'),admin.token,'image/webp')
  await call(`/admin/documents/${doc.id}/publish`,'POST',{sections:[{title:'Synthetic PDF page',startPage:1}]},admin.token)
  await page.evaluate(token=>sessionStorage.setItem('cent:session:v1',token),student.token)
  await page.goto(`${root}/student/study/${doc.id}`)
  await page.waitForFunction(()=>{const canvas=document.querySelector('canvas');return canvas&&!canvas.hidden&&canvas.width===800&&canvas.height===1100})
  assert.equal(await page.locator('.pilot-lesson').count(),0)
  await page.locator('canvas').click({position:{x:130,y:160}})
  await page.locator('#reading-note-body').fill('P4 PDF draft persists')
  await page.reload()
  await page.locator('#reading-note-body').waitFor()
  assert.equal(await page.locator('#reading-note-body').inputValue(),'P4 PDF draft persists')
  await page.getByRole('button',{name:'ثبت یادداشت',exact:true}).click()
  await page.getByText('در حساب شما ذخیره شد',{exact:true}).waitFor()
  await page.reload();await page.locator('.cent-note-pin').first().waitFor()
  await page.locator('.cent-note-pin').first().click()
  assert.equal(await page.locator('#reading-note-body').inputValue(),'P4 PDF draft persists')
  await page.screenshot({path:'docs/educational-reader-pilot/phase-4/after/pdf-page-after.png'})
  const image=await call(`/documents/${doc.id}/pages/1`)
  assert.equal(image.headers.get('content-type').split(';')[0],'image/webp');assert.match(image.headers.get('cache-control'),/no-store/)
  assert.equal((await fetch(api+`/documents/${doc.id}/pages/1`)).status,401)
  assert.equal((await fetch(api+`/documents/${doc.id}/original.pdf`,{headers:{Authorization:`Bearer ${student.token}`}})).status,404)
  writeFileSync('docs/educational-reader-pilot/phase-4/verification/pdf-page-results.json',JSON.stringify({passed:true,syntheticRenderedPdfPage:true,canvasDecoded:true,draftRestored:true,noteRestored:true,privateNoStore:true,anonymousDenied:true,originalPdfUnavailable:true},null,2))
  console.log('PDF-page canvas, draft persistence, note restore and private delivery passed')
} finally {await browser.close()}
