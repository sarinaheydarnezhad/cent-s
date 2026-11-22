/* global fetch, crypto, sessionStorage, document, innerWidth, console */
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import process from 'node:process'
import { api, root, artifact, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
async function request(path, token, method = 'GET', body) {
  const response = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  assert.ok(response.ok, `${path}: ${response.status} ${response.ok ? '' : await response.text()}`)
  return response.status === 204 ? null : response.json()
}
const admin = await request('/auth/login', null, 'POST', { email: 'admin@cent.local', password: 'cent-local-preview-only' })
const learner = await request('/auth/register', null, 'POST', { email: `progress-${Date.now()}@test.local`, password: 'progress-local-check', name: 'Progress check' })
const other = await request('/auth/register', null, 'POST', { email: `progress-other-${Date.now()}@test.local`, password: 'progress-local-check', name: 'Other progress check' })
const curriculum = await request('/curriculum')
const topic = curriculum.topics.find(t => t.courseCode === 'math' && t.title === 'عبارت‌های جبری')
const bank = await request('/admin/questions/', admin.token)
async function complete(correct) {
  const attempt = await request('/attempts/', learner.token, 'POST', { kind: 'practice', course: 'math', topicId: topic.id, requestId: crypto.randomUUID() })
  const answers = Object.fromEntries(attempt.questions.map(q => {
    const key = bank.find(b => b.id === q.id).correctAnswer
    return [q.id, correct ? key : (key + 1) % q.options.length]
  }))
  const outcome = await request(`/attempts/${attempt.id}/submit`, learner.token, 'POST', { answers })
  assert.equal(outcome.result.percentage, correct ? 100 : 0)
  return attempt
}
const browser = await chromium.launch(browserOptions)
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 950 } })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(root + '/')
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), learner.token)
  await page.goto(root + '/student/results')
  await page.getByText('هنوز نتیجه‌ای برای این انتخاب ثبت نشده', { exact: true }).waitFor()
  assert.equal(await page.locator('[data-result-attempt]').count(), 0)
  const first = await complete(false)
  await page.reload()
  await page.locator(`[data-result-attempt="${first.id}"]`).waitFor()
  assert.equal(await page.locator('[data-personal-stats] .stat-card strong').nth(1).innerText(), '0٪')
  const before = (await request('/me/mastery', learner.token)).courses.find(c => c.code === 'math')
  assert.equal(before.assessedTopics, 1)
  assert.equal(before.topics.find(t => t.id === topic.id).masteryPercentage, 0)
  await page.locator('[data-result-course="math"]').getByText('مباحثی که به مرور نیاز دارند', { exact: true }).waitFor()
  const second = await complete(true)
  await page.reload()
  await page.locator(`[data-result-attempt="${second.id}"]`).waitFor()
  const stats = await page.locator('[data-personal-stats] .stat-card strong').allTextContents()
  assert.deepEqual(stats, ['2', '100٪', '50٪', '+100'])
  const after = (await request('/me/mastery', learner.token)).courses.find(c => c.code === 'math')
  assert.equal(after.topics.find(t => t.id === topic.id).masteryPercentage, 100)
  assert.equal(after.topics.find(t => t.id === topic.id).evidenceQuestions, before.topics.find(t => t.id === topic.id).evidenceQuestions)
  const card = page.locator('[data-result-course="math"]')
  await card.getByText(`${after.confirmedProgressPercentage}٪ پیشرفت`, { exact: true }).waitFor()
  assert.equal(await card.getByText('مباحثی که به مرور نیاز دارند', { exact: true }).count(), 0)
  assert.ok((await page.locator(`[data-result-attempt="${second.id}"]`).innerText()).includes('تمرین مبحث'))
  await page.getByLabel('فیلتر نتایج بر اساس درس').selectOption('physics')
  assert.equal(await page.locator('[data-result-attempt]').count(), 0)
  await page.getByLabel('فیلتر نتایج بر اساس درس').selectOption('math')
  assert.equal(await page.locator('[data-result-attempt]').count(), 2)
  if (process.env.ITATEST_TEST_CAPTURE !== '0') await page.screenshot({ path: artifact('personal-progress-desktop.png'), fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  if (process.env.ITATEST_TEST_CAPTURE !== '0') await page.screenshot({ path: artifact('personal-progress-mobile.png'), fullPage: true })
  // Switching accounts must never display another learner's results.
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), other.token)
  await page.reload()
  await page.getByText('هنوز نتیجه‌ای برای این انتخاب ثبت نشده', { exact: true }).waitFor()
  assert.equal(await page.locator('[data-result-attempt]').count(), 0)
  assert.deepEqual(await request('/attempts/', other.token), [])
  assert.deepEqual(errors, [])
  writeFileSync(artifact('personal-progress-result.json'), JSON.stringify({ success: true, scores: [0, 100], recentAccuracy: 50, change: 100, subjectProgress: after.confirmedProgressPercentage, distinctEvidence: after.topics.find(t => t.id === topic.id).evidenceQuestions, checked: ['empty account', 'actual practice results', 'updated mastery', 'comparable improvement', 'subject filter', 'mobile', 'account isolation'], browserErrors: errors }, null, 2))
  console.log('Personal progress checks passed: real 0% and 100% results, 50% recent accuracy, +100 change, updated topic progress and account isolation.')
} finally { await browser.close() }
