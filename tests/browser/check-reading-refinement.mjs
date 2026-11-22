/* global fetch, crypto, console, document, window, sessionStorage, getComputedStyle */
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
import process from 'node:process'
import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { api, root, artifact, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
const label = process.env.ITATEST_PHASE6_LABEL || 'development'
const capture = process.env.ITATEST_TEST_CAPTURE !== '0'
const checks = [], observations = [], errors = [], screenshots = []
async function request(path, token, method = 'GET', body) {
  const response = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  assert.ok(response.ok, `${path}: ${response.status} ${response.ok ? '' : await response.text()}`)
  return response.status === 204 ? null : response.json()
}
function makePdf(path) {
  let value = '%PDF-1.4\n'; const offsets = [0]
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 7 0 R >> >> /Contents 4 0 R >>', null, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>', null, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
  const pages = ['BT /F1 28 Tf 60 700 Td (Algebra / Linear equations) Tj 0 -70 Td /F1 18 Tf (2x + 6 = 18) Tj 0 -36 Td (2x = 12) Tj 0 -36 Td (x = 6) Tj 0 -90 Td /F1 14 Tf (Subtract 6 from both sides, then divide by 2.) Tj 0 -40 Td (Check: 2 x 6 + 6 = 18) Tj ET', 'BT /F1 28 Tf 60 700 Td (Practice / Check your steps) Tj 0 -80 Td /F1 18 Tf (Solve: 3x + 9 = 30) Tj 0 -50 Td (1. Subtract 9 from both sides.) Tj 0 -40 Td (2. Divide by 3.) Tj 0 -40 Td (3. Substitute your answer to check.) Tj ET']
  objects[0] = '<< /Type /Catalog /Pages 2 0 R /Outlines 8 0 R >>'
  objects.push('<< /Type /Outlines /First 9 0 R /Last 10 0 R /Count 2 >>', '<< /Title (Example) /Parent 8 0 R /Next 10 0 R /Dest [3 0 R /Fit] >>', '<< /Title (Practice) /Parent 8 0 R /Prev 9 0 R /Dest [5 0 R /Fit] >>')
  for (let i = 0; i < 2; i++) objects[3 + i * 2] = `<< /Length ${pages[i].length} >>\nstream\n${pages[i]}\nendstream`
  for (let i = 0; i < objects.length; i++) { offsets.push(Buffer.byteLength(value)); value += `${i + 1} 0 obj\n${objects[i]}\nendobj\n` }
  const xref = Buffer.byteLength(value)
  value += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` + offsets.slice(1).map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  writeFileSync(path, value)
}
const admin = await request('/auth/login', null, 'POST', { email: 'admin@cent.local', password: 'cent-local-preview-only' })
const learner = await request('/auth/register', null, 'POST', { email: `reading-${label}-${Date.now()}@test.local`, password: 'reading-preview-check', name: 'سارا رضایی' })
const stranger = await request('/auth/register', null, 'POST', { email: `reading-isolation-${Date.now()}@test.local`, password: 'reading-preview-check', name: 'دانش‌آموز تازه' })
const trainingId = crypto.randomUUID(), productId = crypto.randomUUID()
await request(`/admin/trainings/${trainingId}`, admin.token, 'PUT', { title: 'جبر؛ از مثال تا تمرین', description: 'مثال‌های معادله خطی و تمرین برای مرور روش حل.', includedInSubscription: false, published: true })
await request(`/admin/products/${productId}`, admin.token, 'PUT', { title: 'آموزش جبر', kind: 'TRAINING', trainingId, priceRial: 10000, durationDays: null, active: true })
const curriculum = await request('/curriculum')
const math = curriculum.courses.find(c => c.code === 'math')
const mathProduct = crypto.randomUUID()
await request(`/admin/products/${mathProduct}`, admin.token, 'PUT', { title: 'مرور ریاضی', kind: 'TRAINING', trainingId: math.trainingId, priceRial: 10000, durationDays: null, active: true })
for (const id of [productId, mathProduct]) {
  const order = await request('/checkout', learner.token, 'POST', { productId: id, requestId: crypto.randomUUID() })
  assert.equal((await request(`/me/orders/${order.id}/verify`, learner.token, 'POST', {})).paid, true)
}
const browser = await chromium.launch(browserOptions)
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(root + '/')
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), admin.token)
  const pdfPath = '.preview-artifacts/phase6-reading.pdf'; makePdf(pdfPath)
  await page.goto(root + '/admin/content')
  await page.getByRole('combobox', { name: /^آموزش/ }).selectOption(trainingId)
  await page.getByLabel('عنوان درس', { exact: true }).fill('معادله‌های خطی؛ مثال و تمرین')
  await page.locator('input[type=file]').setInputFiles(pdfPath)
  await page.getByRole('button', { name: 'بارگذاری و انتشار درس', exact: true }).click()
  await page.getByText('درس با موفقیت منتشر شد.', { exact: true }).waitFor({ timeout: 60000 })
  const catalog = await request('/admin/trainings', admin.token)
  const doc = catalog.documents.find(d => d.trainingId === trainingId)
  assert.equal(doc.pageCount, 2); assert.equal(doc.published, true)
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), learner.token)
  const study = `/student/study/${doc.id}`
  const rendered = async () => page.waitForFunction(() => { const c = document.querySelector('canvas'); return c?.width > 500 && !document.querySelector('.cent-page-content.concealed') })
  const setTheme = async theme => { await page.evaluate(theme => window.ItatestAppearance.setPreference(theme), theme); await page.evaluate(() => document.fonts.ready) }
  const screenshot = async name => { if (!capture) return; await page.screenshot({ path: artifact(name), fullPage: false }); screenshots.push(name) }
  const putProgress = page.waitForResponse(r => r.request().method() === 'PUT' && r.url().endsWith(`/documents/${doc.id}/progress`))
  await page.goto(root + study); await rendered()
  assert.equal((await putProgress).status(), 200)
  assert.equal((await request(`/documents/${doc.id}`, learner.token)).progress.lastPage, 1)
  const outline = (await request(`/documents/${doc.id}`, learner.token)).sections
  assert.deepEqual(outline.map(section => section.startPage), [1, 2])
  const pixels = await page.locator('canvas').evaluate(c => [...c.getContext('2d').getImageData(0, 0, 1, 1).data])
  assert.deepEqual(pixels, [255, 255, 255, 255])
  assert.equal(await page.locator('.cent-page-shell').evaluate(el => getComputedStyle(el).filter), 'none')
  const editor = page.getByLabel('متن یادداشت')
  async function save(body) {
    await editor.fill(body)
    const response = page.waitForResponse(r => r.request().method() === 'PUT' && /\/notes\//.test(r.url()))
    await page.getByRole('button', { name: 'ثبت یادداشت', exact: true }).click()
    const result = await response; assert.equal(result.status(), 200)
    await page.getByText('در حساب شما ذخیره شد', { exact: true }).waitFor()
    return result.json()
  }
  const first = await save('برای حل معادله، اول ثابت‌ها رو جابه‌جا می‌کنم.\nبعد از تقسیم، جواب رو در معادله اصلی بررسی می‌کنم. 2x + 6 = 18')
  await page.getByRole('button', { name: 'یادداشت جدید', exact: true }).click()
  await save('اگر دو طرف رو بر یک عدد تقسیم می‌کنم، اون عدد نباید صفر باشه.')
  await setTheme('light'); await page.evaluate(() => window.scrollTo(0, 0))
  await screenshot('after-reader-light-1440.png')
  // Supported zoom changes only the document viewport; the application never overflows.
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 })
    await page.getByRole('button', { name: 'اندازه معمول', exact: true }).click()
    await page.getByRole('button', { name: 'بزرگ‌نمایی', exact: true }).click()
    await page.getByRole('button', { name: 'بزرگ‌نمایی', exact: true }).click()
    const bounds = await page.evaluate(() => ({ shell: document.documentElement.scrollWidth, viewport: window.innerWidth, pan: document.querySelector('.reading-page-pan').scrollWidth, available: document.querySelector('.reading-page-pan').clientWidth }))
    assert.ok(bounds.shell <= bounds.viewport + 1, `reader shell overflow: ${JSON.stringify(bounds)}`)
    assert.ok(bounds.pan > bounds.available, `intentional 150% document pan at ${width}`)
    observations.push({ width, ...bounds })
  }
  await page.setViewportSize({ width: 390, height: 844 }); await setTheme('dark')
  await page.getByRole('button', { name: 'اندازه معمول', exact: true }).click()
  await page.getByRole('button', { name: 'بستن یادداشت‌ها', exact: true }).click()
  assert.equal(await page.locator('#reading-notes-panel').isVisible(), false)
  await page.evaluate(() => window.scrollTo(0, 0)); await screenshot('after-reader-dark-390.png')
  assert.deepEqual(await page.locator('canvas').evaluate(c => [...c.getContext('2d').getImageData(0, 0, 1, 1).data]), pixels)
  await page.getByRole('button', { name: /یادداشت‌ها/ }).click()
  assert.equal(await page.locator('#reading-notes-panel').evaluate(el => el === document.activeElement), true)
  await setTheme('light'); await screenshot('after-editor-light-390.png')
  // Selection/edit uses the same persisted note ID and revision.
  await page.locator('.cent-note-text').filter({ hasText: 'اول ثابت‌ها' }).click()
  const edited = await save(first.body + '\nیادآوری: علامت‌ها رو با دقت بررسی کنم.')
  assert.equal(edited.id, first.id); assert.equal(edited.revision, first.revision + 1)
  await page.getByRole('button', { name: 'یادداشت جدید', exact: true }).click()
  let failedId
  await page.route('**/notes/*', route => {
    if (route.request().method() !== 'PUT') return route.continue()
    failedId = route.request().url().split('/').at(-1)
    return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'ذخیره موقتاً در دسترس نیست؛ دوباره تلاش کن.' }) })
  }, { times: 1 })
  await editor.fill('یادداشت آزمایشی برای بررسی بازیابی')
  await page.getByRole('button', { name: 'ثبت یادداشت', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'ذخیره موقتاً' }).waitFor()
  assert.equal(await editor.inputValue(), 'یادداشت آزمایشی برای بررسی بازیابی')
  assert.equal(await page.getByText('در حساب شما ذخیره شد', { exact: true }).count(), 0)
  let releaseSave, requestedSave
  const saveGate = new Promise(resolve => { releaseSave = resolve })
  const saveRequest = new Promise(resolve => { requestedSave = resolve })
  await page.route('**/notes/*', async route => { requestedSave(); await saveGate; await route.continue() }, { times: 1 })
  const retriedSave = save('یادداشت آزمایشی برای بررسی بازیابی')
  await saveRequest
  assert.equal(await editor.isDisabled(), true)
  assert.equal(await page.getByLabel('انتخاب صفحه').isDisabled(), true)
  assert.equal(await page.getByRole('button', { name: 'در حال ثبت…', exact: true }).isDisabled(), true)
  assert.equal(await page.getByText('در حساب شما ذخیره شد', { exact: true }).count(), 0)
  releaseSave()
  assert.equal((await retriedSave).id, failedId)
  const pendingDelete = page.locator('.cent-page-notes article').filter({ hasText: 'آزمایشی برای بررسی بازیابی' })
  let deletes = 0
  const trackDelete = req => { if (req.method() === 'DELETE' && req.url().includes('/notes/')) deletes++ }
  page.on('request', trackDelete)
  page.once('dialog', dialog => dialog.dismiss())
  await pendingDelete.getByRole('button', { name: 'حذف یادداشت' }).click()
  assert.equal(deletes, 0); assert.equal(await pendingDelete.count(), 1)
  page.once('dialog', dialog => dialog.accept())
  const deletion = page.waitForResponse(r => r.request().method() === 'DELETE' && r.url().includes('/notes/'))
  await pendingDelete.getByRole('button', { name: 'حذف یادداشت' }).click()
  assert.equal((await deletion).status(), 204)
  await page.getByText('یادداشت حذف شد', { exact: true }).waitFor(); assert.equal(await pendingDelete.count(), 0)
  assert.equal(deletes, 1); page.off('request', trackDelete)
  // Page navigation and progress remain server-owned, including furthest-page monotonicity.
  const secondProgress = page.waitForResponse(r => r.request().method() === 'PUT' && r.url().endsWith(`/documents/${doc.id}/progress`) && r.request().postDataJSON().page === 2)
  await page.getByLabel('فهرست درس').selectOption('2'); await rendered()
  assert.equal(await page.getByLabel('انتخاب صفحه').inputValue(), '2')
  assert.equal((await secondProgress).status(), 200)
  await page.reload(); await rendered()
  assert.equal(await page.getByLabel('انتخاب صفحه').inputValue(), '2')
  await page.getByLabel('انتخاب صفحه').selectOption('1'); await rendered()
  await page.getByRole('button', { name: 'صفحه بعد', exact: true }).click(); await rendered()
  assert.equal(await page.getByLabel('انتخاب صفحه').inputValue(), '2')
  const backProgress = page.waitForResponse(r => r.request().method() === 'PUT' && r.url().endsWith(`/documents/${doc.id}/progress`) && r.request().postDataJSON().page === 1)
  await page.getByRole('button', { name: 'صفحه قبل', exact: true }).click(); await rendered()
  assert.equal((await backProgress).status(), 200)
  const current = await request(`/documents/${doc.id}`, learner.token)
  assert.equal(current.progress.lastPage, 1); assert.equal(current.progress.furthestPage, 2); assert.equal(current.notes.length, 2)
  checks.push('Real administrator PDF.js upload/publish with actual bookmarks; authorized canvas with watermark; two persisted notes; identical IDs/revisions; failure retains draft and retry ID; native deletion cancel/confirm; page buttons/select/bookmark/resume/furthest progress; zoom/pan; mobile notes focus; unchanged dark PDF pixels')
  // Exact library access and note search/navigation, without extra library filters.
  await page.setViewportSize({ width: 1440, height: 1000 }); await setTheme('light')
  await page.goto(root + '/student/content'); await page.locator('.reading-resource').first().waitFor()
  const resource = page.locator('.reading-resource').filter({ has: page.getByRole('heading', { name: doc.title, exact: true }) })
  assert.equal(await resource.locator('meter').getAttribute('value'), '2')
  assert.equal(await resource.locator('meter').getAttribute('max'), '2')
  assert.ok((await resource.innerText()).includes('صفحه 1'))
  assert.equal(await resource.getByRole('link', { name: /ادامه مطالعه/ }).getAttribute('href'), new URL(root).pathname.replace(/\/$/, '') + study)
  assert.ok((await resource.innerText()).includes('2 یادداشت'))
  await screenshot('after-library-light-1440.png')
  await page.goto(root + '/student/notes'); await page.locator('.reading-saved-note').first().waitFor()
  assert.equal(await page.locator('.reading-saved-note').count(), 2)
  await setTheme('dark'); await screenshot('after-notes-dark-1440.png')
  const search = page.getByLabel('جست‌وجو در یادداشت‌ها')
  await search.fill('علامت‌ها'); assert.equal(await page.locator('.reading-saved-note').count(), 1)
  await search.fill('بدون نتیجه'); await page.getByRole('heading', { name: 'یادداشتی با این عبارت پیدا نشد' }).waitFor()
  await page.getByRole('button', { name: 'پاک کردن جست‌وجو' }).click(); assert.equal(await search.inputValue(), '')
  const originalNote = page.locator('.reading-saved-note').filter({ hasText: 'اول ثابت‌ها' })
  await originalNote.getByRole('link').click(); await rendered()
  assert.equal(await page.getByLabel('انتخاب صفحه').inputValue(), '1')
  assert.equal(new URL(page.url()).searchParams.get('note'), first.id)
  checks.push('Library ownership/readability and supplied last/furthest page/count; unstarted resource; notes exact body/title search, no-match reset, stored timestamps and original page link')
  // Reproduce the former race deterministically: route is committed while document is pending.
  const mathDoc = curriculum.documents.find(d => d.trainingId === math.trainingId)
  const sections = await request(`/documents/${mathDoc.id}/source-sections`, learner.token)
  const mathPage = sections.findIndex((section, index) => index > 0 && section.topicId) + 1
  const mathPath = `/student/study/${mathDoc.id}?page=${mathPage}`
  await page.goto(root + mathPath)
  await page.getByRole('link', { name: 'تمرین این مبحث', exact: true }).waitFor()
  await page.getByRole('link', { name: 'تمرین این مبحث', exact: true }).click()
  let releaseDocument
  const documentGate = new Promise(resolve => { releaseDocument = resolve })
  let requestedDocument
  const documentRequest = new Promise(resolve => { requestedDocument = resolve })
  await page.route(`**/documents/${mathDoc.id}`, async route => { requestedDocument(); await documentGate; await route.continue() })
  await page.getByRole('link', { name: 'بازگشت به مطالعه', exact: true }).click(); await documentRequest
  assert.equal(await page.getByLabel('انتخاب صفحه').count(), 0)
  await page.getByRole('status').filter({ hasText: 'در حال آماده‌سازی' }).waitFor()
  releaseDocument()
  await page.waitForFunction(n => document.querySelector('[aria-label="انتخاب صفحه"]')?.value === String(n), mathPage)
  assert.equal(await page.getByLabel('انتخاب صفحه').inputValue(), String(mathPage))
  await page.unroute(`**/documents/${mathDoc.id}`)
  checks.push('Controlled delayed document fetch proves study-return test race; route commits before selector exists, exact requested page restores after real initialization, no delay or product persistence change')
  // Recovery states are explicitly injected, never saved as fictitious user history.
  await page.route(`**/documents/${doc.id}/pages/*`, route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'صفحه بارگذاری نشد؛ اتصال رو بررسی کن و دوباره تلاش کن.' }) }))
  await page.setViewportSize({ width: 390, height: 844 }); await setTheme('light')
  await page.goto(root + study); await page.getByRole('alert').filter({ hasText: 'صفحه بارگذاری نشد' }).waitFor()
  assert.equal(await page.locator('.cent-page-content').evaluate(el => getComputedStyle(el).visibility), 'hidden')
  await page.evaluate(() => window.scrollTo(0, 0)); await screenshot('after-recovery-light-390.png')
  await page.unroute(`**/documents/${doc.id}/pages/*`)
  await page.getByRole('button', { name: 'دوباره تلاش کن', exact: true }).click(); await rendered()
  // Metadata and notes recovery preserve real error detail and actual retry actions.
  await page.route('**/me/notes', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'یادداشت‌ها فعلاً دریافت نشدن.' }) }))
  await page.goto(root + '/student/notes'); await page.getByRole('alert').filter({ hasText: 'فعلاً دریافت نشدن' }).waitFor()
  assert.equal(await page.getByRole('heading', { name: 'نکته‌هات رو کنار صفحه بنویس' }).count(), 0)
  await page.unroute('**/me/notes'); await page.getByRole('button', { name: 'دوباره تلاش کن' }).click(); await page.locator('.reading-saved-note').first().waitFor()
  checks.push('Injected page503 conceals document with actual retry; injected notes503 is never an empty collection; each recovery returns to real connected content')
  // Unauthorized account cannot read protected document pages or mutate the owner's notes.
  const denied = async (path, method = 'GET', body) => fetch(api + path, { method, headers: { Authorization: `Bearer ${stranger.token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  for (const path of [`/documents/${doc.id}`, `/documents/${doc.id}/pages/1`, `/documents/${mathDoc.id}/source-sections`]) assert.ok([403, 404].includes((await denied(path)).status), path)
  assert.ok([403, 404].includes((await denied(`/notes/${first.id}`, 'PUT', { ...edited, body: 'Forbidden' })).status))
  const foreignDeleteStatus = (await denied(`/notes/${first.id}?revision=${edited.revision}`, 'DELETE')).status
  // The existing preview API deliberately returns its generic revision conflict
  // when the account cannot match an owned note, without changing the owner's row.
  assert.equal(foreignDeleteStatus, 409)
  const ownerAfterForeignDelete = (await request(`/documents/${doc.id}`, learner.token)).notes.find(n => n.id === first.id)
  assert.equal(ownerAfterForeignDelete.body, edited.body)
  assert.equal(ownerAfterForeignDelete.revision, edited.revision)
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), stranger.token)
  await page.goto(root + study); await page.getByRole('alert').waitFor()
  assert.equal(await page.locator('canvas').count(), 0)
  await page.goto(root + '/student/content'); await page.getByRole('heading', { name: 'کتابخانه‌ات از اولین آموزش شروع می‌شه' }).waitFor()
  await setTheme('dark'); await screenshot('after-empty-library-dark-390.png')
  await page.goto(root + '/student/notes'); await page.getByRole('heading', { name: 'نکته‌هات رو کنار صفحه بنویس' }).waitFor()
  assert.equal(await page.locator('.reading-saved-note').count(), 0)
  checks.push(`Actual unentitled account: document/source/page and owner note PUT denied; foreign DELETE status${foreignDeleteStatus} leaves owner body/revision intact; no canvas or private notes; real empty library and notes`)
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), learner.token)
  await page.goto(root + study); await rendered()
  const expired = async route => route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ message: 'دسترسی این آموزش پایان یافته؛ دسترسی رو بررسی کن.' }) })
  await page.route(`**/documents/${doc.id}/pages/2`, expired)
  await page.getByLabel('انتخاب صفحه').selectOption('2'); await page.getByRole('alert').filter({ hasText: 'دسترسی این آموزش' }).waitFor()
  assert.equal(await page.locator('.cent-page-content').evaluate(el => getComputedStyle(el).visibility), 'hidden')
  await page.unroute(`**/documents/${doc.id}/pages/2`); await page.getByRole('button', { name: 'دوباره تلاش کن' }).click(); await rendered()
  checks.push('Injected expired page403 retains concealment and existing access/retry links; no protected URL, download, iframe or PDF inversion introduced')
  // Restore a useful stable state for assertion-only accessibility checks.
  await page.getByLabel('انتخاب صفحه').selectOption('1'); await rendered()
  const lastProgress = page.waitForResponse(r => r.request().method() === 'PUT' && r.url().endsWith(`/documents/${doc.id}/progress`))
  await lastProgress
  assert.deepEqual(errors, [])
  writeFileSync(`.preview-artifacts/phase6-${label}-fixture.json`, JSON.stringify({ learner, stranger, doc, mathDoc, mathPage, note: edited }, null, 2))
  writeFileSync(artifact(`reading-${label}-result.json`), JSON.stringify({ success: true, checks, observations, screenshots, browserErrors: errors, fixture: 'Disposable local DEVELOPMENT_MOCK learners and administrator-uploaded two-page synthetic educational PDF; no real payment or student data', injected: ['page503', 'notes503', 'save503', 'expired page403', 'controlled pending document'], verified: ['real PDF.js administrator conversion and authorized student canvas', 'existing source-section reading', 'real protected APIs, progress and note revisions', 'actual unentitled denial'], unverified: ['real expired entitlement lifecycle', 'production storage/hosting', 'cross-browser/assistive technology'] }, null, 2))
  console.log(`Phase 6 reading checks passed: ${checks.length} groups, ${observations.length} zoom/viewport observations, ${screenshots.length} AFTER images.`)
  await context.close()
} finally { await browser.close() }
