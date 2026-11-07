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
const learner = await request('/auth/register', null, 'POST', { email: `curriculum-${Date.now()}@test.local`, name: 'Curriculum check', password: 'curriculum-local-check' })
const curriculum = await request('/curriculum', learner.token)
assert.equal(curriculum.courses.length, 5)
assert.equal(curriculum.topics.length, 190)
const course = curriculum.courses.find(c => c.code === 'math')
const bank = await request('/admin/questions/', admin.token)
const skillId = curriculum.topics.find(t => t.courseCode === 'math' && t.title === 'عبارت‌های جبری').id
const productId = crypto.randomUUID()
await request(`/admin/products/${productId}`, admin.token, 'PUT', { title: 'Local curriculum verification', kind: 'TRAINING', trainingId: course.trainingId, priceRial: 10000, durationDays: null, active: true })
const order = await request('/checkout', learner.token, 'POST', { productId, requestId: crypto.randomUUID() })
await request(`/me/orders/${order.id}/verify`, learner.token, 'POST', {})
const library = await request('/me/library', learner.token)
const doc = library.documents.find(d => d.sourceId && d.trainingId === course.trainingId)
assert.ok(doc)
const sections = await request(`/documents/${doc.id}/source-sections`, learner.token)
assert.ok(sections.length > 0 && sections.some(s => s.text.length > 100))
const browser = await chromium.launch(browserOptions)
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 950 } })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(root)
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), learner.token)
  await page.goto(`${root}/diagnostic/test?course=math&topic=${skillId}`)
  await page.getByRole('button', { name: 'شروع آزمون', exact: true }).click()
  await page.locator('.sim-question h2').waitFor()
  const started = await page.evaluate(() => {
    const key = Object.keys(sessionStorage).find(k => k.startsWith('cent:exam:'))
    return JSON.parse(sessionStorage.getItem(key)).attempt
  })
  assert.ok(started.questions.length >= 3)
  assert.ok(started.questions.every(q => q.subject === 'math' && q.topicId === skillId && !('correctAnswer' in q)))
  for (let i = 0; i < started.questions.length; i++) {
    const q = started.questions[i]
    await page.locator('.options-list button').nth(bank.find(item => item.id === q.id).correctAnswer).click()
    await page.getByRole('button', { name: i === started.questions.length - 1 ? 'ثبت و دیدن نتیجه' : 'بعدی', exact: true }).click()
  }
  await page.waitForURL('**/student/results/*')
  await page.getByText('مرور پاسخ‌ها', { exact: true }).waitFor()
  await page.goto(`${root}/student/analysis`)
  await page.getByRole('heading', { name: /ریاضی · پیشرفت/ }).waitFor()
  const math = (await request('/me/mastery', learner.token)).courses.find(c => c.code === 'math')
  assert.equal(math.topics.find(t => t.id === skillId).masteryPercentage, 100)
  assert.equal(math.assessedTopics, 1)
  assert.ok(math.confirmedProgressPercentage < 100)
  await page.screenshot({ path: artifact('curriculum-progress-desktop.png'), fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  await page.screenshot({ path: artifact('curriculum-progress-mobile.png'), fullPage: true })
  await page.goto(`${root}/student/study/${doc.id}`)
  await page.locator('.cent-source-text > div').filter({ hasText: /.+/ }).waitFor()
  await page.getByLabel('متن یادداشت').fill('Curriculum source note persists')
  await page.getByRole('button', { name: 'ثبت یادداشت', exact: true }).click()
  await page.getByText('در حساب شما ذخیره شد', { exact: true }).waitFor()
  await page.reload()
  await page.getByText('Curriculum source note persists', { exact: true }).waitFor()
  await page.screenshot({ path: artifact('curriculum-study-mobile.png'), fullPage: true })
  assert.deepEqual(errors, [])
  writeFileSync(artifact('curriculum-result.json'), JSON.stringify({ success: true, sources: 39, questions: bank.filter(q => q.active).length, topics: curriculum.topics.length, math, sourceReader: true, noteRestored: true, browserErrors: errors }, null, 2))
  console.log('Curriculum browser check passed: filtered assessment, mastery, mobile layout, source reader and persistent notes.')
} finally { await browser.close() }
