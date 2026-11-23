/* global document, sessionStorage, innerWidth */
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { root, artifact, browserOptions } from './environment.mjs'

const browser = await chromium.launch(browserOptions)
const passed = []
const token = 'B'.repeat(64)
const profile = { id: '00000000-0000-0000-0000-000000000001', name: 'کاربر آزمایشی', email: '', role: 'STUDENT' }
async function fixture(width = 390, failure) {
  const context = await browser.newContext({ viewport: { width, height: 1000 } })
  const page = await context.newPage()
  const calls = { request: 0, verify: 0, errors: [] }
  page.on('pageerror', error => calls.errors.push(error.message))
  await context.route('**/api/cent/v1/**', async route => {
    const path = new URL(route.request().url()).pathname.split('/api/cent/v1')[1]
    const send = (body, status = 200, headers = {}) => route.fulfill({ status, contentType: 'application/json', headers, body: JSON.stringify(body) })
    if (path === '/auth/google/config') return send({ enabled: false, mode: 'GisIdToken', clientId: null })
    if (path.endsWith('/sms/request')) {
      calls.request++
      assert.deepEqual(route.request().postDataJSON(), { phone: '+989123456789' })
      if (failure === 'network') return route.abort()
      if (failure === 'provider') return send({ code: 'sms_unavailable', message: 'ارسال پیامک فعلاً ممکن نیست.' }, 503)
      if (failure === 'rate') return send({ code: 'sms_rate_limited', message: 'درخواست‌ها زیاد است.' }, 429, { 'Retry-After': '60' })
      const now = Date.now()
      return send({ challengeId: (calls.request === 1 ? 'C' : 'D').repeat(64), phone: '+989123456789', expiresAt: new Date(now + 120000).toISOString(), resendAt: new Date(now + 60000).toISOString(), serverTime: new Date(now).toISOString() })
    }
    if (path.endsWith('/sms/verify')) {
      calls.verify++
      const body = route.request().postDataJSON()
      assert.equal(body.challengeId, (calls.request === 1 ? 'C' : 'D').repeat(64))
      if (body.code !== '123456') return send({ code: 'invalid_sms_code', message: 'کد معتبر نیست یا مهلت آن پایان یافته است.' }, 401)
      return send({ token, expiresAt: new Date(Date.now() + 604800000).toISOString(), user: profile })
    }
    if (path === '/me') return route.request().headers().authorization ? send(profile) : send({}, 401)
    if (path === '/auth/logout') return route.fulfill({ status: 204 })
    if (path === '/me/library') return send({ trainings: [], documents: [], notes: [], progress: [], entitlements: [], readableTrainingIds: [], hasSubscription: false })
    if (path === '/curriculum') return send({ courses: [], chapters: [], topics: [], documents: [] })
    if (path === '/catalog') return send({ trainings: [], products: [] })
    return send([])
  })
  return { context, page, calls }
}
try {
  for (const width of [320, 390, 1440]) {
    const { context, page, calls } = await fixture(width)
    await page.clock.install()
    await page.goto(root + '/student/profile?source=sms')
    await page.getByRole('heading', { name: 'ورود یا ثبت‌نام' }).waitFor()
    await page.getByLabel('شماره موبایل').fill('08123456789')
    await page.getByRole('button', { name: 'ارسال کد تأیید', exact: true }).click()
    await page.getByRole('alert').filter({ hasText: 'معتبر' }).waitFor()
    assert.equal(calls.request, 0)
    await page.getByLabel('شماره موبایل').fill('۰۹۱۲۳۴۵۶۷۸۹')
    await page.getByRole('button', { name: 'ارسال کد تأیید', exact: true }).click()
    const otp = page.getByLabel('کد تأیید', { exact: true })
    await otp.waitFor()
    assert.equal(await otp.evaluate(element => document.activeElement === element), true)
    assert.equal(await page.getByRole('button', { name: 'ارسال دوباره کد' }).isDisabled(), true)
    await otp.fill('111111')
    await page.getByRole('button', { name: 'تأیید و ورود', exact: true }).click()
    await page.getByRole('alert').filter({ hasText: 'کد معتبر نیست' }).waitFor()
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), null)
    await page.clock.runFor(61000)
    await page.getByRole('button', { name: 'ارسال دوباره کد' }).click()
    await page.waitForFunction(() => document.querySelector('input[autocomplete="one-time-code"]')?.value === '')
    assert.equal(calls.request, 2)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    if (width === 390) await page.screenshot({ path: artifact('sms-otp-mobile.png'), fullPage: true })
    await otp.fill('۱۲۳۴۵۶')
    await page.getByRole('button', { name: 'تأیید و ورود', exact: true }).click()
    await page.waitForURL(root + '/student/profile?source=sms')
    await page.getByRole('heading', { name: profile.name, exact: true }).waitFor()
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), token)
    await page.reload()
    await page.getByRole('heading', { name: profile.name, exact: true }).waitFor()
    if (await page.getByRole('button', { name: 'نمایش منو' }).isVisible()) await page.getByRole('button', { name: 'نمایش منو' }).click()
    await page.getByRole('button', { name: 'خروج از حساب' }).click()
    await page.waitForURL(url => [root, root + '/login'].includes(url.href.replace(/\/$/, '')))
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), null)
    assert.deepEqual(calls.errors, [])
    passed.push(`SMS validation, focus, Persian digits/paste, incorrect code, countdown/resend, return destination, restoration/logout, RTL ${width}px`)
    await context.close()
  }
  for (const failure of ['network', 'provider', 'rate']) {
    const { context, page, calls } = await fixture(390, failure)
    await page.goto(root + '/login')
    await page.getByLabel('شماره موبایل').fill('09123456789')
    await page.getByRole('button', { name: 'ارسال کد تأیید', exact: true }).click()
    await page.getByRole('alert').waitFor()
    assert.equal(calls.request, 1)
    assert.equal(await page.evaluate(() => sessionStorage.getItem('cent:session:v1')), null)
    if (failure === 'rate') assert.equal(await page.getByRole('button', { name: 'ارسال کد تأیید', exact: true }).isDisabled(), true)
    passed.push(`${failure} failure: Persian error, no session, no automatic SMS retry`)
    await context.close()
  }
  {
    const { context, page } = await fixture()
    await page.goto(root + '/login')
    await page.getByLabel('شماره موبایل').fill('09123456789')
    await page.getByRole('button', { name: 'ارسال کد تأیید', exact: true }).click()
    await page.getByLabel('کد تأیید', { exact: true }).waitFor()
    await page.reload()
    await page.getByLabel('شماره موبایل').waitFor()
    assert.equal(await page.locator('input[autocomplete="one-time-code"]').count(), 0)
    passed.push('refresh discards challenge and OTP safely')
    await context.close()
  }
  writeFileSync(artifact('sms-auth-result.json'), JSON.stringify({ success: true, passed }, null, 2))
  console.log(`SMS browser checks passed: ${passed.length} scenarios`)
} finally { await browser.close() }
