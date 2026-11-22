/* global fetch, crypto, console, document, window, sessionStorage, localStorage, getComputedStyle */
import assert from 'node:assert/strict'
import process from 'node:process'
import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { api, root, artifact, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
const label = process.env.ITATEST_PHASE7_LABEL || 'development'
const capture = process.env.ITATEST_TEST_CAPTURE !== '0'
const checks = [], screenshots = [], errors = [], observations = []
async function request(path, token, method = 'GET', body) {
  const response = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  assert.ok(response.ok, `${method} ${path}: ${response.status}`)
  return response.status === 204 ? null : response.json()
}
const admin = await request('/auth/login', null, 'POST', { email: 'admin@cent.local', password: 'cent-local-preview-only' })
const register = name => request('/auth/register', null, 'POST', { email: `commerce-${crypto.randomUUID()}@example.test`, password: 'Commerce-preview-81!', name })
const learner = await register('بازبین خرید'), stranger = await register('حساب مستقل')
const curriculum = await request('/curriculum'), catalog = await request('/catalog')
// This host/database is isolated to this refinement run. Retire only previous fixture products.
for (const previous of catalog.products.filter(p => p.title.startsWith('درس‌نامه و تمرین ') || ['اشتراک سی‌روزه مطالعه', 'اشتراک نودروزه مطالعه'].includes(p.title))) {
  await request(`/admin/products/${previous.id}`, admin.token, 'PUT', { ...previous, active: false })
}
const products = [], plans = []
for (const course of curriculum.courses.slice(0, 3)) {
  const training = catalog.trainings.find(t => t.id === course.trainingId)
  await request(`/admin/trainings/${course.trainingId}`, admin.token, 'PUT', { title: course.title, description: training.description, includedInSubscription: true, published: true })
  const product = { id: crypto.randomUUID(), title: `درس‌نامه و تمرین ${course.title}`, kind: 'TRAINING', trainingId: course.trainingId, priceRial: 250001 + products.length * 100000, durationDays: null, active: true }
  await request(`/admin/products/${product.id}`, admin.token, 'PUT', product); products.push(product)
}
for (const days of [30, 90]) {
  const plan = { id: crypto.randomUUID(), title: days === 30 ? 'اشتراک سی‌روزه مطالعه' : 'اشتراک نودروزه مطالعه', kind: 'SUBSCRIPTION', trainingId: null, priceRial: days * 10000, durationDays: days, active: true }
  await request(`/admin/products/${plan.id}`, admin.token, 'PUT', plan); plans.push(plan)
}
const product = products[0], course = curriculum.courses.find(c => c.trainingId === product.trainingId), doc = curriculum.documents.find(d => d.trainingId === product.trainingId)
assert.ok(doc)
const denied = await fetch(api + `/documents/${doc.id}`, { headers: { Authorization: `Bearer ${learner.token}` } }); assert.equal(denied.status, 403)
const browser = await chromium.launch(browserOptions)
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  await context.addInitScript(() => { if (!localStorage.getItem('itatest:appearance:v1')) localStorage.setItem('itatest:appearance:v1', 'light') })
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message))
  let protectedPageRequests = 0
  page.on('request', request => { if (/\/documents\/[^/]+\/pages\//.test(request.url())) protectedPageRequests++ })
  async function ready(path, selector) { await page.goto(root + path); await page.locator(selector).first().waitFor(); await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready) }
  async function theme(value) { await page.evaluate(value => { localStorage.setItem('itatest:appearance:v1', value) }, value); await page.reload(); await page.waitForFunction(value => document.documentElement.dataset.theme === value, value); await page.evaluate(() => document.fonts.ready) }
  async function shot(name, anchor) { if (capture) { if (anchor) await page.locator(anchor).evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 88)); else await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: artifact(name), fullPage: false }); screenshots.push(name) } }
  await ready('/package', '.commerce-product'); assert.ok(await page.locator(`[data-product="${product.id}"]`).count())
  assert.equal(await page.locator('img[src*="/documents/"]').count(), 0)
  await shot('after-catalog-light-1440.png')
  await page.setViewportSize({ width: 390, height: 844 }); await theme('dark'); await ready(`/courses/${course.code}`, '.commerce-detail-hero')
  assert.ok((await page.locator('.commerce-summary').innerText()).includes('۲۵۰٬۰۰۱ ریال'))
  await shot('after-product-dark-390.png')
  await page.setViewportSize({ width: 1440, height: 1000 }); await ready('/package?kind=SUBSCRIPTION', '.commerce-plan'); await shot('after-subscriptions-dark-1440.png')
  assert.equal(await page.getByText('خرید دوره بعدی', { exact: true }).count(), 0)
  checks.push('Connected public catalog, exact rial price, existing course detail/curriculum navigation, real plan duration and benefits; covers never request protected content')

  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), learner.token)
  await page.setViewportSize({ width: 390, height: 844 }); await theme('light')
  await ready(`/checkout?product=${product.id}`, '.commerce-payment'); await shot('after-checkout-light-390.png')
  let released, requested
  const gate = new Promise(resolve => { released = resolve }), started = new Promise(resolve => { requested = resolve })
  let submissions = 0, checkoutResponse
  await page.route('**/api/cent/v1/checkout', async route => {
    submissions++; requested(); await gate
    const response = await route.fetch(); checkoutResponse = await response.json()
    assert.equal(checkoutResponse.status, 'PAID'); assert.equal(checkoutResponse.amountRial, product.priceRial)
    // Preview host has a fixed localhost:5173 return. Adapt only its loopback frontend origin for this harness.
    await route.fulfill({ response, json: { ...checkoutResponse, redirectUrl: root + '/checkout/success?order=' + checkoutResponse.id } })
  })
  await page.getByRole('button', { name: 'ادامه و پرداخت', exact: true }).click(); await started
  assert.equal(await page.locator('.commerce-payment button[aria-busy=true]').isDisabled(), true)
  await page.locator('.commerce-payment button[aria-busy=true]').dispatchEvent('click'); assert.equal(submissions, 1)
  released(); await page.waitForURL('**/checkout/success?order=*')
  await page.getByRole('heading', { name: 'پرداختت تأیید شد', exact: true }).waitFor().catch(async error => { console.log((await page.locator('main').innerText()).slice(0, 2500)); throw error })
  await page.unroute('**/api/cent/v1/checkout')
  const orders = await request('/me/orders', learner.token), paid = orders.find(o => o.id === checkoutResponse.id)
  assert.equal(paid.productId, product.id); assert.ok(paid.requestId); assert.equal(paid.trainingId, product.trainingId)
  const access = await request('/me/library', learner.token); assert.ok(access.readableTrainingIds.includes(product.trainingId))
  await page.setViewportSize({ width: 1440, height: 1000 }); await shot('after-payment-confirmed-light-1440.png')
  await page.getByRole('link', { name: /^مطالعه از کتابخانه/ }).click(); await page.locator('.reading-resource').first().waitFor()
  assert.ok((await page.locator('.reading-library').innerText()).includes(course.title))
  await request(`/documents/${doc.id}`, learner.token)
  await ready(`/courses/${course.code}`, '.commerce-summary'); await page.getByRole('link', { name: /^رفتن به کتابخانه/ }).waitFor()
  assert.equal(await page.getByRole('link', { name: /^ادامه خرید/ }).count(), 0)
  checks.push('Connected corrected mock checkout PAID/amountRial and owner recovery fields; one UI submission while busy; verified order+library before access; owned resource prioritizes library; actual protected document access')

  const requestId = crypto.randomUUID()
  const concurrent = await Promise.all([request('/checkout', learner.token, 'POST', { productId: plans[0].id, requestId }), request('/checkout', learner.token, 'POST', { productId: plans[0].id, requestId })])
  assert.equal(concurrent[0].id, concurrent[1].id); assert.equal(concurrent[0].status, 'PAID')
  let library = await request('/me/library', learner.token)
  assert.equal(library.entitlements.filter(e => e.orderId === concurrent[0].id).length, 1)
  const renewal = await request('/checkout', learner.token, 'POST', { productId: plans[1].id, requestId: crypto.randomUUID() })
  library = await request('/me/library', learner.token)
  const original = library.entitlements.find(e => e.orderId === concurrent[0].id), next = library.entitlements.find(e => e.orderId === renewal.id)
  assert.equal(Date.parse(next.startsAt), Date.parse(original.expiresAt)); assert.ok(library.hasSubscription)
  await ready('/student/profile', '.commerce-order'); await page.getByText('دوره بعدی', { exact: true }).waitFor()
  await page.setViewportSize({ width: 390, height: 844 }); await theme('dark'); await page.locator('.commerce-order').first().waitFor(); await shot('after-orders-dark-390.png', '.commerce-order-list')
  const foreign = await fetch(api + `/me/orders/${paid.id}/verify`, { method: 'POST', headers: { Authorization: `Bearer ${stranger.token}`, 'Content-Type': 'application/json' }, body: '{}' }); assert.equal(foreign.status, 404)
  const deniedSource = await fetch(api + `/documents/${doc.id}/source-sections`, { headers: { Authorization: `Bearer ${stranger.token}` } }); assert.equal(deniedSource.status, 403)
  checks.push('Connected SQLite mock concurrent same-key purchase: same order and exactly one entitlement; explicit stacked renewal uses next interval; owner history/current and upcoming subscription; foreign verify/source denial')

  writeFileSync(`.preview-artifacts/phase7-${label}-fixture.json`, JSON.stringify({ learner, stranger, products, plans, paid, course, doc }))
  // Fault-only presentation scenarios are labeled separately from connected payment success.
  const pending = { ...(await request('/me/orders', learner.token)).find(o => o.id === concurrent[0].id), status: 'PENDING', provider: 'SANDBOX', reference: null, paidAt: null }
  await page.route('**/me/orders', route => route.fulfill({ json: [pending] }))
  let verifies = 0
  await page.route('**/me/orders/*/verify', route => { verifies++; return route.fulfill({ json: { paid: false } }) })
  await theme('light'); await ready(`/checkout/success?order=${pending.id}&Status=OK&paid=true`, '.commerce-result-card')
  assert.equal(await page.getByRole('heading', { name: 'پرداختت تأیید شد', exact: true }).count(), 0)
  await page.getByRole('heading', { name: 'هنوز تأیید پرداخت نرسیده', exact: true }).waitFor()
  await page.locator('.commerce-recovery summary').click(); await shot('after-payment-recovery-light-390.png', '.commerce-recovery')
  const checksBefore = verifies; await page.getByRole('button', { name: 'بررسی دوباره', exact: true }).click(); await page.locator('.commerce-result-card').waitFor(); assert.ok(verifies > checksBefore)
  await page.locator('.commerce-recovery summary').click()
  await page.getByRole('link', { name: 'ادامه همین سفارش', exact: true }).click(); await page.locator('.commerce-payment').waitFor()
  let retryBody
  await page.route('**/api/cent/v1/checkout', async route => { retryBody = route.request().postDataJSON(); await route.fulfill({ status: 502, json: { code: 'gateway_invalid_response', message: 'sensitive-provider-body' } }) })
  await page.getByRole('button', { name: 'ادامه همین پرداخت', exact: true }).click(); await page.getByRole('alert').waitFor()
  assert.deepEqual(retryBody, { productId: pending.productId, requestId: pending.requestId })
  assert.ok(!(await page.locator('.commerce-payment').innerText()).includes('sensitive-provider-body'))
  await page.reload(); await page.locator('.commerce-payment').waitFor(); await page.getByRole('button', { name: 'ادامه همین پرداخت', exact: true }).click(); await page.getByRole('alert').waitFor()
  assert.equal(retryBody.requestId, pending.requestId)
  await page.unroute('**/api/cent/v1/checkout'); await page.unroute('**/me/orders'); await page.unroute('**/me/orders/*/verify')
  checks.push('Injected pending/callback spoof, paid:false verification and safe malformed gateway feedback; reload and explicit recovery send exact server product/request IDs without another purchase key')

  const expired = { ...library, hasSubscription: false, readableTrainingIds: [product.trainingId], entitlements: library.entitlements.map(e => e.kind === 'SUBSCRIPTION' ? { ...e, startsAt: '2025-01-01T00:00:00Z', expiresAt: '2025-02-01T00:00:00Z' } : e) }
  await page.route('**/me/library', route => route.fulfill({ json: expired })); await ready('/student/profile', '.commerce-subscription')
  await page.getByRole('heading', { name: 'اعتبار اشتراک قبلی پایان یافته', exact: true }).waitFor()
  assert.ok((await page.locator('.commerce-order-list').innerText()).includes('خرید تکی · دائمی'))
  await page.unroute('**/me/library')
  checks.push('Injected expired subscription presentation preserves independent permanent ownership; no invented renewal or access grant')

  for (const themeValue of ['light', 'dark']) {
    await theme(themeValue)
    for (const [path, selector] of [['/package', '.commerce-product'], [`/courses/${course.code}`, '.commerce-summary'], ['/package?kind=SUBSCRIPTION', '.commerce-plan'], [`/checkout?product=${plans[0].id}`, '.commerce-payment'], [`/checkout/success?order=${paid.id}`, '.commerce-result-card'], ['/student/profile', '.commerce-order']]) {
      await ready(path, selector)
      for (const viewport of [{ width: 320, height: 844 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }, { width: 1440, height: 1000 }]) {
        await page.setViewportSize(viewport)
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${themeValue}/${path}/${viewport.width}: overflow`)
        const targets = await page.locator('.commerce-page .button,.commerce-account .button,.commerce-page .ui-filter-group button').evaluateAll(els => els.filter(el => el.getBoundingClientRect().width && !el.disabled).map(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height, text: el.textContent.trim().slice(0, 40) })))
        for (const target of targets) assert.ok(target.width >= 44 && target.height >= 44, JSON.stringify(target))
        observations.push({ theme: themeValue, path, ...viewport, targets: targets.length, overflow: false })
      }
      assert.equal(await page.locator('html').getAttribute('dir'), 'rtl')
      const first = page.locator('.commerce-page .button,.commerce-account .button').first()
      assert.ok(await first.count(), `${themeValue}/${path}: ${await page.locator('body').innerText()}`)
      await first.focus()
      const outline = await first.evaluate(el => ({ active: el === document.activeElement, width: getComputedStyle(el).outlineWidth, style: getComputedStyle(el).outlineStyle }))
      assert.ok(outline.active && parseFloat(outline.width) >= 2 && outline.style !== 'none')
      assert.equal(await first.evaluate(el => getComputedStyle(el).transitionDuration), '0s')
    }
  }
  checks.push('Twelve real commerce route/theme compositions: 60 viewport observations (320–1440px, tablet and landscape), RTL, enabled 44px targets, visible keyboard focus and reduced-motion feedback')
  assert.equal(protectedPageRequests, 0)
  assert.deepEqual(errors, [])
  writeFileSync(`.preview-artifacts/phase7-${label}-fixture.json`, JSON.stringify({ learner, stranger, products, plans, paid, course, doc }))
  writeFileSync(artifact(`commerce-${label}-result.json`), JSON.stringify({ success: true, backend: api, checks, observations, screenshots, errors, connected: 'Fresh corrected Phase 7A source built into isolated workspace output, Development SQLite mock only', injected: ['PENDING history/paid:false', 'gateway_invalid_response', 'expired subscription'], previewReturnOriginAdapted: true }, null, 2))
  console.log(JSON.stringify({ success: true, checks: checks.length, observations: observations.length, screenshots: screenshots.length }))
} finally { await browser.close() }
