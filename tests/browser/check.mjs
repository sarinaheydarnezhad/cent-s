import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { api, root, artifact, browserOptions, requireLocalPreview } from './environment.mjs'


await requireLocalPreview()
const adminLogin = await fetch(api + '/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:'admin@cent.local',password:'cent-local-preview-only'}) }).then(r=>r.json())
if (!adminLogin.token) throw new Error(JSON.stringify(adminLogin))
const call = async (path, method='GET', body) => {
 const response = await fetch(api+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+adminLogin.token},body:body?JSON.stringify(body):undefined})
 if(!response.ok) throw new Error(`${response.status} ${path} ${await response.text()}`)
 return response.status===204?null:response.json()
}
const trainingId = crypto.randomUUID(), productId=crypto.randomUUID(), subscriptionId=crypto.randomUUID()
await call('/admin/trainings/'+trainingId,'PUT',{title:'از پایه تا حل مسئله — جبر',description:'مرور مفاهیم اصلی جبر، مثال‌های حل‌شده و تمرین‌های هدفمند. این آموزش فقط برای آزمایش محلی ساخته شده است.',includedInSubscription:true,published:true})
await call('/admin/products/'+productId,'PUT',{title:'آموزش جبر و حل مسئله',kind:'TRAINING',trainingId,priceRial:2490000,durationDays:null,active:true})
await call('/admin/products/'+subscriptionId,'PUT',{title:'اشتراک ماهانه مطالعه',kind:'SUBSCRIPTION',trainingId:null,priceRial:490000,durationDays:30,active:true})

