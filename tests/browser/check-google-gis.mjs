/* global window, document, sessionStorage, localStorage, innerWidth, console */
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import process from 'node:process'
import { URL } from 'node:url'
import { chromium } from 'playwright'
import { root, artifact, browserOptions } from './environment.mjs'

// Synthetic SDK + API only. No account, database, Google or production calls.
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(root).hostname))
const clientId = 'synthetic.apps.googleusercontent.com'
const proof = 'B'.repeat(42) + 'A'
const googleToken = 'SYNTHETIC_GOOGLE_ID_TOKEN_NEVER_PERSIST'
const centToken = 'A'.repeat(64)
const user = { id: '00000000-0000-0000-0000-000000000001', name: 'نام ذخیره‌شده', email: 'google@example.test', role: 'STUDENT' }
const browser = await chromium.launch(browserOptions)
const passed = []

const syntheticSdk = `
window.gisFixture = { initializations: [], buttons: [], cancelled: 0 };
window.google = { accounts: { id: {
  initialize(options) { window.gisFixture.initializations.push(options); },
  renderButton(target, options) {
    window.gisFixture.buttons.push(options);
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = 'ادامه با Google';
    button.addEventListener('click', options.click_listener); target.appendChild(button);
  },
  cancel() { window.gisFixture.cancelled++; }
} } };
`
async function fixture(options = {}) {
  const context = await browser.newContext({ colorScheme: process.env.ITATEST_TEST_THEME || 'light', viewport: { width: options.mobile ? 390 : 1440, height: 1000 } })
  const page = await context.newPage()
  let releaseCompletion
  const completionGate = options.holdCompletion ? new Promise(resolve => { releaseCompletion = resolve }) : Promise.resolve()
  const calls = { config: 0, sdk: 0, challenge: [], complete: [], password: [], logout: [], errors: [], console: [], urls: [] }
  page.on('pageerror', error => calls.errors.push(error.message))
  page.on('console', message => calls.console.push(message.text()))
  page.on('request', request => calls.urls.push(request.url()))
  await context.route('https://accounts.google.com/**', async route => {
    calls.sdk++
    assert.equal(route.request().url(), 'https://accounts.google.com/gsi/client')
    assert.equal(new URL(route.request().headers().referer).origin, new URL(root).origin)
    return options.sdkFailure ? route.abort('failed') : route.fulfill({ contentType: 'application/javascript', body: syntheticSdk })
  })
  await context.route('**/api/cent/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname.split('/api/cent/v1')[1]
    const headers = { 'access-control-allow-origin': new URL(root).origin, 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type,x-cent-gis,authorization', 'cache-control': 'private, no-store, max-age=0' }
    const send = (body, status = 200, extra = {}) => route.fulfill({ status, headers: { ...headers, ...extra }, contentType: 'application/json', body: JSON.stringify(body) })
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    const profile = options.newUser ? { ...user, id: 'new-user', name: 'کاربر تازه' } : options.admin ? { ...user, role: 'ADMIN' } : user
    const auth = { token: centToken, expiresAt: new Date(Date.now() + 604_800_000).toISOString(), user: profile }
    if (path === '/auth/google/config') {
      calls.config++
      assert.equal(request.headers().authorization, undefined)
      assert.equal(request.headers()['x-cent-gis'], undefined)
      if (options.discoveryFailure) return send({ code: 'google_unavailable' }, 503)
      return send({ enabled: !options.disabled, mode: 'GisIdToken', clientId: options.disabled ? null : clientId })
    }
    if (path.startsWith('/auth/google/gis/')) {
      assert.equal(request.headers()['x-cent-gis'], '1')
      assert.equal(request.headers()['content-type'], 'application/json')
      assert.equal(request.headers().authorization, undefined)
      assert.equal(request.headers().cookie, undefined)
      assert.equal(request.headers().origin, new URL(root).origin)
    }
    if (path === '/auth/google/gis/challenge') {
      calls.challenge.push(request.postDataJSON())
      assert.deepEqual(request.postDataJSON(), {})
      if (options.challengeFailure) return send({ code: 'temporarily_unavailable' }, 503)
      return send({ challengeId: (calls.challenge.length === 1 ? 'C' : 'D').repeat(42) + 'A', nonce: (calls.challenge.length === 1 ? 'N' : 'M').repeat(42) + 'A', browserBinding: proof, expiresAt: new Date(Date.now() + 300_000).toISOString() })
    }
    if (path === '/auth/google/gis/complete') {
      calls.complete.push(request.postDataJSON())
      await completionGate
      if (options.verificationFailure) return send({ code: 'invalid_google_credentials', message: 'RAW INTERNAL ERROR' }, 401)
      if (options.conflict) return send({ code: 'google_account_conflict' }, 409)
      if (options.rateLimit) return send({}, 429)
      return send(auth)
    }
    if (path === '/auth/login' || path === '/auth/register') { calls.password.push(path); return send(auth) }
    if (path === '/auth/logout') { calls.logout.push(request.headers().authorization); return route.fulfill({ status: 204, headers }) }
    if (path === '/me/orders/synthetic-order/verify') return request.headers().authorization ? send({ paid: false }) : send({}, 401)
    if (path === '/me') return send(profile)
    if (path === '/me/mastery') return send({ courses: [] })
    if (path === '/me/library') return send({ trainings: [], documents: [], notes: [], progress: [], entitlements: [], hasSubscription: false, readableTrainingIds: [] })
    if (path === '/catalog') return send({ trainings: [], products: [] })
    if (path === '/curriculum') return send({ courses: [], chapters: [], topics: [], documents: [] })
    return send([])
  })
  return { context, page, calls, releaseCompletion }
}
async function ready(page, destination = '/login') {
  await page.goto(root + destination)
  await page.getByRole('button', { name: 'ادامه با Google' }).waitFor()
}
async function emit(page, { index = -1, stateIndex = index, token = googleToken, duplicate = false } = {}) {
  await page.evaluate(({ index, stateIndex, token, duplicate }) => {
    const fixture = window.gisFixture
    const callback = fixture.initializations.at(index).callback
    const response = { credential: token, state: fixture.buttons.at(stateIndex).state }
    callback(response)
    if (duplicate) callback(response)
  }, { index, stateIndex, token, duplicate })
}
async function noSecrets(page, calls) {
  const stored = await page.evaluate(() => ({ session: { ...sessionStorage }, local: { ...localStorage } }))
  assert.ok(!JSON.stringify(stored).includes(googleToken))
  assert.ok(!JSON.stringify(stored).includes(proof))
  assert.ok(!calls.console.join('\n').includes(googleToken))
  assert.ok(!calls.urls.join('\n').includes(googleToken))
  assert.ok(!calls.urls.join('\n').includes(proof))
  assert.deepEqual(calls.errors, [])
}

