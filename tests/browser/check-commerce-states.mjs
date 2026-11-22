/* global fetch, crypto, console, document, sessionStorage, Storage */
import assert from 'node:assert/strict'
import process from 'node:process'
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { root, api, artifact, browserOptions, requireLocalPreview } from './environment.mjs'
await requireLocalPreview()
const label = process.env.ITATEST_PHASE7_LABEL || 'development'
const fixture = JSON.parse(readFileSync(`.preview-artifacts/phase7-${label}-fixture.json`, 'utf8'))
const browser = await chromium.launch(browserOptions)
const checks = [], errors = []
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await context.addInitScript(token => { if (!sessionStorage.getItem('cent:session:v1')) sessionStorage.setItem('cent:session:v1', token) }, fixture.learner.token)
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message))
  const plan = fixture.plans[1]
  async function checkout() { await page.goto(root + `/checkout?product=${plan.id}`); await page.waitForLoadState('networkidle'); await page.locator('.commerce-payment').waitFor() }
  // No confirmed result is synthesized into access. HTTP failures and pending history are presentation fixtures.
  let requests = [], payload = { code: 'temporarily_unavailable', message: 'internal secret' }, status = 503
  await page.route('**/api/cent/v1/checkout', async route => { requests.push(route.request().postDataJSON()); await route.fulfill({ status, headers: status === 429 ? { 'Retry-After': '2' } : {}, json: payload }) })
  await checkout(); await page.getByRole('button', { name: 'ادامه و پرداخت', exact: true }).click(); await page.getByRole('alert').waitFor()
  const original = requests[0]; assert.deepEqual(Object.keys(original).sort(), ['productId', 'requestId'])
  await page.reload(); await page.locator('.commerce-payment').waitFor(); await page.getByRole('button', { name: 'ادامه و پرداخت', exact: true }).click(); await page.getByRole('alert').waitFor(); assert.deepEqual(requests[1], original)
  assert.ok(!(await page.locator('body').innerText()).includes('internal secret'))
  checks.push('Injected lost/unavailable initiation retains the account/product UUID across reload and sends identifiers only; no provider/internal detail exposed')
  status = 429; payload = { message: 'rate limit' }
  await checkout(); await page.getByRole('button', { name: 'ادامه و پرداخت', exact: true }).click(); await page.getByRole('alert').waitFor()
  const disabled = page.getByRole('button', { name: 'کمی بعد دوباره تلاش کن', exact: true }); await disabled.waitFor(); assert.equal(await disabled.isDisabled(), true)
  // Wait for the actual server-advertised cooldown state to clear, not an arbitrary delay.
  await page.getByRole('button', { name: 'ادامه و پرداخت', exact: true }).waitFor()
  for (const code of ['payments_not_configured', 'mock_payment_disabled', 'invalid_payment_provider', 'already_owned']) {
    status = code === 'already_owned' ? 409 : 503; payload = { code, message: 'secret provider response' }
    await checkout(); await page.getByRole('button', { name: 'ادامه و پرداخت', exact: true }).click(); await page.getByRole('alert').waitFor()
    await page.waitForLoadState('networkidle'); assert.equal(await page.getByRole('button', { name: 'ادامه و پرداخت', exact: true }).isDisabled(), true)
  }
  await page.unroute('**/api/cent/v1/checkout')
  checks.push('Injected 429 respects Retry-After; configuration/stored-provider/already-owned errors block new initiation while retaining order-history recovery')

  const pending = { ...fixture.paid, id: crypto.randomUUID(), productId: plan.id, kind: 'SUBSCRIPTION', requestId: crypto.randomUUID(), trainingId: null, status: 'PENDING', provider: 'SANDBOX', amountRial: 123457, reference: null }
  await page.route('**/me/orders', route => route.fulfill({ json: [pending] }))
  await page.route('**/me/orders/*/verify', route => route.fulfill({ status: 502, json: { code: 'gateway_invalid_response', message: 'secret card/provider data' } }))
  await page.goto(root + `/checkout/success?order=${pending.id}&paid=true&Status=OK`); await page.locator('.commerce-result-card').waitFor()
  await page.getByRole('heading', { name: 'هنوز تأیید پرداخت نرسیده', exact: true }).waitFor()
  assert.ok(!(await page.locator('body').innerText()).includes('secret card'))
  await page.unroute('**/me/orders/*/verify')
  await page.route('**/me/orders/*/verify', route => route.fulfill({ status: 429, headers: { 'Retry-After': '2' }, json: { message: 'rate limit' } }))
  await page.getByRole('button', { name: 'بررسی دوباره', exact: true }).click()
  await page.locator('.commerce-result-card').waitFor()
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === 'بررسی دوباره' && button.disabled))
  await page.getByRole('button', { name: 'بررسی دوباره', exact: true }).waitFor({ state: 'visible' })
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === 'بررسی دوباره' && !button.disabled))
  await page.unroute('**/me/orders')
  await page.route('**/me/orders', route => route.fulfill({ status: 429, headers: { 'Retry-After': '2' }, json: { message: 'rate limit' } }))
  await page.getByRole('button', { name: 'بررسی دوباره', exact: true }).click()
  const retry = page.getByRole('button', { name: 'دوباره تلاش کن', exact: true })
  await retry.waitFor()
  assert.equal(await retry.isDisabled(), true)
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === 'دوباره تلاش کن' && !button.disabled))
  checks.push('Injected result verification/history 429 disables the visible retry action for the server-advertised cooldown')
  await page.unroute('**/me/orders')
  await page.route('**/me/orders', route => route.fulfill({ json: [pending] }))
  await retry.click()
  await page.locator('.commerce-result-card').waitFor()
  await page.locator('.commerce-recovery summary').click()
  await page.getByRole('link', { name: 'ادامه همین سفارش', exact: true }).click(); await page.locator('.commerce-payment').waitFor()
  assert.ok((await page.locator('.commerce-summary').innerText()).includes('۱۲۳٬۴۵۷ ریال'))
  assert.ok((await page.locator('.commerce-payment').innerText()).includes('زرین‌پال · محیط آزمایشی'))
  assert.ok(!(await page.locator('.commerce-payment').innerText()).includes('این محیط آزمایشی است'))
  checks.push('Injected pending verification never trusts redirect flags; recovery displays saved amount and stored SANDBOX provider despite current MOCK environment')
  await page.unroute('**/me/orders'); await page.unroute('**/me/orders/*/verify')

  // A response can be lost after real mock completion. A reload must find PAID and prevent duplicate renewal.
  const fresh = await fetch(api + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `lost-${crypto.randomUUID()}@example.test`, password: 'Commerce-preview-81!', name: 'بازیابی خرید' }) }).then(r => r.json())
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), fresh.token)
  let completed, completedRequest
  await page.route('**/api/cent/v1/checkout', async route => { completedRequest = route.request().postDataJSON(); const response = await route.fetch(); completed = await response.json(); await route.abort('failed') })
  await checkout(); await page.getByRole('button', { name: 'ادامه و پرداخت', exact: true }).click(); await page.getByRole('alert').waitFor()
  assert.equal(completed.status, 'PAID')
  await page.reload(); await page.locator('.commerce-payment').waitFor(); await page.getByRole('link', { name: 'دیدن سفارش و دسترسی فعلی', exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'ادامه و پرداخت', exact: true }).count(), 0)
  const after = await fetch(api + '/me/orders', { headers: { Authorization: `Bearer ${fresh.token}` } }).then(r => r.json())
  assert.equal(after.length, 1); assert.equal(after[0].requestId, completedRequest.requestId)
  await page.unroute('**/api/cent/v1/checkout')
  checks.push('Connected corrected mock completion with deliberately lost browser response: reload finds the same PAID order and hides payment; exactly one subscription order')

  // Only server current library permission can produce reading links after payment.
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), fixture.learner.token)
  const actualLibrary = await fetch(api + '/me/library', { headers: { Authorization: `Bearer ${fixture.learner.token}` } }).then(r => r.json())
  await page.route('**/me/library', route => route.fulfill({ json: { ...actualLibrary, readableTrainingIds: [], hasSubscription: false } }))
  await page.goto(root + `/checkout/success?order=${fixture.paid.id}`); await page.getByRole('heading', { name: 'پرداختت تأیید شد', exact: true }).waitFor()
  assert.equal(await page.getByRole('link', { name: /^مطالعه از کتابخانه/ }).count(), 0)
  await page.unroute('**/me/library')
  await page.route('**/catalog', route => route.fulfill({ json: { trainings: [], products: [] } }))
  await page.goto(root + '/package?kind=SUBSCRIPTION'); await page.getByRole('heading', { name: 'فعلاً طرح اشتراکی برای خرید موجود نیست', exact: true }).waitFor()
  await page.goto(root + `/checkout?product=${crypto.randomUUID()}`); await page.getByRole('heading', { name: 'این محصول فعلاً برای خرید موجود نیست', exact: true }).waitFor()
  await page.unroute('**/catalog')
  await page.route('**/me/orders', route => route.fulfill({ json: [] }))
  await page.goto(root + '/student/profile'); await page.getByRole('heading', { name: 'هنوز خریدی ثبت نکرده‌ای', exact: true }).waitFor()
  await page.goto(root + `/checkout/success?order=${fixture.paid.id}`); await page.getByRole('alert').waitFor()
  assert.equal(await page.getByRole('heading', { name: 'پرداختت تأیید شد', exact: true }).count(), 0)
  await page.unroute('**/me/orders')
  checks.push('Injected absent read permission, empty plans/history, unavailable product and non-owner history: no premature study access or invented recovery purchase')

  // Saving a retry identity is mandatory; do not send a payment if browser storage is blocked.
  await context.addInitScript(() => { const original = Storage.prototype.setItem; Storage.prototype.setItem = function (key, value) { if (key.startsWith('itatest:checkout:')) throw new Error('blocked'); return original.call(this, key, value) } })
  let attempted = 0
  await page.route('**/api/cent/v1/checkout', route => { attempted++; return route.abort() })
  await checkout(); await page.getByRole('button', { name: 'ادامه و پرداخت', exact: true }).click(); await page.getByRole('alert').waitFor(); assert.equal(attempted, 0)
  checks.push('Injected storage denial stops before the checkout POST and provides actionable local recovery')
  assert.deepEqual(errors, [])
  writeFileSync(artifact(`commerce-states-${label}-result.json`), JSON.stringify({ success: true, checks, errors, screenshots: 0, classification: 'One real mock purchase with deliberately dropped browser response; other HTTP/state/storage cases are injected presentation checks' }, null, 2))
  console.log(JSON.stringify({ success: true, checks: checks.length }))
} finally { await browser.close() }
