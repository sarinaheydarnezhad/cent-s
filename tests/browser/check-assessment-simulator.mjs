/* global fetch, crypto, sessionStorage, console */
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import process from 'node:process'
import { chromium } from 'playwright'
import { api, root, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
const request = async (path, token, body) => {
  const response = await fetch(api + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  assert.ok(response.ok, `${path}: ${response.status}`)
  return response.json()
}
const learner = await request('/auth/register', null, { email: `phase5-sim-${Date.now()}@test.local`, password: 'phase5-local-only', name: 'آزمون شبیه‌ساز' })
const admin = await request('/auth/login', null, { email: 'admin@cent.local', password: 'cent-local-preview-only' })
const bank = await request('/admin/questions/', admin.token)
const catalog = await request('/catalog')
const subscription = catalog.products.find(p => p.kind === 'SUBSCRIPTION' && p.active)
assert.ok(subscription, 'Existing DEVELOPMENT_MOCK subscription required')
const order = await request('/checkout', learner.token, { productId: subscription.id, requestId: crypto.randomUUID() })
assert.equal((await request(`/me/orders/${order.id}/verify`, learner.token, {})).paid, true)
const curriculum = await request('/curriculum')
const topic = curriculum.topics.find(t => t.courseCode === 'math' && t.title === 'عبارت‌های جبری')
const browser = await chromium.launch(browserOptions)
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await context.addInitScript(token => sessionStorage.setItem('cent:session:v1', token), learner.token)
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(root + '/student/simulators')
  await page.getByRole('link', { name: 'شروع شبیه‌ساز', exact: true }).click()
  await page.getByLabel('انتخاب درس').selectOption('math')
  await page.getByLabel('انتخاب مبحث').selectOption(topic.id)
  await page.getByLabel('انتخاب درس').selectOption('physics')
  assert.equal(await page.getByLabel('انتخاب مبحث').inputValue(), '')
  await page.getByLabel('انتخاب درس').selectOption('math')
  await page.getByLabel('انتخاب مبحث').selectOption(topic.id)
  const starts = []
  await page.route('**/api/cent/v1/attempts/', async route => {
    if (route.request().method() !== 'POST') return route.continue()
    starts.push(route.request().postDataJSON())
    if (starts.length === 1) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'آزمون آماده نشد. دوباره تلاش کن.' }) })
    return route.continue()
  })
  await page.getByRole('button', { name: 'شروع آزمون', exact: true }).click()
  await page.getByRole('alert').waitFor()
  await page.getByRole('button', { name: 'شروع آزمون', exact: true }).click()
  await page.locator('.sim-question').waitFor()
  assert.deepEqual(starts[0], starts[1])
  assert.equal(starts[1].kind, 'simulator')
  assert.equal(starts[1].course, 'math')
  assert.equal(starts[1].topicId, topic.id)
  const saved = await page.evaluate(() => {
    const key = Object.keys(sessionStorage).find(k => k.startsWith('cent:exam:') && k.includes(':simulator:'))
    return JSON.parse(sessionStorage.getItem(key))
  })
  await page.locator('.options-list button').nth(bank.find(q => q.id === saved.attempt.questions[0].id).correctAnswer).click()
  await page.getByRole('button', { name: `سؤال ${saved.attempt.questions.length}`, exact: true }).click()
  let release
  const gate = new Promise(resolve => { release = resolve })
  let submissions = 0
  await page.route('**/attempts/*/submit', async route => { submissions++; await gate; await route.continue() })
  await page.getByRole('button', { name: 'ثبت و دیدن نتیجه', exact: true }).click()
  await page.getByRole('button', { name: 'در حال ثبت…', exact: true }).waitFor()
  assert.ok(await page.getByRole('button', { name: 'در حال ثبت…', exact: true }).isDisabled())
  assert.ok(await page.locator('.options-list button').first().isDisabled())
  assert.equal(submissions, 1)
  release()
  await page.waitForURL('**/student/results/*')
  await page.locator('.assessment-result-summary').waitFor()
  const outcome = await request(`/attempts/${saved.attempt.id}`, learner.token)
  assert.equal(outcome.result.correct, 1)
  assert.equal(outcome.result.incorrect, 0)
  assert.equal(outcome.result.unanswered, saved.attempt.questions.length - 1)
  assert.ok((await page.locator('.assessment-score-ring strong').innerText()).includes(String(outcome.result.percentage)))
  const study = '/student/study/11111111-1111-4111-8111-111111111111?page=2'
  await page.goto(root + `/student/results/${saved.attempt.id}?returnTo=${encodeURIComponent(study)}`)
  assert.ok((await page.getByRole('link', { name: 'بازگشت به مطالعه', exact: true }).getAttribute('href')).endsWith(study))
  assert.deepEqual(errors, [])
  writeFileSync(`docs/refinement/evidence/phase-5/simulator-${process.env.ITATEST_PHASE5_LABEL || 'development'}-result.json`, JSON.stringify({ success: true, checks: ['Existing mock-paid subscription enables actual simulator', 'Course change resets topic', 'Start failure retry retains exact request identity and configuration', 'Busy submission disables choices/action and sends one request', 'Real partial-answer server score and unanswered counts', 'Validated study return retained'], total: outcome.result.total, correct: outcome.result.correct, unanswered: outcome.result.unanswered, percentage: outcome.result.percentage, browserErrors: errors }, null, 2))
  console.log('Connected simulator passed: subscription, configuration, start retry, guarded submission, partial score and study return.')
} finally { await browser.close() }