try {
  for (const newUser of [false, true]) {
    const { context, page, calls, releaseCompletion } = await fixture({ newUser, holdCompletion: true })
    await ready(page, '/student/profile?source=purchase')
    assert.equal(calls.config, 1, 'StrictMode must not duplicate discovery')
    assert.equal(calls.challenge.length, 1)
    const options = await page.evaluate(() => {
      const { callback, ...options } = window.gisFixture.initializations[0]
      return { options, count: window.gisFixture.initializations.length, callbackType: typeof callback }
    })
    assert.deepEqual(options.options, { client_id: clientId, nonce: 'N'.repeat(42) + 'A', ux_mode: 'popup', auto_select: false, button_auto_select: false, use_fedcm_for_button: true })
    assert.equal(options.count, 1)
    await page.getByRole('button', { name: 'ادامه با Google' }).click()
    await emit(page, { duplicate: true })
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), null, 'No session before backend confirmation')
    assert.equal(await page.getByRole('button', { name: 'ارسال کد تأیید', exact: true }).isDisabled(), true)
    releaseCompletion()
    await page.waitForURL(root + '/student/profile?source=purchase')
    await page.getByRole('heading', { name: newUser ? 'کاربر تازه' : user.name, exact: true }).waitFor()
    assert.deepEqual(calls.complete, [{ challengeId: 'C'.repeat(42) + 'A', browserBinding: proof, idToken: googleToken }])
    assert.deepEqual(calls.password, [], 'The official Google button never submits the password form')
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), centToken)
    await page.reload()
    await page.getByRole('heading', { name: newUser ? 'کاربر تازه' : user.name, exact: true }).waitFor()
    await noSecrets(page, calls)
    assert.equal(await page.locator('meta[name="referrer"]').getAttribute('content'), new URL(root).protocol === 'http:' && new URL(root).hostname === 'localhost' ? 'no-referrer-when-downgrade' : 'strict-origin-when-cross-origin')
    await page.getByRole('button', { name: 'خروج از حساب' }).click()
    await page.waitForURL(url => [root, root + '/login'].includes(url.href.replace(/\/$/, '')))
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), null)
    assert.deepEqual(calls.logout, ['Bearer ' + centToken])
    passed.push(newUser ? 'new Google user, profile/session/navigation/restore/logout' : 'existing Google user, duplicate callback, profile/session/navigation/restore/logout')
    await context.close()
  }
  for (const [option, text] of [['sdkFailure', 'بارگذاری'], ['challengeFailure', 'ثانیه'], ['discoveryFailure', 'ثانیه'], ['verificationFailure', 'معتبر نیست'], ['conflict', 'تداخل'], ['rateLimit', '60']]) {
    const { context, page, calls } = await fixture({ [option]: true })
    if (['verificationFailure', 'conflict', 'rateLimit'].includes(option)) { await ready(page); await emit(page) }
    else await page.goto(root + '/login')
    await page.getByRole('alert').filter({ hasText: text }).waitFor()
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), null)
    assert.ok(!(await page.locator('body').innerText()).includes('RAW INTERNAL ERROR'))
    if (option === 'rateLimit') assert.equal(await page.getByRole('button', { name: /تلاش دوباره پس از/ }).isDisabled(), true)
    await noSecrets(page, calls)
    passed.push(option + ' with safe Persian error and no session')
    await context.close()
  }
  {
    const { context, page, calls } = await fixture()
    await page.clock.install()
    await ready(page)
    await page.clock.runFor(295_000)
    await page.getByRole('status').filter({ hasText: 'مهلت' }).waitFor()
    await emit(page)
    assert.equal(calls.complete.length, 0)
    await page.getByRole('button', { name: 'تلاش دوباره برای ورود با گوگل' }).click()
    await page.waitForFunction(() => window.gisFixture.initializations.length === 2)
    await page.getByRole('button', { name: 'ادامه با Google' }).waitFor()
    await emit(page, { index: 0 })
    await emit(page, { index: 1, stateIndex: 0 })
    assert.equal(calls.complete.length, 0)
    await emit(page)
    await page.waitForURL(root + '/student')
    assert.equal(calls.sdk, 1)
    assert.equal(calls.challenge.length, 2)
    await noSecrets(page, calls)
    passed.push('expiry recovery, fresh challenge/nonce, old callback and mismatched button state rejected')
    await context.close()
  }
  {
    const { context, page, calls } = await fixture()
    await ready(page)
    await page.getByRole('button', { name: 'ادامه با Google' }).click()
    await page.getByRole('button', { name: 'لغو و تلاش دوباره' }).click()
    await page.waitForFunction(() => window.gisFixture.initializations.length === 2)
    await emit(page, { index: 0 })
    assert.equal(calls.complete.length, 0)
    assert.equal(await page.getByRole('button', { name: 'ارسال کد تأیید', exact: true }).isEnabled(), true)
    await noSecrets(page, calls)
    passed.push('explicit popup dismissal recovery releases SMS UI and rejects stale credential')
    await context.close()
  }
  {
    for (const destination of ['/checkout?product=synthetic-product', '/checkout/success?order=synthetic-order']) {
      const { context, page, calls } = await fixture()
      await ready(page, destination)
      await emit(page)
      await page.waitForURL(root + destination)
      assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), centToken)
      await noSecrets(page, calls)
      passed.push('purchase return destination preserved: ' + destination.split('?')[0])
      await context.close()
    }
  }
  {
    const { context, page, calls } = await fixture({ admin: true, mobile: true })
    await ready(page)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    if (process.env.ITATEST_TEST_CAPTURE !== '0') await page.screenshot({ path: artifact('google-gis-mobile.png'), fullPage: true })
    await emit(page)
    await page.waitForURL(root + '/admin')
    await noSecrets(page, calls)
    passed.push('mobile RTL layout and preserved ADMIN navigation')
    await context.close()
  }
  {
    const { context, page, calls } = await fixture({ disabled: true })
    await page.goto(root + '/login')
    await page.getByRole('status').filter({ hasText: 'در دسترس نیست' }).waitFor()
    assert.equal(calls.sdk, 0); assert.equal(calls.challenge.length, 0)
    assert.equal(await page.getByRole('button', { name: 'ارسال کد تأیید', exact: true }).isEnabled(), true)
    passed.push('disabled mode keeps SMS login available without SDK or challenges')
    await context.close()
  }
  writeFileSync(artifact('google-gis-result.json'), JSON.stringify({ success: true, root, passed }, null, 2))
  console.log(`GIS browser checks passed (${passed.length} scenarios):\n${passed.join('\n')}`)
} finally { await browser.close() }
