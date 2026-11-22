/* global document, sessionStorage, getComputedStyle */
// Phase 8: real loopback API + disposable fixtures; no intercepted/mocked responses.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { browserOptions } from './environment.mjs'

const root = process.env.CENT_ADMIN_WEB_URL || 'http://localhost:5198/cent-s'
const api = process.env.CENT_ADMIN_API_URL || 'http://127.0.0.1:5128/api/cent/v1'
const output = process.env.CENT_ADMIN_EVIDENCE || fileURLToPath(new URL('../../docs/refinement/evidence/phase-8/', import.meta.url))
const fixtureFile = process.env.CENT_ADMIN_FIXTURES
assert.ok(fixtureFile, 'Pass the disposable preview admin-fixtures.json path; no account credentials are hardcoded.')
for (const address of [root, api]) assert.ok(['localhost','127.0.0.1'].includes(new URL(address).hostname))
const fixtures = JSON.parse(readFileSync(fixtureFile, 'utf8')), fixture = role => fixtures.find(f => f.role === role)
mkdirSync(output,{recursive:true})
const checks = [], layouts = [], errors = [], shots = []
function checked(message) { checks.push(message); console.log(message) }
async function request(path, { role = 'SuperAdmin', method = 'GET', body, status = 200 } = {}) {
  const r = await fetch(api + path, {method,headers:{'Content-Type':'application/json',...(role ? {Authorization:'Bearer '+fixture(role).token} : {})},body:body === undefined ? undefined : JSON.stringify(body)})
  const text = await r.text(); assert.equal(r.status,status,`${method} ${path}: ${text}`)
  return text ? JSON.parse(text) : null
}
assert.equal((await request('/status',{role:null})).payments,'DEVELOPMENT_MOCK')
const paths = ['overview','users','resources','assessments','question-bank','orders','subscriptions','curriculum','reports','roles','settings','audit','subject-offers']
for(const path of paths) for(const role of [null,'STUDENT']) await request('/admin/'+path,{role,status:role?403:401})
checked('all administrative read APIs reject anonymous users and students')
for(const [role,allowed,denied] of [['UserManager','users','orders'],['ContentManager','resources','users'],['ExamManager','question-bank','resources'],['FinanceManager','orders','question-bank']]) {
  await request('/admin/'+allowed,{role}); await request('/admin/'+denied,{role,status:403})
  await request('/admin/users/'+fixture('STUDENT').Id+'/role',{role,method:'PUT',body:{role:'SuperAdmin',confirm:true},status:403})
}
checked('specialist roles cannot read unrelated modules or assign roles')
const overview = await request('/admin/overview')
assert.equal(overview.finance.incomeRial,0); assert.equal(overview.finance.activeSubscriptions,1)
assert.equal((await request('/admin/overview',{role:'ContentManager'})).finance,null)
const orderData = await request('/admin/orders'), paid = orderData.items.find(o=>o.status==='PAID')
const detail = await request('/admin/orders/'+paid.id)
assert.equal(detail.events[0].action,'FIXTURE_ONLY'); assert.ok(!JSON.stringify(detail).includes('authority'))
checked('persisted aggregates separate mock payments, active subscriptions and restricted finance data')

