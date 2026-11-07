import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { api, root, artifact, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
async function request(path, token, method = 'GET', body) {
  const response = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  assert.ok(response.ok, `${path}: ${response.status} ${response.ok ? '' : await response.text()}`)
  return response.status === 204 ? null : response.json()
}
const admin = await request('/auth/login', null, 'POST', { email: 'admin@cent.local', password: 'cent-local-preview-only' })
const email = `study-return-${Date.now()}@test.local`, password = 'study-return-local-check'
const learner = await request('/auth/register', null, 'POST', { email, password, name: 'Study return check' })
const curriculum = await request('/curriculum')
const course = curriculum.courses.find(c => c.code === 'math')
const productId = crypto.randomUUID()
await request(`/admin/products/${productId}`, admin.token, 'PUT', { title: 'Local study return verification', kind: 'TRAINING', trainingId: course.trainingId, priceRial: 10000, durationDays: null, active: true })
const order = await request('/checkout', learner.token, 'POST', { productId, requestId: crypto.randomUUID() })
await request(`/me/orders/${order.id}/verify`, learner.token, 'POST', {})
const doc = curriculum.documents.find(d => d.trainingId === course.trainingId)
const sections = await request(`/documents/${doc.id}/source-sections`, learner.token)
const pageNumber = sections.findIndex((s, i) => i > 0 && s.topicId) + 1
assert.ok(pageNumber > 1)
const studyPath = `/student/study/${doc.id}?page=${pageNumber}`
const browser = await chromium.launch(browserOptions)
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 950 } })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(root + '/')
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), learner.token)
  await page.goto(root + studyPath)
  await page.getByRole('link', { name: 'تمرین این مبحث', exact: true }).waitFor()
  await page.getByLabel('متن یادداشت').fill('Study return draft')
  await page.getByRole('link', { name: 'تمرین این مبحث', exact: true }).click()
  assert.equal(new URL(page.url()).searchParams.get('returnTo'), studyPath)
  // Cancelling before starting also goes back to the same page.
  await page.getByRole('link', { name: 'بازگشت به مطالعه', exact: true }).click()
  assert.equal(await page.getByLabel('انتخاب صفحه').inputValue(), String(pageNumber))
  await page.getByRole('link', { name: 'تمرین این مبحث', exact: true }).click()
  // Reauthentication must retain both the topic and reader return URL.
  await page.evaluate(() => sessionStorage.removeItem('cent:session:v1'))
  await page.reload()
  await page.waitForURL('**/login')
  await page.locator('input[type=email]').fill(email)
  await page.locator('input[type=password]').fill(password)
  await page.getByRole('button', { name: 'ورود به حساب', exact: true }).click()
  await page.waitForURL('**/student/practice?**')
  assert.equal(new URL(page.url()).searchParams.get('returnTo'), studyPath)
  await page.getByRole('button', { name: 'شروع آزمون', exact: true }).click()
  await page.locator('.sim-question h2').waitFor()
  await page.reload()
  await page.locator('.sim-question h2').waitFor()
  const attempt = await page.evaluate(() => {
    const key = Object.keys(sessionStorage).find(k => k.startsWith('cent:exam:'))
    return JSON.parse(sessionStorage.getItem(key)).attempt
  })
  for (let i = 0; i < attempt.questions.length; i++) {
    await page.locator('.options-list button').first().click()
    await page.getByRole('button', { name: i === attempt.questions.length - 1 ? 'ثبت و دیدن نتیجه' : 'بعدی', exact: true }).click()
  }
  await page.waitForURL('**/student/results/*?**')
  assert.equal(new URL(page.url()).searchParams.get('returnTo'), studyPath)
  await page.getByRole('link', { name: 'بازگشت به مطالعه', exact: true }).waitFor()
  await page.reload()
  const resume = page.getByRole('link', { name: 'بازگشت به مطالعه', exact: true })
  await resume.waitFor()
  await resume.click()
  await page.getByRole('link', { name: 'تمرین این مبحث', exact: true }).waitFor()
  assert.equal(new URL(page.url()).searchParams.get('page'), String(pageNumber))
  assert.equal(await page.getByLabel('انتخاب صفحه').inputValue(), String(pageNumber))
  assert.equal(await page.getByLabel('متن یادداشت').inputValue(), 'Study return draft')
  await page.screenshot({ path: artifact('study-return-page.png'), fullPage: true })
  // A test opened without a study origin keeps the existing dashboard fallback.
  await page.goto(`${root}/diagnostic/test?returnTo=${encodeURIComponent('https://example.invalid')}`)
  await page.getByRole('link', { name: 'بازگشت به پنل', exact: true }).waitFor()
  assert.equal(await page.getByRole('link', { name: 'بازگشت به مطالعه', exact: true }).count(), 0)
  assert.deepEqual(errors, [])
  writeFileSync(artifact('study-return-result.json'), JSON.stringify({ success: true, page: pageNumber, documentId: doc.id, checked: ['cancel to exact page', 'login preserves context', 'refresh active test', 'refresh result', 'return to exact lesson page', 'local draft restored', 'safe standalone fallback'], browserErrors: errors }, null, 2))
  console.log('Study return checks passed: test and results return to the exact reader page, including login, refresh and draft recovery.')
} finally { await browser.close() }
