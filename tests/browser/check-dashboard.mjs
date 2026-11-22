/* global document, getComputedStyle, innerWidth, sessionStorage, localStorage, console, URL, setTimeout, process, fetch, crypto */
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { api, root, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
const evidence = process.env.ITATEST_DASHBOARD_EVIDENCE || 'docs/refinement/evidence/phase-4/'
mkdirSync(evidence, { recursive: true })
const capture = process.env.ITATEST_PHASE4_CAPTURE !== '0'
const label = process.env.ITATEST_PHASE4_LABEL || 'development'
const checks = [], observations = [], screenshots = []
async function request(path, token, method = 'GET', body) {
  const response = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  assert.ok(response.ok, `${path}: ${response.status}`)
  return response.status === 204 ? null : response.json()
}
const fixtureFile = '.preview-artifacts/phase4-fixture.json'
let fixture
if (existsSync(fixtureFile)) fixture = JSON.parse(readFileSync(fixtureFile, 'utf8'))
else {
  const returning = await request('/auth/register', null, 'POST', { email: `phase4-return-${Date.now()}@test.local`, password: 'phase4-local-only', name: 'سارا احمدی' })
  const fresh = await request('/auth/register', null, 'POST', { email: `phase4-new-${Date.now()}@test.local`, password: 'phase4-local-only', name: 'نگار محمدی' })
  const curriculum = await request('/curriculum')
  const course = curriculum.courses.find(course => course.code === 'math')
  const catalog = await request('/catalog')
  const product = catalog.products.find(product => product.kind === 'TRAINING' && product.trainingId === course.trainingId && product.active)
  assert.ok(product, 'Existing local preview math product required; never create production fixtures')
  const order = await request('/checkout', returning.token, 'POST', { productId: product.id, requestId: crypto.randomUUID() })
  assert.equal((await request(`/me/orders/${order.id}/verify`, returning.token, 'POST', {})).paid, true)
  const library = await request('/me/library', returning.token)
  const document = library.documents.find(document => document.trainingId === course.trainingId && document.pageCount > 2)
  assert.ok(document)
  await request(`/documents/${document.id}/progress`, returning.token, 'PUT', { page: 2 })
  const topic = curriculum.topics.find(topic => topic.courseCode === 'math' && topic.title === 'عبارت‌های جبری')
  const attempt = await request('/attempts/', returning.token, 'POST', { kind: 'practice', requestId: crypto.randomUUID(), course: 'math', topicId: topic.id })
  const outcome = await request(`/attempts/${attempt.id}/submit`, returning.token, 'POST', { answers: Object.fromEntries(attempt.questions.map(question => [question.id, 0])) })
  fixture = { returning, fresh, document, attemptId: attempt.id, outcome }
  writeFileSync(fixtureFile, JSON.stringify(fixture))
}
const browser = await chromium.launch(browserOptions)
const browserErrors = []
async function contextFor(token, theme = 'light', width = 1440) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce' })
  await context.addInitScript(({ token, theme }) => { sessionStorage.setItem('cent:session:v1', token); localStorage.setItem('itatest:appearance:v1', theme) }, { token, theme })
  const page = await context.newPage()
  page.on('pageerror', error => browserErrors.push(error.message))
  return { context, page }
}
async function settle(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  if (new URL(page.url()).pathname.endsWith('/student')) {
    await page.locator('.student-overview').waitFor()
    await page.waitForFunction(() => !document.querySelector('.student-overview .cent-loading,.student-overview .ui-skeleton'))
  }
}
async function shot(page, name) {
  if (!capture) return
  await page.screenshot({ path: `${evidence}after-${name}.png`, fullPage: true })
  screenshots.push({ path: `after-${name}.png`, state: name })
}
async function noOverflow(page, state, width, theme) {
  const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }))
  assert.ok(dimensions.scroll <= dimensions.width + 1, `${state}/${width}/${theme}: ${JSON.stringify(dimensions)}`)
  observations.push({ state, width, theme, ...dimensions })
}
try {
  for (const theme of ['light', 'dark']) {
    const { context, page } = await contextFor(fixture.returning.token, theme)
    await page.goto(root + '/student'); await settle(page)
    const mastery = await request('/me/mastery', fixture.returning.token)
    assert.equal(await page.locator('[data-dashboard-resume] h3').innerText(), fixture.document.title)
    assert.ok((await page.locator('[data-dashboard-resume]').innerText()).includes('صفحه 2'))
    assert.equal(await page.locator('[data-dashboard-assessment] .student-score').innerText(), `${fixture.outcome.result.percentage}٪`)
    const progress = page.locator('[data-dashboard-progress] [role=progressbar]')
    assert.equal(await progress.count(), mastery.courses.length)
    for (let i = 0; i < mastery.courses.length; i++) {
      assert.equal(Number(await progress.nth(i).getAttribute('aria-valuenow')), mastery.courses[i].confirmedProgressPercentage)
      assert.ok(await progress.nth(i).getAttribute('aria-label'))
      assert.ok(await progress.nth(i).getAttribute('aria-valuetext'))
    }
    assert.equal(await page.locator('[data-dashboard-recommendation]').getByText(/math:/).count(), 0)
    assert.equal(await page.locator('[data-dashboard-recommendation] .student-priority-list a').count(), fixture.outcome.analysis.priorityTopics.length)
    assert.ok((await page.locator('.student-recent').innerText()).includes(fixture.document.title))
    assert.equal(await page.locator('.side-nav [aria-current=page]').getAttribute('href'), new URL(root).pathname.replace(/\/$/, '') + '/student')
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: width < 820 ? 844 : 1000 }); await noOverflow(page, 'returning-connected', width, theme)
      if ([1440,390].includes(width)) await shot(page, `dashboard-connected-${theme}-${width}`)
    }
    await page.setViewportSize({ width: 390, height: 844 })
    const open = page.getByRole('button', { name: 'نمایش منو', exact: true })
    await open.focus(); await page.keyboard.press('Enter')
    assert.equal(await open.getAttribute('aria-expanded'), 'true')
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'بستن منو')
    assert.equal(await page.getByRole('button', { name: 'بستن منو', exact: true }).evaluate(element => element === document.activeElement), true)
    if (theme === 'dark') await shot(page, `navigation-${theme}-390`)
    await page.keyboard.press('Escape')
    assert.equal(await open.evaluate(element => element === document.activeElement), true)
    assert.equal(await page.locator('.sidebar').evaluate(element => getComputedStyle(element).visibility), 'hidden')
    await page.locator('.appearance-toggle').click()
    const opposite = theme === 'light' ? 'dark' : 'light'
    assert.equal(await page.locator('html').getAttribute('data-theme'), opposite)
    assert.equal(await page.evaluate(() => localStorage.getItem('itatest:appearance:v1')), opposite)
    // addInitScript intentionally seeds each navigation, so persistence across reload
    // is covered by the unchanged appearance suite, not this fixture setup.
    await page.locator('.student-account-access').click(); await settle(page)
    await page.getByRole('heading', { name: 'حساب کاربری من', exact: true }).waitFor()
    assert.equal(await page.locator('.student-account-profile dd').last().innerText(), fixture.returning.user.email)
    await noOverflow(page, 'account-connected', 390, opposite)
    if (opposite === 'dark') await shot(page, `account-connected-${opposite}-390`)
    await page.setViewportSize({ width: 1440, height: 1000 })
    await noOverflow(page, 'account-connected', 1440, opposite)
    if (opposite === 'light') await shot(page, `account-connected-${opposite}-1440`)
    await context.close()
    checks.push(`connected returning dashboard, server percentages, mapped priorities, resume, navigation and account (${theme})`)
  }

  // Confirm the exact existing resume route reaches the saved page. No reader edit.
  {
    const { context, page } = await contextFor(fixture.returning.token)
    await page.goto(root + '/student'); await settle(page)
    await page.locator('[data-dashboard-resume]').getByRole('link', { name: 'ادامه مطالعه', exact: true }).click()
    await page.getByLabel('انتخاب صفحه').waitFor()
    await page.waitForFunction(() => document.querySelector('[aria-label="انتخاب صفحه"]')?.value === '2')
    await context.close(); checks.push('connected dashboard resume restores the API-saved page through the unchanged reader')
  }
  for (const theme of ['light','dark']) {
    const { context, page } = await contextFor(fixture.fresh.token, theme, 390)
    await page.goto(root + '/student'); await settle(page)
    await page.getByRole('heading', { name: 'از شناخت مسیرت شروع کن', exact: true }).waitFor()
    assert.equal(await page.locator('.student-score').count(), 0)
    assert.equal(await page.locator('[data-dashboard-progress] [aria-valuetext="هنوز سنجیده نشده"]').count(), 5)
    assert.equal(await page.locator('[data-dashboard-recommendation] .student-priority-list a').count(), 0)
    await noOverflow(page, 'new-student-connected', 390, theme)
    if (theme === 'dark') await shot(page, 'dashboard-new-connected-dark-390')
    await page.setViewportSize({ width:1440,height:1000 }); await noOverflow(page,'new-student-connected',1440,theme)
    if (theme === 'light') await shot(page, 'dashboard-new-connected-light-1440')
    await context.close(); checks.push(`connected new student without result, study history or fabricated progress (${theme})`)
  }

  // Injected network states use the connected session. They are not server outcomes.
  const sourceLibrary = await request('/me/library', fixture.returning.token)
  for (const state of ['loading','recovery','unmapped','curriculum-unavailable','assessment-unavailable','mastery-unavailable','guidance-incomplete','library-without-history']) {
    const { context, page } = await contextFor(fixture.returning.token, state === 'recovery' ? 'dark' : 'light', 390)
    let fail = state === 'recovery'
    if (state === 'loading') await context.route('**/api/cent/v1/me/mastery', async route => { await new Promise(resolve => setTimeout(resolve, 1800)); await route.continue() })
    if (state === 'recovery') await context.route('**/api/cent/v1/me/library', route => fail ? route.fulfill({ status: 500, contentType:'application/json', body:JSON.stringify({ message:'نتونستیم منابع رو دریافت کنیم. دوباره تلاش کن.' }) }) : route.continue())
    if (state === 'curriculum-unavailable') await context.route('**/api/cent/v1/curriculum', route => route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({message:'فهرست مباحث فعلاً در دسترس نیست.'})}))
    if (state === 'assessment-unavailable') await context.route('**/api/cent/v1/attempts/', route => route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({message:'دریافت نتیجه فعلاً ممکن نیست.'})}))
    if (state === 'mastery-unavailable') await context.route('**/api/cent/v1/me/mastery', route => route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({message:'دریافت پیشرفت فعلاً ممکن نیست.'})}))
    if (state === 'library-without-history') await context.route('**/api/cent/v1/me/library', route => route.fulfill({json:{...sourceLibrary,progress:[]}}))
    if (state === 'guidance-incomplete') await context.route(`**/api/cent/v1/attempts/${fixture.attemptId}`, route => route.fulfill({json:{...fixture.outcome,analysis:{...fixture.outcome.analysis,status:'FAILED',suggestedNextStep:''}}}))
    if (state === 'unmapped') await context.route(`**/api/cent/v1/attempts/${fixture.attemptId}`, async route => {
      const body={...fixture.outcome,analysis:{...fixture.outcome.analysis,priorityTopics:[...fixture.outcome.analysis.priorityTopics,'math:unknown-topic'],suggestedNextStep:fixture.outcome.analysis.suggestedNextStep+' math:unknown-topic'}}
      await route.fulfill({json:body})
    })
    await page.goto(root + '/student')
    if (state === 'loading') { await page.locator('[data-dashboard-progress] [role=status]').waitFor(); await shot(page, 'dashboard-loading-injected-light-390'); await settle(page) }
    else {
      await settle(page)
      if (state === 'recovery') {
        await page.locator('[data-dashboard-resume] [role=alert]').waitFor()
        assert.equal(await page.locator('[data-dashboard-resume] .empty-state').count(),0)
        await shot(page,'dashboard-recovery-injected-dark-390')
        fail=false
        await page.locator('[data-dashboard-resume]').getByRole('button',{name:'دوباره تلاش کن',exact:true}).click()
        await page.locator('[data-dashboard-resume] h3').waitFor()
      } else if (['unmapped','curriculum-unavailable'].includes(state)) {
        assert.equal(await page.locator('.student-mapping-note details').getAttribute('open'),null)
        assert.ok((await page.locator('.student-mapping-note').innerText()).includes('نام بعضی مباحث'))
        await page.locator('.student-mapping-note summary').click()
        assert.ok((await page.locator('.student-mapping-note').innerText()).includes(state==='unmapped'?'math:unknown-topic':'math:'))
        await shot(page,`dashboard-${state}-injected-light-390`)
        if(state==='unmapped') assert.equal(await page.locator('.student-priority-list a').count(),fixture.outcome.analysis.priorityTopics.length)
      } else if (state === 'assessment-unavailable') {
        await page.locator('[data-dashboard-assessment] [role=alert]').waitFor()
        assert.equal(await page.locator('[data-dashboard-assessment] [role=alert]').count(),1)
        assert.equal(await page.locator('.student-first-assessment').count(),0)
        await page.locator('[data-dashboard-resume] h3').waitFor()
        assert.ok((await page.locator('[data-dashboard-recommendation]').innerText()).includes('دوباره بارگذاری'))
      } else if (state === 'mastery-unavailable') {
        await page.locator('[data-dashboard-progress] [role=alert]').waitFor()
        assert.equal(await page.locator('[data-dashboard-progress] [role=alert]').count(),1)
        assert.equal(await page.locator('[data-dashboard-progress] [role=progressbar]').count(),0)
        assert.equal(await page.locator('.student-score').count(),1)
      } else if (state === 'guidance-incomplete') {
        await page.locator('[data-dashboard-recommendation] .ui-notice-warning').waitFor()
        assert.ok((await page.locator('[data-dashboard-recommendation] .ui-notice-warning').innerText()).includes('کامل نشده'))
        assert.ok((await page.locator('[data-dashboard-recommendation]').innerText()).includes('پیشنهاد متنی در دسترس نیست'))
      } else if (state === 'library-without-history') {
        assert.equal(await page.locator('[data-dashboard-resume]').getByRole('link',{name:'رفتن به کتابخانه',exact:true}).count(),1)
        assert.equal(await page.locator('[data-dashboard-resume]').getByRole('link',{name:'دیدن آموزش‌ها',exact:true}).count(),0)
      }
    }
    await noOverflow(page,state+'-injected',390,state==='recovery'?'dark':'light')
    await context.close(); checks.push(`${state}: injected and explicitly labeled; unaffected sections remain usable`)
  }
  assert.deepEqual(browserErrors, [])
  writeFileSync(`${evidence}dashboard-${label}-result.json`, JSON.stringify({ success:true,root,checks,observations,screenshots,browserErrors,fixture:'Isolated local preview students; saved study page, mock-paid existing resource and submitted practice attempt. Network failures/loading/mapping states explicitly injected.',recommendationCodes:fixture.outcome.analysis.priorityTopics,verifiedResumePage:2 },null,2))
  console.log(`Dashboard checks passed (${checks.length} groups, ${observations.length} responsive observations, ${screenshots.length} AFTER screenshots).`)
} finally { await browser.close() }