function makePdf() {
 let value='%PDF-1.4\n'; const offsets=[0]
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 7 0 R >> >> /Contents 4 0 R >>',null,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>',null,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
 const pages=['BT /F1 28 Tf 60 700 Td (CENT / Algebra) Tj 0 -60 Td /F1 16 Tf (Chapter 1 - Start with the fundamentals) Tj 0 -50 Td (2x + 6 = 18) Tj 0 -32 Td (2x = 12) Tj 0 -32 Td (x = 6) Tj ET','BT /F1 28 Tf 60 700 Td (Reflect. Practice. Repeat.) Tj 0 -70 Td /F1 16 Tf (Now solve: 3x + 9 = 30) Tj 0 -45 Td (Write a note next to this exercise.) Tj ET']
 for(let i=0;i<2;i++) objects[3+i*2]=`<< /Length ${pages[i].length} >>\nstream\n${pages[i]}\nendstream`
 for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(value));value+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`}
 const xref=Buffer.byteLength(value);value+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
 writeFileSync(artifact('sample.pdf'),value)
}
makePdf()
const browser=await chromium.launch(browserOptions)
const context=await browser.newContext({viewport:{width:1440,height:1000}})
const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
page.on('response',r=>{if(r.status()>=400)console.log('HTTP',r.status(),r.url())});page.on('requestfailed',r=>console.log('REQUEST FAILED',r.url(),r.failure()?.errorText));
process.on('uncaughtException', async e => { console.error(e); console.error(page.url()); console.error((await page.locator('body').innerText()).slice(0,2000)); await page.screenshot({path:artifact('failure.png'),fullPage:true}); await browser.close();process.exit(1) })
await page.goto(root+'/login');await page.getByLabel('ایمیل',{exact:true}).fill('admin@cent.local');await page.getByLabel('رمز عبور',{exact:false}).fill('cent-local-preview-only');await page.getByRole('button',{name:'ورود به حساب',exact:true}).click();await page.waitForURL('**/admin');console.log('Administrator logged in')
await page.goto(root+'/admin/content');await page.getByRole('combobox',{name:/^آموزش/}).selectOption(trainingId);await page.getByLabel('عنوان درس',{exact:true}).fill('درس اول: معادله‌های خطی');await page.locator('input[type=file]').setInputFiles(artifact('sample.pdf'));await page.getByRole('button',{name:'بارگذاری و انتشار درس',exact:true}).click();await page.getByText('درس با موفقیت منتشر شد.',{exact:true}).waitFor({timeout:60000});console.log('PDF rendered, uploaded, and published')
const data=await call('/admin/trainings');const doc=data.documents.find(d=>d.trainingId===trainingId);if(!doc?.published)throw new Error('PDF upload did not publish')
await page.getByRole('button',{name:'خروج از حساب',exact:true}).click();await page.goto(root+'/login');await page.getByRole('button',{name:'ثبت‌نام',exact:true}).click();const email=`study-${Date.now()}@cent.local`;await page.getByLabel('نام و نام خانوادگی',{exact:true}).fill('سارا احمدی');await page.getByLabel('ایمیل',{exact:true}).fill(email);await page.getByLabel('رمز عبور',{exact:false}).fill('cent-local-preview-only');await page.getByRole('button',{name:'ساخت حساب',exact:true}).click();await page.waitForURL('**/student');console.log('Student registered')
await page.goto(root+'/package');await page.getByRole('heading',{name:'انتخاب کن، شروع کن',exact:true}).waitFor();await page.screenshot({path:artifact('catalog.png'),fullPage:true})
await page.goto(root+'/checkout?product='+productId);await page.getByRole('button',{name:'ادامه و پرداخت',exact:true}).click();await page.waitForURL('**/checkout/success?order=*');await page.getByText('خریدت تأیید شد؛ وقت یادگیری است.',{exact:true}).waitFor()
await page.getByRole('link',{name:'کتابخانه من',exact:true}).click();await page.getByRole('heading',{name:'از پایه تا حل مسئله — جبر',exact:true}).waitFor();await page.getByRole('link',{name:'شروع',exact:true}).click();await page.waitForURL('**/student/study/*');await page.locator('canvas').waitFor();await page.waitForFunction(()=>{const canvas=document.querySelector('canvas');return canvas&&canvas.width>500&&!document.querySelector('.cent-page-content.concealed')});
await page.getByLabel('متن یادداشت',{exact:true}).fill('برای حل معادله، ابتدا ثابت‌ها را به طرف دیگر منتقل می‌کنم.');await page.getByRole('button',{name:'ثبت یادداشت',exact:true}).click();await page.getByText('در حساب شما ذخیره شد',{exact:true}).waitFor();await page.screenshot({path:artifact('reader-desktop.png'),fullPage:true})
await page.reload();await page.getByText('برای حل معادله، ابتدا ثابت‌ها را به طرف دیگر منتقل می‌کنم.',{exact:true}).waitFor();await page.getByLabel('انتخاب صفحه',{exact:true}).selectOption('2');await page.waitForFunction(()=>!document.querySelector('.cent-page-content.concealed'));await page.getByLabel('متن یادداشت',{exact:true}).fill('تمرین صفحه دوم را فردا مرور کنم.');await page.getByRole('button',{name:'ثبت یادداشت',exact:true}).click();await page.getByText('در حساب شما ذخیره شد',{exact:true}).waitFor();
await page.setViewportSize({width:390,height:844});await page.screenshot({path:artifact('reader-mobile.png'),fullPage:true});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(overflow)throw new Error('Mobile reader overflow')
await page.goto(root+'/student/notes');await page.getByText('تمرین صفحه دوم را فردا مرور کنم.',{exact:true}).waitFor();await page.getByText('برای حل معادله، ابتدا ثابت‌ها را به طرف دیگر منتقل می‌کنم.',{exact:true}).waitFor();
await page.goto(root+'/student/profile');await page.getByText('پرداخت‌شده',{exact:true}).waitFor();
let failures=0;await page.route(/\/api\/cent\/v1\/me$/,async route=>{if(failures++<2)await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Temporary test interruption'})});else await route.continue()});
await page.goto(root+'/student/study/'+doc.id+'?page=2');await page.getByText('تمرین صفحه دوم را فردا مرور کنم.',{exact:true}).waitFor({timeout:45000});await page.unroute(/\/api\/cent\/v1\/me$/);console.log('Session restored after transient API failures');
for(let i=errors.length-1;i>=0;i--)if(errors[i].includes('503'))errors.splice(i,1);
writeFileSync(artifact('result.json'),JSON.stringify({success:true,trainingId,docId:doc.id,errors,mobileOverflow:overflow},null,2));await browser.close();if(errors.length)throw new Error(errors.join('\n'));console.log('Browser flow passed: admin PDF upload, registration, purchase, library, rendered pages, persistent page notes, profile, mobile layout.')

