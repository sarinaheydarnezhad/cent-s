/* global document, getComputedStyle, sessionStorage, localStorage, innerWidth, console, process, setTimeout, fetch */
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { root, api, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
const evidence = 'docs/refinement/evidence/phase-4-1/'
mkdirSync(evidence, { recursive: true })
const fixture = JSON.parse(readFileSync('.preview-artifacts/phase4-fixture.json', 'utf8'))
const browser = await chromium.launch(browserOptions)
const observations = [], screenshots = [], checks = [], errors = []
const capture = process.env.ITATEST_PHASE41_CAPTURE !== '0'
async function open(token, theme, width, reducedMotion = 'reduce') {
  const context = await browser.newContext({ viewport: { width, height: width < 820 ? 844 : 900 }, colorScheme: theme, reducedMotion })
  await context.addInitScript(({ token, theme }) => { sessionStorage.setItem('cent:session:v1', token); localStorage.setItem('itatest:appearance:v1', theme) }, { token, theme })
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  return { context, page }
}
async function settle(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => !document.querySelector('.student-overview .ui-skeleton'))
}
async function shot(page, name, classification) {
  if (!capture) return
  const path = `after-${name}.png`
  await page.screenshot({ path: evidence + path, fullPage: true })
  screenshots.push({ path, classification })
}
try {
  const response = await fetch(api + '/me/library', { headers: { Authorization: `Bearer ${fixture.returning.token}` } })
  assert.ok(response.ok)
  const library = await response.json()
  const progress = library.progress.find(value => value.documentId === fixture.document.id)
  for (const theme of ['light', 'dark']) {
    const { context, page } = await open(fixture.returning.token, theme, 1440)
    await page.goto(root + '/student'); await settle(page)
    const hero = await page.locator('.student-welcome').innerText()
    assert.ok(hero.includes(fixture.returning.user.name.split(' ')[0]))
    assert.ok(hero.includes('CEnT-S') && hero.includes('سردرگم نمون، هدفمند بخون.'))
    assert.ok((await page.locator('[data-dashboard-resume]').innerText()).includes('از همان‌جایی که مانده بودی، ادامه بده'))
    const meter = page.locator('#student-reading-meter')
    assert.equal(Number(await meter.getAttribute('value')), progress.furthestPage)
    assert.equal(Number(await meter.getAttribute('max')), fixture.document.pageCount)
    assert.ok((await meter.getAttribute('aria-valuetext')).includes('نشان‌دهنده تسلط نیست'))
    assert.equal(await page.locator('.student-subject-label').innerText(), 'ریاضی')
    assert.equal(await page.locator('.student-book-cover').count(), 1 + Math.min(3, library.documents.length))
    assert.equal(await page.locator('.student-subject-icon svg').count(), 5)
    const glyphs = await page.locator('.student-subject-icon svg').evaluateAll(elements => elements.map(element => element.innerHTML))
    assert.equal(new Set(glyphs).size, 5)
    const times = await page.locator('.student-recent time').evaluateAll(elements => elements.map(element => element.dateTime))
    assert.deepEqual(times, [...times].sort().reverse())
    assert.equal(await page.locator('.student-recent li').count(), 2)
    const toggle = page.locator('.appearance-toggle')
    const icon = await toggle.locator('svg').boundingBox()
    assert.ok(icon.width >= 18 && icon.width <= 20)
    assert.equal(await toggle.evaluate(element => getComputedStyle(element).borderTopWidth), '0px')
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: width < 820 ? 844 : 900 })
      const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }))
      assert.ok(layout.scroll <= width + 1)
      const heroRect = await page.locator('.student-welcome').boundingBox()
      assert.ok(heroRect.height <= 200)
      const action = await page.locator('[data-dashboard-recommendation] > .button').boundingBox()
      assert.ok(action.y + action.height < 844, 'recommendation action visible without scrolling')
      const order = await page.locator('.student-overview > *').evaluateAll(elements => elements.map(element => ({ name: element.className, y: element.getBoundingClientRect().y })))
      for (let i = 1; i < order.length; i++) if (width <= 620) assert.ok(order[i].y >= order[i - 1].y, 'mobile reading and DOM order agree')
      if (width >= 1024) {
        const nav = await page.locator('.side-nav a').last().boundingBox()
        assert.ok(nav.y + nav.height < 768, 'all desktop primary items fit a 768px viewport')
      }
      observations.push({ theme, ...layout, heroHeight: heroRect.height, recommendationActionBottom: action.y + action.height })
      if ([1440, 390].includes(width)) await shot(page, `returning-${theme}-${width}`, 'Connected isolated DEVELOPMENT_MOCK preview: real saved study and submitted practice responses.')
    }
    for (const selector of ['.student-welcome', '.student-recommendation', '.student-assessment', '.student-resume']) {
      await page.locator(selector).hover()
      assert.equal(await page.locator(selector).evaluate(element => getComputedStyle(element).transform), 'none', 'non-interactive cards stay still')
    }
    assert.equal(await page.locator('.progress-value').first().evaluate(element => getComputedStyle(element).animationName), 'none')
    await page.setViewportSize({ width: 1024, height: 420 })
    const scrolling = await page.locator('.side-nav').evaluate(element => ({ client: element.clientHeight, scroll: element.scrollHeight, overflow: getComputedStyle(element).overflowY }))
    assert.ok(scrolling.scroll > scrolling.client && scrolling.overflow === 'auto')
    await page.locator('.side-nav a').last().scrollIntoViewIfNeeded()
    await context.close()
    checks.push(`${theme}: exact saved page meter, real score, subject metadata/icons, fallbacks, date-ordered existing activity, responsive order/density, short sidebar scrolling and reduced motion`)
  }
  {
    const { context, page } = await open(fixture.fresh.token, 'light', 390)
    await page.goto(root + '/student'); await settle(page)
    assert.equal(await page.locator('.student-is-new').count(), 1)
    assert.equal(await page.locator('.student-recent').count(), 0)
    assert.equal(await page.locator('.student-score-ring,meter').count(), 0)
    assert.equal(await page.locator('.student-recommendation > .button').count(), 1)
    assert.equal(await page.locator('.student-course.unassessed').count(), 5)
    await shot(page, 'new-light-390', 'Connected separate local learner with no assessment or reading history.')
    await context.close(); checks.push('New learner: single prominent diagnostic action, compact contextual summaries, no fabricated activity/ring/reading progress')
  }
  {
    const { context, page } = await open(fixture.returning.token, 'dark', 390)
    await context.route('**/api/cent/v1/me/mastery', async route => { await new Promise(resolve => setTimeout(resolve, 1600)); await route.continue() })
    let fail = true
    await context.route('**/api/cent/v1/me/library', route => fail ? route.fulfill({ status: 503, json: { message: 'نتونستیم منابع رو دریافت کنیم. دوباره تلاش کن.' } }) : route.continue())
    await page.goto(root + '/student')
    await page.locator('[data-dashboard-progress] .ui-skeleton[role=status]').waitFor()
    await settle(page)
    await page.locator('[data-dashboard-resume] [role=alert]').waitFor()
    assert.equal(await page.locator('[data-dashboard-resume] .empty-state').count(), 0)
    await shot(page, 'recovery-dark-390', 'Injected library 503 on a connected local learner; persistent error and real retry.')
    fail = false
    await page.locator('[data-dashboard-resume]').getByRole('button', { name: 'دوباره تلاش کن' }).click()
    await page.locator('#student-reading-meter').waitFor()
    await context.close(); checks.push('Skeleton status, persistent recoverable 503, no false empty state, existing retry restores saved reading position')
  }
  {
    const { context, page } = await open(fixture.returning.token, 'light', 1440, 'no-preference')
    await page.goto(root + '/student'); await settle(page)
    assert.equal(await page.locator('.appearance-toggle svg').evaluate(element => getComputedStyle(element).animationDuration), '0.18s')
    assert.equal(await page.locator('.student-recommendation > .button').evaluate(element => getComputedStyle(element).transitionDuration.split(',')[0].trim()), '0.18s')
    await page.locator('.student-recommendation > .button').hover()
    await page.waitForTimeout(220)
    assert.notEqual(await page.locator('.student-recommendation > .button > svg').evaluate(element => getComputedStyle(element).transform), 'none')
    const old = await page.locator('html').getAttribute('data-theme')
    await page.locator('.appearance-toggle').click()
    assert.notEqual(await page.locator('html').getAttribute('data-theme'), old)
    await context.close(); checks.push('180ms ordinary motion, directional feedback and single-click theme retained; no continuous animation')
  }
  assert.deepEqual(errors, [])
  writeFileSync(evidence + 'refinement-result.json', JSON.stringify({ success: true, root, checks, observations, screenshots, errors, limits: 'Local Chromium and isolated preview APIs; not production data, full WCAG, assistive-technology or cross-browser acceptance.' }, null, 2))
  console.log(`Phase 4.1 refinement passed (${checks.length} groups, ${observations.length} responsive observations, ${screenshots.length} AFTER images).`)
} finally { await browser.close() }
