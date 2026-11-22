/* global document, window, getComputedStyle, innerWidth, sessionStorage, localStorage, console, fetch, crypto */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import process from 'node:process'
import { chromium } from 'playwright'
import { api, root, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
const evidence = 'docs/refinement/evidence/phase-5/'
mkdirSync(evidence, { recursive: true })
const capture = process.env.ITATEST_PHASE5_CAPTURE !== '0'
const label = process.env.ITATEST_PHASE5_LABEL || 'development'
const checks = [], observations = [], screenshots = [], errors = [], mappings = []
async function request(path, token, method = 'GET', body) {
  const response = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  assert.ok(response.ok, `${path}: ${response.status}`)
  return response.status === 204 ? null : response.json()
}
const admin = await request('/auth/login', null, 'POST', { email: 'admin@cent.local', password: 'cent-local-preview-only' })
const learner = await request('/auth/register', null, 'POST', { email: `phase5-${Date.now()}@test.local`, password: 'phase5-local-only', name: 'سارا احمدی' })
const fresh = await request('/auth/register', null, 'POST', { email: `phase5-new-${Date.now()}@test.local`, password: 'phase5-local-only', name: 'نگار محمدی' })
const curriculum = await request('/curriculum')
const bank = await request('/admin/questions/', admin.token)
const topic = curriculum.topics.find(t => t.courseCode === 'math' && t.title === 'عبارت‌های جبری')
assert.ok(topic)
const browser = await chromium.launch(browserOptions)
async function contextFor(token, theme = 'light', width = 1440) {
  const context = await browser.newContext({ viewport: { width, height: width < 800 ? 844 : 1000 }, colorScheme: theme, reducedMotion: 'reduce' })
  await context.addInitScript(({ token, theme }) => { sessionStorage.setItem('cent:session:v1', token); localStorage.setItem('itatest:appearance:v1', theme) }, { token, theme })
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  return { context, page }
}
async function settle(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => !document.querySelector('.assessment-page .ui-skeleton,.assessment-page .cent-loading'))
}
async function shot(page, name) {
  if (!capture) return
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: evidence + `after-${name}.png`, fullPage: false })
  screenshots.push(`after-${name}.png`)
}
async function observe(page, state, theme) {
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 })
    const size = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }))
    assert.ok(size.scroll <= size.width + 1, `${state}/${theme}/${width}: ${JSON.stringify(size)}`)
    observations.push({ state, theme, ...size })
  }
}
async function complete(correct) {
  const attempt = await request('/attempts/', learner.token, 'POST', { kind: 'practice', course: 'math', topicId: topic.id, requestId: crypto.randomUUID() })
  const answers = Object.fromEntries(attempt.questions.map(q => {
    const key = bank.find(b => b.id === q.id).correctAnswer
    return [q.id, correct ? key : (key + 1) % q.options.length]
  }))
  return request(`/attempts/${attempt.id}/submit`, learner.token, 'POST', { answers })
}
try {
  const { context, page } = await contextFor(learner.token)
  await page.goto(`${root}/diagnostic/test?course=math&topic=${topic.id}`); await settle(page)
  assert.equal(await page.getByLabel('انتخاب درس').inputValue(), 'math')
  assert.equal(await page.getByLabel('انتخاب مبحث').inputValue(), topic.id)
  await shot(page, 'entry-light-1440')
  await observe(page, 'entry', 'light')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole('button', { name: 'شروع آزمون', exact: true }).click()
  await page.locator('.sim-question h2').waitFor()
  const saved = await page.evaluate(() => {
    const key = Object.keys(sessionStorage).find(k => k.startsWith('cent:exam:') && k.includes(':diagnostic:'))
    return { key, ...JSON.parse(sessionStorage.getItem(key)) }
  })
  assert.ok(saved.attempt.questions.length >= 3)
  assert.ok(saved.attempt.questions.every(q => q.subject === 'math' && q.topicId === topic.id && !('correctAnswer' in q)))
  const expiresAt = saved.attempt.expiresAt
  const current = saved.attempt.questions[0]
  const key = bank.find(q => q.id === current.id).correctAnswer
  await page.locator('.options-list button').nth(key).focus(); await page.keyboard.press('Space')
  assert.equal(await page.locator('.options-list button[aria-pressed=true]').count(), 1)
  assert.equal(await page.locator('.options-list button.selected svg').count(), 1)
  assert.equal(await page.locator('.sim-question .ui-badge-success,.sim-question .ui-badge-error').count(), 0)
  assert.equal(await page.getByText('گزینه صحیح', { exact: false }).count(), 0)
  await page.getByRole('button', { name: 'بعدی', exact: true }).click()
  assert.equal(await page.locator('#assessment-question-title').evaluate(el => el === document.activeElement), true)
  await page.getByRole('button', { name: 'قبلی', exact: true }).click()
  assert.equal(await page.locator('.options-list button[aria-pressed=true]').count(), 1)
  await page.reload(); await page.locator('.sim-question h2').waitFor()
  assert.equal(await page.locator('.options-list button[aria-pressed=true]').count(), 1)
  assert.equal(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)).attempt.expiresAt, saved.key), expiresAt)
  const visibleTimer = await page.locator('.assessment-timer').innerText()
  const seconds = visibleTimer.trim().split(':').map(Number).reduce((sum, value, i) => sum + value * (i === 0 ? 60 : 1), 0)
  assert.ok(Math.abs(seconds - Math.floor((Date.parse(expiresAt) - Date.now()) / 1000)) <= 2)
  await shot(page, 'question-light-1440')
  await observe(page, 'active-assessment', 'light')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('.appearance-toggle').click()
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
  await shot(page, 'question-dark-390')
  await page.getByRole('button', { name: 'پاک‌کردن پاسخ', exact: true }).click()
  assert.equal(await page.locator('.options-list button[aria-pressed=true]').count(), 0)
  assert.equal(await page.locator('[aria-label="پاسخ‌های آزمون"]').getAttribute('aria-valuenow'), String(100 / saved.attempt.questions.length))
  // Preserve the existing null-entry progress semantics; do not change its calculation.
  for (let i = 0; i < saved.attempt.questions.length; i++) {
    const q = saved.attempt.questions[i]
    await page.locator('.options-list button').nth(bank.find(item => item.id === q.id).correctAnswer).click()
    if (i < saved.attempt.questions.length - 1) await page.getByRole('button', { name: 'بعدی', exact: true }).click()
  }
  let failSubmission = true, submissions = 0
  await page.route('**/attempts/*/submit', async route => {
    submissions++
    if (failSubmission) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'ثبت نتیجه انجام نشد؛ پاسخ‌هات حفظ شده‌اند.' }) })
    return route.continue()
  })
  await page.getByRole('button', { name: 'ثبت و دیدن نتیجه', exact: true }).click()
  await page.getByRole('alert').waitFor()
  assert.equal(submissions, 1)
  assert.equal(await page.locator('.options-list button[aria-pressed=true]').count(), 1)
  assert.ok(await page.evaluate(key => sessionStorage.getItem(key), saved.key))
  failSubmission = false
  await page.getByRole('button', { name: 'ثبت و دیدن نتیجه', exact: true }).click()
  await page.waitForURL('**/student/results/*'); await settle(page)
  const outcome = await request(`/attempts/${saved.attempt.id}`, learner.token)
  writeFileSync(`.preview-artifacts/phase5-${label}-fixture.json`, JSON.stringify({ learner, fresh, attemptId: saved.attempt.id }))
  assert.equal(outcome.result.percentage, 100)
  assert.equal(outcome.result.correct, saved.attempt.questions.length)
  assert.equal(await page.evaluate(key => sessionStorage.getItem(key), saved.key), null)
  assert.ok((await page.locator('.assessment-result-summary').innerText()).includes('100٪'))
  for (const value of [...outcome.analysis.priorityTopics, outcome.analysis.suggestedNextStep]) if (/\b[a-z]+:/.test(value)) mappings.push(value)
  await page.locator('.assessment-review summary').first().click()
  assert.ok((await page.locator('.assessment-review').first().innerText()).includes(`گزینه صحیح: ${key + 1}`))
  await page.locator('.appearance-toggle').first().click()
  await shot(page, 'result-detail-light-390')
  await observe(page, 'result-detail', 'light')
  checks.push('Real filtered diagnostic: keyboard selection without correctness; next/previous and heading focus; reload answer/deadline restoration; server timer; clear semantics; failed submission preserves answers; retry submits once; 100% server score/review and storage cleanup')
  await context.close()

  // Existing recent/comparable calculations remain authoritative: 0 then 100.
  await complete(false); const latest = await complete(true)
  for (const theme of ['light', 'dark']) {
    const { context, page } = await contextFor(learner.token, theme)
    await page.goto(root + '/student/results'); await settle(page)
    assert.equal(await page.locator('[data-result-attempt]').count(), 3)
    await page.getByLabel('فیلتر نتایج بر اساس درس').selectOption('physics')
    assert.equal(await page.locator('[data-result-attempt]').count(), 0)
    await page.getByLabel('فیلتر نتایج بر اساس درس').selectOption('math')
    const stats = await page.locator('[data-personal-stats] .stat-card strong').allTextContents()
    assert.deepEqual(stats, ['3', '100٪', `${Math.round(100 * (outcome.result.total + latest.result.total) / (outcome.result.total + latest.result.total * 2))}٪`, '+100'])
    await observe(page, 'history', theme)
    if (theme === 'dark') { await page.setViewportSize({ width: 1440, height: 1000 }); await shot(page, 'results-dark-1440') }
    await page.goto(root + '/student/analysis'); await settle(page)
    const mastery = await request('/me/mastery', learner.token)
    const course = page.locator('[data-analysis-course=math]')
    assert.equal(Number(await course.getByRole('progressbar').first().getAttribute('aria-valuenow')), mastery.courses.find(c => c.code === 'math').confirmedProgressPercentage)
    await course.locator('summary').first().click()
    assert.equal(await course.getByText('100٪ تسلط برآوردشده', { exact: true }).count(), 1)
    assert.equal(await page.locator('.analysis-page').getByText(/math:|topic-id|missing-topic/).count(), 0)
    await observe(page, 'analysis', theme)
    await page.setViewportSize({ width: theme === 'light' ? 1440 : 390, height: theme === 'light' ? 1000 : 844 })
    await shot(page, `analysis-${theme}-${theme === 'light' ? 1440 : 390}`)
    await page.goto(root + '/student/preparation'); await settle(page)
    assert.equal(await page.locator('[data-readiness-course]').count(), curriculum.courses.length)
    await page.locator('[data-readiness-course=math] summary').first().click()
    await observe(page, 'readiness', theme)
    if (theme === 'dark') { await page.setViewportSize({ width: 390, height: 844 }); await shot(page, 'readiness-dark-390') }
    await context.close()
  }
  checks.push('Connected history filters, comparable +100 change, correct recent accuracy; exact mastery/coverage values; topic/chapter disclosure and real study/assessment routes; both themes at five widths')

  {
    const { context, page } = await contextFor(fresh.token, 'dark', 390)
    await page.goto(root + '/student/results'); await settle(page)
    await page.getByText('هنوز نتیجه‌ای برای این انتخاب ثبت نشده', { exact: true }).waitFor()
    assert.equal(await page.locator('[data-result-attempt]').count(), 0)
    await page.goto(root + '/student/analysis'); await settle(page)
    await page.getByText('تحلیلت با اولین پاسخ‌ها شکل می‌گیره', { exact: true }).waitFor()
    assert.equal(await page.getByRole('heading', { name: /پیشرفت تأییدشده 0/ }).count(), 0)
    await page.goto(root + '/student/simulators'); await settle(page)
    assert.ok((await page.locator('.assessment-simulator').innerText()).includes('نیازمند اشتراک فعال'))
    assert.ok((await page.getByRole('link', { name: 'انتخاب اشتراک مطالعه' }).getAttribute('href')).endsWith('/package'))
    await page.goto(root + '/student/simulators/test'); await settle(page)
    await page.getByRole('button', { name: 'شروع آزمون', exact: true }).click()
    await page.getByRole('alert').waitFor()
    assert.equal(await page.locator('.sim-question').count(), 0)
    await context.close()
  }
  checks.push('First-time/account isolation, unassessed differs from zero, actual restricted simulator link and server denial retained')

  {
    const { context, page } = await contextFor(learner.token, 'light', 390)
    let fail = true
    await page.route('**/api/cent/v1/me/mastery', route => fail ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'دریافت وضعیت درس‌ها انجام نشد.' }) }) : route.continue())
    await page.goto(root + '/student/preparation'); await page.getByRole('alert').waitFor()
    assert.equal(await page.getByText('وضعیت سنجش در دسترس نیست', { exact: true }).count(), 5)
    fail = false
    await page.getByRole('button', { name: 'دوباره تلاش کن', exact: true }).click()
    await page.waitForFunction(() => !document.querySelector('[role=alert]') && !document.querySelector('.assessment-page').textContent.includes('در حال دریافت وضعیت…'))
    let release
    const gate = new Promise(resolve => { release = resolve })
    await page.route('**/api/cent/v1/attempts/', async route => { await gate; await route.continue() })
    await page.goto(root + '/student/results', { waitUntil: 'domcontentloaded' })
    await page.locator('.assessment-loading').waitFor()
    release(); await settle(page)
    await page.unroute('**/api/cent/v1/attempts/')
    await page.route(/\/api\/cent\/v1\/attempts\/[a-f0-9-]+$/, async route => {
      const response = await route.fetch()
      if (!response.headers()['content-type']?.includes('application/json')) return route.fulfill({ response })
      const data = await response.json()
      if (!data.analysis) return route.fulfill({ response, json: data })
      data.analysis.priorityTopics = ['math:missing-topic']
      data.analysis.suggestedNextStep = 'مرور math:missing-topic'
      data.analysis.personalizedExplanation = 'topic:missing-topic'
      data.analysis.strengths = ['math:missing-topic']
      data.analysis.weaknesses = ['math:missing-topic']
      data.analysis.status = 'FAILED'
      await route.fulfill({ response, json: data })
    })
    await page.goto(root + '/student/analysis'); await settle(page)
    assert.equal(await page.locator('.analysis-page').getByText(/math:missing-topic|topic:missing-topic/).count(), 0)
    await page.getByText('راهنمایی این نتیجه کامل نشده؛ پاسخ‌ها و نتیجه ثبت‌شده‌ات در دسترسه.', { exact: true }).waitFor()
    await context.close()
  }
  checks.push('Independent recoverable mastery error/retry, real delayed history skeleton, failed analysis and unresolved mappings without exposing technical IDs')

  {
    const { context, page } = await contextFor(learner.token, 'dark', 390)
    await page.goto(`${root}/student/practice?course=math&topic=${topic.id}`); await settle(page)
    await page.getByRole('button', { name: 'شروع آزمون', exact: true }).click()
    await page.locator('.sim-question').waitFor()
    // Assertion-only media/long-scientific-text fixture; never captured as actual learner content.
    await page.evaluate(() => {
      const key = Object.keys(sessionStorage).find(k => k.startsWith('cent:exam:') && k.includes(':practice:'))
      const saved = JSON.parse(sessionStorage.getItem(key))
      saved.attempt.questions[0].text = 'برای تابع f(x) = x² + 2x، مقدار 10⁻³ mol·L⁻¹ را بررسی کن. '.repeat(12)
      saved.attempt.questions[0].options[0] = 'x = (a + b) / c; 6.022 × 10²³ mol⁻¹ '.repeat(8)
      saved.attempt.questions[0].figureSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240"><rect width="900" height="240" fill="white"/><path d="M50 190H850M90 220V20M90 190Q400 150 820 30" fill="none" stroke="black" stroke-width="3"/></svg>'
      sessionStorage.setItem(key, JSON.stringify(saved))
    })
    await page.reload(); await page.locator('.cent-question-figure').waitFor()
    await observe(page, 'long-scientific-question-diagram', 'dark')
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'بعدی', exact: true }).scrollIntoViewIfNeeded()
    assert.ok(await page.locator('.assessment-timer').isVisible())
    const dimensions = await page.locator('.options-list button').evaluateAll(els => els.map(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })))
    assert.ok(dimensions.every(d => d.height >= 44 && d.width >= 44))
    await page.clock.install()
    await page.evaluate(() => {
      const key = Object.keys(sessionStorage).find(k => k.startsWith('cent:exam:') && k.includes(':practice:'))
      const saved = JSON.parse(sessionStorage.getItem(key)); saved.attempt.expiresAt = new Date(Date.now() + 60000).toISOString(); sessionStorage.setItem(key, JSON.stringify(saved))
    })
    await page.reload(); await page.locator('.sim-question').waitFor()
    await page.clock.fastForward(61000)
    await page.getByText('زمان آزمون پایان یافته است.', { exact: false }).waitFor({ timeout: 10000 })
    assert.ok(await page.locator('.options-list button').first().isDisabled())
    assert.equal(await page.locator('[aria-label="زمان باقی‌مانده"]').getAttribute('aria-live'), null)
    await page.getByRole('button', { name: 'آزمون تازه', exact: true }).click()
    await page.getByRole('button', { name: 'شروع آزمون', exact: true }).waitFor()
    assert.equal(await page.locator('.assessment-page').evaluate(el => getComputedStyle(el).animationName), 'none')
    await context.close()
  }
  checks.push('Long RTL/LTR scientific text/options and diagram at five widths, touch targets, visible sticky timer; deadline expiry disables selection and preserves actual restart; reduced motion')
  assert.deepEqual(errors, [])
  writeFileSync(evidence + `assessment-${label}-result.json`, JSON.stringify({ success: true, root, checks, observations, screenshots, unresolvedMappingCandidates: [...new Set(mappings)], browserErrors: errors }, null, 2))
  console.log(`Phase 5 assessment checks passed: ${checks.length} groups, ${observations.length} responsive observations, ${screenshots.length} AFTER images.`)
} finally { await browser.close() }
