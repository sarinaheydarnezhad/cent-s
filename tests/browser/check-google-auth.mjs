/* global sessionStorage, document, innerWidth, console, setTimeout */
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { URL } from 'node:url'
import { chromium } from 'playwright'
import { root, artifact, browserOptions } from './environment.mjs'

// Entirely synthetic OAuth/API fixtures: no Google account or database writes.
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(root).hostname))
const state = 's'.repeat(43), codeVerifier = 'v'.repeat(43)
const attemptKey = 'cent:google-attempt:v1'
const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?state=${state}&code_challenge=synthetic-proof&code_challenge_method=S256`
const user = { id: '00000000-0000-0000-0000-000000000001', name: 'آزمون گوگل', email: 'google@example.test', role: 'STUDENT' }
const library = { trainings: [], documents: [], notes: [], progress: [], entitlements: [], hasSubscription: false, readableTrainingIds: [] }
const browser = await chromium.launch(browserOptions)
const passed = []

async function fixture(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  const calls = { start: 0, complete: [], password: [], logout: [], pageErrors: [] }
  page.on('pageerror', error => calls.pageErrors.push(error.message))
  await context.route('https://accounts.google.com/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Google test double</title><p>Synthetic Google authorization</p>' }))
  await context.route('**/api/cent/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname.split('/api/cent/v1')[1]
    const send = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (path === '/auth/google/start') {
      calls.start++
      if (options.startUnavailable) return send({ code: 'google_unavailable', message: 'Unavailable' }, 503)
      await new Promise(resolve => setTimeout(resolve, 150))
      return send({ authorizationUrl, state, codeVerifier, expiresAt: new Date(Date.now() + 300_000).toISOString() })
    }
    if (path === '/auth/google/complete') {
      calls.complete.push(request.postDataJSON())
      assert.equal(request.headers().referer, undefined, 'Callback must not leak a Referer')
      if (request.postDataJSON().error) return send({ code: 'google_cancelled', message: 'Cancelled' }, 400)
      if (options.conflict) return send({ code: 'google_account_conflict', message: 'Conflict' }, 409)
      return send({ token: 'synthetic-cent-token', expiresAt: new Date(Date.now() + (options.sessionLifetime ?? 604_800_000)).toISOString(), user })
    }
    if (path === '/auth/login' || path === '/auth/register') {
      calls.password.push({ path, input: request.postDataJSON() })
      return send({ token: 'synthetic-password-token', expiresAt: new Date(Date.now() + 604_800_000).toISOString(), user })
    }
    if (path === '/auth/logout') { calls.logout.push(request.headers().authorization); return route.fulfill({ status: 204 }) }
    if (path === '/me') return send(user)
    if (path === '/me/library') return send(library)
    if (path === '/curriculum') return send({ courses: [], chapters: [], topics: [], documents: [] })
    if (path === '/catalog') return send({ trainings: [], products: [] })
    if (path === '/status') return send({ payments: 'DEVELOPMENT_MOCK' })
    return send([])
  })
  return { context, page, calls }
}

async function startOn(page, registration = false) {
  await page.goto(root + '/student/profile')
  await page.waitForURL(root + '/login')
  if (registration) await page.getByRole('button', { name: 'ثبت‌نام', exact: true }).click()
  const button = page.getByRole('button', { name: registration ? 'ثبت‌نام با گوگل' : 'ورود با گوگل', exact: true })
  // A double activation must produce one start, even with blank required password fields.
  await button.evaluate(element => { element.click(); element.click() })
  await page.getByRole('status').getByText('در حال انتقال به گوگل…').waitFor()
  assert.equal(await page.getByRole('button', { name: registration ? 'ساخت حساب' : 'ورود به حساب', exact: true }).isDisabled(), true)
  await page.waitForURL(authorizationUrl)
}

async function callback(page, query) {
  const response = await page.goto(root + '/auth/google/callback?' + query)
  assert.equal(response.headers()['cache-control'], 'no-store')
  assert.equal(response.headers()['referrer-policy'], 'no-referrer')
}

try {
  {
    const { context, page, calls } = await fixture()
    await startOn(page)
    assert.equal(calls.start, 1)
    await callback(page, `state=${state}&code=synthetic-code`)
    await page.waitForURL(root + '/student/profile')
    await page.getByRole('heading', { name: user.name, exact: true }).waitFor()
    assert.deepEqual(calls.complete, [{ state, codeVerifier, code: 'synthetic-code' }])
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), attemptKey), null)
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), 'synthetic-cent-token')
    assert.ok(Date.parse(await page.evaluate(() => sessionStorage.getItem('cent:session-expiry:v1'))) > Date.now())
    await page.reload()
    await page.getByRole('heading', { name: user.name, exact: true }).waitFor()
    assert.equal(calls.complete.length, 1)
    await page.getByRole('button', { name: 'خروج از حساب' }).click()
    await page.waitForURL(url => [root, root + '/login'].includes(url.href.replace(/\/$/, '')))
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), null)
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session-expiry:v1')), null)
    assert.deepEqual(calls.logout, ['Bearer synthetic-cent-token'])
    assert.deepEqual(calls.pageErrors, [])
    passed.push('login Google button, duplicate start, StrictMode callback, protected return, session restore and logout')
    await context.close()
  }
  {
    const { context, page, calls } = await fixture()
    await startOn(page, true)
    await callback(page, `state=${state}&error=access_denied`)
    await page.getByRole('alert').filter({ hasText: 'لغو شد' }).waitFor()
    assert.equal(new URL(page.url()).search, '')
    assert.deepEqual(calls.complete, [{ state, codeVerifier, error: 'access_denied' }])
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), null)
    await page.reload()
    await page.getByRole('alert').filter({ hasText: 'معتبر نیست' }).waitFor()
    assert.equal(calls.complete.length, 1)
    await page.getByRole('link', { name: 'بازگشت به ورود و تلاش دوباره' }).click()
    await page.getByRole('button', { name: 'ورود با گوگل', exact: true }).waitFor()
    passed.push('registration Google button, cancellation, clean URL, refresh/replay rejection and retry link')
    await context.close()
  }
  {
    const { context, page, calls } = await fixture()
    await startOn(page)
    await callback(page, 'state=wrong&code=synthetic-code')
    await page.getByRole('alert').filter({ hasText: 'معتبر نیست' }).waitFor()
    assert.equal(calls.complete.length, 0)
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), attemptKey), null)
    assert.equal(new URL(page.url()).search, '')
    passed.push('state mismatch rejected before backend completion')
    await context.close()
  }
  {
    const { context, page, calls } = await fixture({ conflict: true })
    await startOn(page)
    await callback(page, `state=${state}&code=synthetic-code`)
    await page.getByRole('alert').filter({ hasText: 'روش قبلی' }).waitFor()
    assert.equal(calls.complete.length, 1)
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), null)
    passed.push('existing-account conflict preserves existing sign-in method')
    await context.close()
  }
  {
    const { context, page, calls } = await fixture({ startUnavailable: true })
    await page.goto(root + '/login')
    await page.getByRole('button', { name: 'ورود با گوگل', exact: true }).click()
    await page.getByRole('alert').filter({ hasText: 'در دسترس نیست' }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'ورود با گوگل', exact: true }).isEnabled(), true)
    assert.equal(calls.start, 1)
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), attemptKey), null)
    passed.push('disabled/unavailable backend shows a recoverable error')
    await context.close()
  }
  {
    const { context, page } = await fixture({ sessionLifetime: 2000 })
    await startOn(page)
    await callback(page, `state=${state}&code=synthetic-code`)
    await page.waitForURL(root + '/student/profile')
    await page.waitForURL(root + '/login')
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), null)
    passed.push('returned session expiration signs out the active protected page')
    await context.close()
  }
  for (const registration of [false, true]) {
    const { context, page, calls } = await fixture()
    await page.goto(root + '/login')
    if (registration) {
      await page.getByRole('button', { name: 'ثبت‌نام', exact: true }).click()
      await page.getByLabel('نام و نام خانوادگی').fill(user.name)
    }
    await page.getByLabel('ایمیل', { exact: true }).fill(user.email)
    await page.getByLabel('رمز عبور').fill('existing-password')
    await page.getByRole('button', { name: registration ? 'ساخت حساب' : 'ورود به حساب', exact: true }).click()
    await page.waitForURL(root + '/student')
    assert.equal(calls.start, 0)
    assert.equal(calls.password.length, 1)
    assert.equal(calls.password[0].path, registration ? '/auth/register' : '/auth/login')
    assert.equal(calls.password[0].input.password, 'existing-password')
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), 'synthetic-password-token')
    passed.push(registration ? 'password registration preserved' : 'password login preserved')
    await context.close()
  }
  {
    const { context, page } = await fixture()
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(root + '/login')
    await page.getByRole('button', { name: 'ورود با گوگل', exact: true }).waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await page.screenshot({ path: artifact('google-auth-mobile.png'), fullPage: true })
    passed.push('mobile Google sign-in layout fits the viewport')
    await context.close()
  }
  writeFileSync(artifact('google-auth-result.json'), JSON.stringify({ success: true, passed }, null, 2))
  console.log(`Google auth browser checks passed (${passed.length} scenarios):\n${passed.join('\n')}`)
} finally { await browser.close() }