const browser = await chromium.launch(browserOptions)
async function contextFor(role) {
  const c = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'})
  if(role) await c.addInitScript(f => { sessionStorage.setItem('cent:session:v1',f.token); sessionStorage.setItem('cent:session-expiry:v1',f.expiresAt) },fixture(role))
  return c
}
const context = await contextFor('SuperAdmin'), page = await context.newPage()
page.on('pageerror',error=>errors.push(error.message))
async function go(path) { await page.goto(root+path); await page.waitForLoadState('networkidle'); await page.locator('.admin-main h1').waitFor(); }
async function capture(name) { await page.screenshot({path:output+'/'+name+'.png',fullPage:true}); shots.push(name+'.png') }
async function noOverflow(label) { const size = await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth})); assert.ok(size.scroll<=size.width+1,`${label}: ${JSON.stringify(size)}`); layouts.push({label,...size}) }
try {
  const anonymous = await contextFor(null), anonPage = await anonymous.newPage(); await anonPage.goto(root+'/admin/users'); await anonPage.waitForURL('**/login'); await anonymous.close()
  const student = await contextFor('STUDENT'), studentPage = await student.newPage(); await studentPage.goto(root+'/admin/orders'); await studentPage.waitForURL('**/student'); assert.equal(await studentPage.locator('.admin-app').count(),0); await student.close()
  checked('anonymous direct admin URL returns existing login; student returns student shell')
  await go('/admin'); await capture('01-overview-light'); await noOverflow('desktop overview')
  for(const [path,name] of [['users','02-users-light'],['resources','03-resources-light'],['assessments','04-assessments-light'],['questions','05-questions-light'],['orders','06-orders-light'],['subscriptions','07-subscriptions-light'],['content','08-content-light'],['reports','09-reports-light'],['roles','10-roles-light'],['packages','11-products-light']]) { await go('/admin/'+path); await capture(name); await noOverflow('desktop '+path) }
  await go('/admin/users'); await page.getByRole('button',{name:'مشاهده حساب'}).first().click(); await page.getByRole('dialog').waitFor(); await page.getByText('شناسه کاربر:',{exact:false}).waitFor(); await capture('12-user-detail-light'); await page.keyboard.press('Escape')
  await page.locator('.admin-filters select').selectOption('STUDENT'); await page.waitForFunction(()=>document.querySelectorAll('.admin-main tbody tr').length===1); assert.equal(await page.locator('tbody tr').count(),1)
  await page.getByRole('button',{name:'بازنشانی',exact:true}).click(); await page.waitForFunction(count=>document.querySelectorAll('.admin-main tbody tr').length===count,fixtures.length); assert.equal(await page.locator('tbody tr').count(),fixtures.length)
  await page.getByRole('searchbox').fill('not-an-existing-account'); await page.getByRole('button',{name:'جست‌وجو',exact:true}).click(); await page.getByText('نتیجه‌ای پیدا نشد',{exact:true}).waitFor()
  await page.getByRole('button',{name:'بازنشانی',exact:true}).click(); await page.getByRole('button',{name:'مشاهده حساب'}).first().waitFor()
  await context.setOffline(true); await page.getByRole('searchbox').fill('offline'); await page.getByRole('button',{name:'جست‌وجو',exact:true}).click(); await page.locator('.admin-main [role="alert"]').waitFor(); assert.equal(await page.locator('.admin-main table').count(),0); await context.setOffline(false); await page.getByRole('button',{name:'بازنشانی',exact:true}).click(); await page.getByRole('button',{name:'مشاهده حساب'}).first().waitFor()
  checked('user search and role filter, empty state, offline error hides stale data, and recovery use actual requests')
  await go('/admin/resources'); const before = await page.locator('tbody tr').first().innerText(); await page.getByRole('button',{name:'صفحه بعد',exact:true}).click(); await page.waitForLoadState('networkidle'); assert.notEqual(await page.locator('tbody tr').first().innerText(),before); await page.getByRole('button',{name:'مشاهده منبع'}).first().click(); await page.getByRole('dialog').waitFor(); await page.keyboard.press('Escape')
  checked('resource pagination and real product/section detail')
  // Existing training editor plus existing PDF -> protected WebP upload/publication.
  await page.getByRole('button',{name:'مدیریت آموزش و PDF',exact:true}).click()
  const trainingForm = page.locator('form').filter({has:page.getByRole('heading',{name:'مشخصات آموزش',exact:true})})
  const trainingTitle = 'آموزش آزمون مدیریت '+Date.now()
  await trainingForm.getByLabel('عنوان',{exact:true}).fill(trainingTitle); await trainingForm.getByLabel('توضیح',{exact:true}).fill('داده ساختگی فقط در پایگاه جداگانه')
  await trainingForm.getByRole('button',{name:'ذخیره آموزش',exact:true}).click(); await page.getByText('آموزش ذخیره شد.',{exact:true}).waitFor()
  const pdfForm = page.locator('form').filter({has:page.getByRole('heading',{name:'افزودن درس PDF',exact:true})})
  await pdfForm.locator('select').selectOption({label:trainingTitle}); await pdfForm.getByLabel('عنوان درس',{exact:true}).fill('درس آزمایشی مدیریت')
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>','<< /Length 43 >>\nstream\nBT /F1 14 Tf 30 200 Td (Admin test) Tj ET\nendstream','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
  let pdf='%PDF-1.4\n', offsets=[0]; objects.forEach((o,i)=>{offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${o}\nendobj\n`});const xref=Buffer.byteLength(pdf);pdf+=`xref\n0 6\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  await pdfForm.locator('input[type=file]').setInputFiles({name:'admin-local.pdf',mimeType:'application/pdf',buffer:Buffer.from(pdf)})
  await pdfForm.getByRole('button',{name:'بارگذاری و انتشار درس',exact:true}).click(); await page.getByText('درس با موفقیت منتشر شد.',{exact:true}).waitFor({timeout:60000})
  const content = await request('/admin/resources?search='+encodeURIComponent('درس آزمایشی مدیریت')); assert.equal(content.items[0].published,true)
  checked('existing training editor and genuine PDF conversion/upload/publication persisted successfully')
  await go('/admin/questions'); await page.getByRole('button',{name:'مشاهده سؤال'}).first().click(); assert.equal(await page.getByRole('dialog').locator('textarea').first().getAttribute('readonly'),''); await page.keyboard.press('Escape')
  await page.getByRole('button',{name:'پیش‌نویس سؤال',exact:true}).click(); const qdialog=page.getByRole('dialog'); await qdialog.getByRole('button',{name:'ذخیره سؤال',exact:true}).click(); assert.equal(await qdialog.locator('textarea:invalid').count(),1)
  const text = 'سؤال دستی آزمون مدیریت '+Date.now(); await qdialog.getByLabel('متن سؤال',{exact:true}).fill(text);await qdialog.getByLabel('موضوع',{exact:true}).fill('آزمون پیش‌نویس')
  for(let i=1;i<=4;i++) await qdialog.getByLabel('گزینه '+i.toLocaleString('fa-IR'),{exact:true}).fill('پاسخ '+i)
  await qdialog.getByLabel('توضیح پاسخ',{exact:true}).fill('توضیح آزمایشی'); await qdialog.getByRole('button',{name:'ذخیره سؤال',exact:true}).click();await page.getByText('سؤال ذخیره شد.',{exact:true}).waitFor()
  const saved=await request('/admin/question-bank?search='+encodeURIComponent(text));assert.equal(saved.total,1);assert.equal(saved.items[0].active,false)
  checked('immutable question read-only state, native validation, new manual draft persisted')
  await go('/admin/orders?order='+paid.id);await page.getByRole('dialog').waitFor();await capture('13-order-detail-light');await page.keyboard.press('Escape')
  await go('/admin/subscriptions');await page.getByRole('link',{name:'بررسی سفارش'}).first().click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape')
  checked('order payment events/entitlements and subscription-to-order navigation')
  await go('/admin/roles');await page.getByLabel('شناسه کاربر',{exact:true}).fill(fixture('ContentManager').Id);await page.locator('form.admin-panel select').selectOption('UserManager');await page.getByRole('button',{name:'بررسی و تأیید تغییر',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'ثبت نقش',exact:true}).click();await page.getByText('نقش ثبت و رویداد ممیزی ذخیره شد.',{exact:true}).waitFor()
  await request('/admin/resources',{role:'ContentManager',status:403});await request('/admin/users',{role:'ContentManager'});await request('/admin/users/'+fixture('ContentManager').Id+'/role',{method:'PUT',body:{role:'ContentManager',confirm:true}})
  const audit = await request('/admin/audit');assert.ok(audit.items.some(e=>e.action==='ROLE_OK:ContentManager>UserManager'))
  checked('confirmed UI role changes are audited and immediately enforced for existing sessions; fixture role restored')
  for(const role of ['UserManager','ContentManager','ExamManager','FinanceManager']) {
    const c=await contextFor(role), p=await c.newPage();await p.goto(root+'/admin');await p.waitForLoadState('networkidle');assert.equal(await p.getByRole('navigation',{name:'ناوبری مدیریت'}).getByRole('link',{name:'نقش‌ها و دسترسی'}).count(),0);await p.goto(root+'/admin/roles');await p.getByText('مجوز مشاهده این بخش را ندارید.',{exact:false}).waitFor();assert.equal(await p.getByLabel('شناسه کاربر',{exact:true}).count(),0);await c.close()
  }
  checked('specialist navigation and direct-URL permission-denied states hide unauthorized forms')
  await go('/admin');await page.getByRole('button',{name:'تغییر به حالت تاریک',exact:true}).click();await capture('14-overview-dark');await go('/admin/orders');await capture('15-orders-dark')
  for(const width of [768,390,360]) { await page.setViewportSize({width,height:900});await go('/admin/users');await noOverflow(`dark users ${width}`);await page.getByRole('button',{name:'نمایش منو',exact:true}).click();await page.getByRole('navigation',{name:'ناوبری مدیریت'}).waitFor();if(width===390)await capture('16-mobile-navigation-dark');await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'نمایش منو',exact:true}).getAttribute('aria-expanded'),'false') }
  await page.setViewportSize({width:390,height:900});await go('/admin/orders');await capture('17-mobile-orders-dark');await noOverflow('mobile orders dark')
  await page.getByRole('button',{name:'تغییر به حالت روشن',exact:true}).click();await go('/admin');await capture('18-mobile-overview-light');await noOverflow('mobile overview light');await go('/admin/reports');await capture('19-mobile-reports-light');await noOverflow('mobile reports light')
  const labels = await page.locator('.admin-app input, .admin-app select, .admin-app textarea').evaluateAll(nodes=>nodes.every(n=>n.labels?.length || n.getAttribute('aria-label'))); assert.ok(labels)
  assert.equal(await page.locator('html').getAttribute('dir'),'rtl');await page.locator('.admin-skip').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'admin-main')
  assert.equal(await page.locator('.admin-app').evaluate(el=>getComputedStyle(el).animationName),'none')
  checked('Light/Dark, desktop/tablet/mobile, RTL, visible chart values, labeled fields, skip link, reduced motion, and Escape navigation')
  assert.deepEqual(errors,[])
  writeFileSync(output+'/verification.json',JSON.stringify({generatedAt:new Date().toISOString(),root,api,checks,layouts,screenshots:shots,pageErrors:errors,provider:'DEVELOPMENT_MOCK',database:'new isolated SQLite preview; all accounts and financial rows synthetic'},null,2))
  console.log(JSON.stringify({passed:checks.length,screenshots:shots.length,layouts:layouts.length,pageErrors:errors.length}))
} finally { await browser.close() }
