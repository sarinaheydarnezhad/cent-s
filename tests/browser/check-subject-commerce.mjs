/* global sessionStorage, document */
// Real local HTTP/database integration. No route mocks and no real charges.
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import process from 'node:process'
import { mkdirSync, writeFileSync } from 'node:fs'

const root = process.env.CENT_COMMERCE_WEB_URL || 'http://localhost:5185/cent-s'
const api = process.env.CENT_COMMERCE_API_URL || 'http://127.0.0.1:5115/api/cent/v1'
for (const url of [root, api]) assert.ok(['localhost', '127.0.0.1'].includes(new URL(url).hostname))
const out = process.env.CENT_COMMERCE_OUTPUT || '../../.preview-artifacts/phase5-commerce'
mkdirSync(out, { recursive: true })
let token
async function call(path, body, expected = 200, auth = token) {
  const r = await fetch(api + path, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: 'Bearer ' + auth } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) })
  const text = await r.text(); assert.equal(r.status, expected, `${path}: ${text}`); return text ? JSON.parse(text) : null
}
const status = await call('/status'); assert.equal(status.payments, 'DEVELOPMENT_MOCK')
const auth = await call('/auth/register', { name: 'خریدار آزمایشی', email: `commerce-${Date.now()}@example.invalid`, password: 'Local-only-commerce-2026' })
token = auth.token
const catalog = await call('/catalog')
assert.equal(catalog.subjects.length, 6)
assert.ok(catalog.subjects.every(s => s.available && s.priceRial === 4900000 && s.reviewed.lessons > 0))
assert.ok(catalog.trainings.every(t => !/Local .* verification/.test(t.title)))
const ids = catalog.subjects.map(s => s.subjectId)
for (let n = 1; n <= 6; n++) {
  const q = await call('/subject-quotes', { subjectIds: ids.slice(0, n), payableRial: 1, discountPercent: 99 })
  assert.equal(q.payableRial, [4900000, 9310000, 13230000, 16660000, 19600000, 22050000][n - 1])
}
await call('/subject-quotes', { subjectIds: ['math', 'math'] }, 400)
await call('/subject-quotes', { subjectIds: ['unknown'] }, 400)
await call('/subject-quotes', { subjectIds: ['math'] }, 401, null)
await call('/admin/subject-offers/prepare', {}, 403)
const admin = await call('/auth/login', { email: 'admin@cent.local', password: 'cent-local-preview-only' }, 200, null)
const approval = await fetch(api + '/admin/subject-offers/math', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + admin.token }, body: JSON.stringify({ contentReleaseId: catalog.subjects.find(s => s.subjectId === 'math').contentReleaseId, available: true, confirmReviewedContent: false }) })
assert.equal(approval.status, 409)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 950 } })
await context.addInitScript(({ token, expiry }) => { sessionStorage.setItem('cent:session:v1', token); sessionStorage.setItem('cent:session-expiry:v1', expiry) }, { token, expiry: auth.expiresAt })
const page = await context.newPage(), errors = [], checks = []
page.on('pageerror', e => errors.push(e.message))
try {
  await page.goto(root + '/package')
  await page.locator('[data-subject="reading"]').waitFor()
  assert.equal(await page.locator('[data-subject]').count(), 6)
  await page.getByRole('button', { name: 'انتخاب درس‌های آمادهٔ این بسته' }).click()
  assert.equal(await page.locator('[data-subject] input:checked').count(), 6)
  await page.locator('[data-subject="physics"] input').uncheck()
  assert.equal(await page.locator('[data-subject] input:checked').count(), 5)
  for (const checkbox of await page.locator('[data-subject] input').all()) await checkbox.uncheck()
  checks.push('recommended six-subject bundle can be customized without separate pricing rules')
  await page.locator('[data-subject="reading"] input').check()
  await page.locator('[data-subject="math"] input').check()
  await page.getByRole('button', { name: 'دریافت پیش‌فاکتور و ادامهٔ خرید' }).click()
  await page.waitForURL('**/checkout?quote=*')
  await page.getByText('۹۳۱٬۰۰۰ تومان', { exact: true }).waitFor()
  const quoteId = new URL(page.url()).searchParams.get('quote')
  await page.screenshot({ path: out + '/checkout-desktop.png', fullPage: true })
  await page.getByRole('button', { name: 'ثبت سفارش و رفتن به درگاه' }).click()
  await page.waitForURL('**/checkout/development?order=*')
  const orderId = new URL(page.url()).searchParams.get('order')
  const detail = await call('/me/orders/' + orderId)
  assert.equal(detail.order.amountRial, 9310000); assert.equal(detail.order.status, 'PENDING'); assert.equal(detail.access.length, 0)
  assert.equal((await call(`/me/orders/${orderId}/verify`, {})).paid, false)
  const same = await call('/subject-checkout', { quoteId, requestId: detail.order.requestId, payableRial: 1 }); assert.equal(same.id, orderId)
  checks.push('two-subject quote, server total, persisted idempotent order, no premature access')
  await page.getByRole('button', { name: 'پرداخت موفق آزمایشی' }).click()
  await page.waitForURL('**/checkout/success?order=*')
  await page.getByRole('heading', { name: 'پرداختت تأیید شد' }).waitFor()
  const confirmations = await Promise.all(Array.from({ length: 3 }, () => call(`/me/orders/${orderId}/verify`, {})))
  assert.ok(confirmations.every(r => r.paid))
  const paid = await call('/me/orders/' + orderId); assert.equal(paid.order.status, 'PAID'); assert.equal(paid.access.length, 2)
  assert.equal((await call('/me/subject-access')).length, 2)
  checks.push('verified payment, concurrent duplicate confirmation, exactly two independent access items')
  const library = await call('/me/library'), curriculum = await call('/curriculum')
  const reading = catalog.subjects.find(s => s.subjectId === 'reading')
  assert.ok(library.readableTrainingIds.includes(reading.trainingId))
  const reviewedDoc = curriculum.documents.find(d => d.trainingId === reading.trainingId)
  assert.ok(reviewedDoc); await call('/documents/' + reviewedDoc.id + '/source-sections')
  assert.ok(library.readableDocumentIds.includes(reviewedDoc.id))
  const mathTraining = catalog.subjects.find(s => s.subjectId === 'math').trainingId
  const unreviewedDoc = curriculum.documents.find(d => d.trainingId === mathTraining && !library.readableDocumentIds.includes(d.id))
  assert.ok(unreviewedDoc); await call('/documents/' + unreviewedDoc.id + '/source-sections', undefined, 403)
  await call('/attempts/', { kind: 'practice', requestId: crypto.randomUUID(), course: 'reading', contentContract: 'passage-v1' })
  await call('/attempts/', { kind: 'practice', requestId: crypto.randomUUID(), course: 'biology', contentContract: 'passage-v1' }, 403)
  const other = await call('/auth/register', { name: 'حساب دوم', email: `other-${Date.now()}@example.invalid`, password: 'Local-only-commerce-2026' }, 200, null)
  await call('/me/orders/' + orderId, undefined, 404, other.token)
  await call('/subject-quotes/' + quoteId, undefined, 404, other.token)
  await call('/documents/' + reviewedDoc.id + '/source-sections', undefined, 403, other.token)
  checks.push('paid Reading lesson and Practice, unowned Biology denied, foreign order/quote/content denied')
  const renewal = await call('/subject-quotes', { subjectIds: ['math', 'biology'] })
  assert.ok(renewal.lines.find(l => l.subjectId === 'math').currentAccessEnd)
  await call('/subject-checkout', { quoteId: renewal.id, requestId: crypto.randomUUID() }, 409)
  const renewalOrder = await call('/subject-checkout', { quoteId: renewal.id, requestId: crypto.randomUUID(), acceptRenewal: true })
  await call('/development/payments/' + renewalOrder.id, { outcome: 'success' })
  const rights = await call('/me/subject-access'), math = rights.filter(a => a.subjectId === 'math').sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  assert.equal(math.length, 2); assert.equal(math[1].startsAt, math[0].expiresAt)
  checks.push('partial ownership disclosed, explicit renewal required, previous term preserved and next term queued')
  for (const [subject, outcome] of [['physics', 'failed'], ['chemistry', 'cancelled']]) {
    const q = await call('/subject-quotes', { subjectIds: [subject] })
    const o = await call('/subject-checkout', { quoteId: q.id, requestId: crypto.randomUUID() })
    await call('/development/payments/' + o.id, { outcome })
    assert.equal((await call('/me/orders/' + o.id)).order.status, outcome.toUpperCase())
    assert.ok(!(await call('/me/subject-access')).some(a => a.subjectId === subject))
  }
  checks.push('failed and cancelled payments grant no access')
  const singleQuote = await call('/subject-quotes', { subjectIds: ['logic'] })
  const singleOrder = await call('/subject-checkout', { quoteId: singleQuote.id, requestId: crypto.randomUUID() })
  await call('/development/payments/' + singleOrder.id, { outcome: 'success' })
  assert.equal((await call('/me/orders/' + singleOrder.id)).access.length, 1)
  checks.push('single-subject purchase grants exactly one twelve-month access item')
  await page.goto(root + '/student/profile')
  await page.getByRole('heading', { name: 'دسترسی درس‌های من' }).waitFor()
  await page.getByText('دورهٔ بعدی', { exact: true }).waitFor()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(root + '/package'); await page.locator('[data-subject="physics"]').waitFor()
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1))
  await page.screenshot({ path: out + '/catalog-mobile.png', fullPage: true })
  assert.deepEqual(errors, [])
  checks.push('purchase history, queued access visibility, mobile catalog without overflow, no page errors')
  const report = { status: 'passed', checks, counts: catalog.subjects.map(({ subjectId, published, reviewed, draft }) => ({ subjectId, published, reviewed, draft })), root, api, productionPayments: false }
  writeFileSync(out + '/result.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2))
} finally { await browser.close() }
