/* global fetch, crypto, console, document, window, sessionStorage, localStorage, getComputedStyle, MouseEvent, Event */
import assert from 'node:assert/strict'
import process from 'node:process'
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { api, root, artifact, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
const label = process.env.ITATEST_PHASE6_LABEL || 'development'
const fixture = JSON.parse(readFileSync(`.preview-artifacts/phase6-${label}-fixture.json`, 'utf8'))
const browser = await chromium.launch(browserOptions)
const checks = [], errors = []
async function call(path, method, body) {
  const response = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fixture.learner.token}` }, body: body ? JSON.stringify(body) : undefined })
  assert.ok(response.ok, `${method} ${path}: ${response.status}`)
  return response.status === 204 ? null : response.json()
}
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await context.addInitScript(token => sessionStorage.setItem('cent:session:v1', token), fixture.learner.token)
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message))
  // Library load/retry and unavailable-resource presentation are assertion-only.
  let releaseLibrary, requestedLibrary
  const libraryGate = new Promise(resolve => { releaseLibrary = resolve })
  const libraryRequest = new Promise(resolve => { requestedLibrary = resolve })
  await page.route('**/me/library', async route => { requestedLibrary(); await libraryGate; await route.continue() })
  await page.goto(root + '/student/content'); await libraryRequest
  await page.getByRole('status').filter({ hasText: 'در حال دریافت منابع کتابخانه' }).waitFor()
  assert.equal(await page.locator('.reading-resource').count(), 0)
  releaseLibrary(); await page.locator('.reading-resource').first().waitFor(); await page.unroute('**/me/library')
  await page.route('**/me/library', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'منابع فعلاً دریافت نشدن؛ دوباره تلاش کن.' }) }))
  await page.reload(); await page.getByRole('alert').filter({ hasText: 'منابع فعلاً' }).waitFor()
  assert.equal(await page.getByRole('heading', { name: 'کتابخانه‌ات از اولین آموزش شروع می‌شه' }).count(), 0)
  await page.unroute('**/me/library'); await page.getByRole('button', { name: 'دوباره تلاش کن' }).click(); await page.locator('.reading-resource').first().waitFor()
  await page.route('**/me/library', async route => {
    const response = await route.fetch(), data = await response.json()
    await route.fulfill({ response, json: { ...data, readableTrainingIds: [], entitlements: [], progress: [] } })
  })
  await page.reload(); await page.getByText('نیازمند تمدید', { exact: true }).first().waitFor()
  assert.equal(await page.locator('.reading-resource a').count(), 0)
  assert.equal(await page.locator('.reading-resource meter').count(), 0)
  assert.ok(await page.getByRole('link', { name: 'فعال‌سازی دسترسی', exact: true }).count())
  await page.unroute('**/me/library')
  checks.push('Gated library skeleton, injected library503 with real reload and no false empty state; injected unreadable metadata removes reading actions, retains existing access links and never invents positions')
  // Long note/title wrapping is a display-only fixture, never persisted.
  const longText = 'یادداشت بلند برای بررسی خوانایی و شکستن خط‌ها. '.repeat(65) + 'x² + y² = 1 / 10⁻³ mol L⁻¹'
  await page.route('**/me/notes', async route => {
    const response = await route.fetch(), data = await response.json()
    await route.fulfill({ response, json: [{ ...data[0], body: longText, documentTitle: 'عنوان یک منبع آموزشی بسیار طولانی برای بررسی نمایش در موبایل '.repeat(5) }] })
  })
  await page.goto(root + '/student/notes'); await page.locator('.reading-saved-note').waitFor()
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
  assert.ok((await page.locator('.reading-saved-note p').innerText()).includes('10⁻³ mol L⁻¹'))
  await page.unroute('**/me/notes')
  const subjectNote = await call(`/notes/${crypto.randomUUID()}`, 'PUT', { documentId: fixture.mathDoc.id, page: 1, anchorY: .5, body: 'نکته موقت برای بررسی نام درس', revision: 0 })
  await page.reload()
  const mappedNote = page.locator('.reading-saved-note').filter({ hasText: subjectNote.body })
  await mappedNote.locator('header small').waitFor()
  assert.equal(await mappedNote.locator('header small').innerText(), 'ریاضی')
  await call(`/notes/${subjectNote.id}?revision=${subjectNote.revision}`, 'DELETE')
  await page.route(`**/documents/${fixture.doc.id}`, async route => {
    const response = await route.fetch(), data = await response.json()
    await route.fulfill({ response, json: { ...data, document: { ...data.document, title: 'عنوان طولانی منبع برای بررسی سربرگ و کنترل‌های خواندن '.repeat(6) } } })
  })
  await page.goto(root + `/student/study/${fixture.doc.id}?page=1`)
  await page.waitForFunction(() => document.querySelector('canvas')?.width > 500 && !document.querySelector('.cent-page-content.concealed'))
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
  assert.ok(await page.locator('.cent-reader-header').evaluate(el => el.getBoundingClientRect().height <= 80))
  assert.equal(await page.locator('.cent-page-shell').evaluate(el => { const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); el.dispatchEvent(event); return event.defaultPrevented }), true)
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')) })
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.cent-page-content')).visibility === 'hidden')
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')) })
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.cent-page-content')).visibility === 'visible')
  await page.emulateMedia({ media: 'print' })
  assert.equal(await page.locator('.reading-workspace').isVisible(), false)
  await page.emulateMedia({ media: 'screen' })
  await page.unroute(`**/documents/${fixture.doc.id}`)
  checks.push('Assertion-only long RTL/LTR notes/scientific notation/title wrap without shell overflow; compact long-title header; existing context-menu prevention, injected visibility concealment and print suppression retained')
  // Actual revision-conflict semantics and existing draft replacement confirmations.
  const id = crypto.randomUUID()
  const created = await call(`/notes/${id}`, 'PUT', { documentId: fixture.doc.id, page: 1, anchorY: .6, body: 'یادداشت موقت برای بررسی نسخه', revision: 0 })
  await page.reload(); await page.locator('.cent-note-text').filter({ hasText: created.body }).waitFor()
  await page.locator('.cent-note-text').filter({ hasText: created.body }).click()
  const editor = page.getByLabel('متن یادداشت')
  assert.equal(await editor.getAttribute('maxlength'), '4000')
  await editor.fill('پیش‌نویس ثبت‌نشده برای بررسی انصراف')
  page.once('dialog', dialog => dialog.dismiss())
  await page.getByRole('button', { name: 'یادداشت جدید', exact: true }).click()
  assert.equal(await editor.inputValue(), 'پیش‌نویس ثبت‌نشده برای بررسی انصراف')
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'یادداشت جدید', exact: true }).click()
  assert.equal(await editor.inputValue(), '')
  await page.locator('.cent-note-text').filter({ hasText: created.body }).click()
  const external = await call(`/notes/${id}`, 'PUT', { ...created, body: 'نسخه تازه در حساب', revision: created.revision })
  await editor.fill('نوشته محلی باقی می‌مونه')
  const response = page.waitForResponse(r => r.request().method() === 'PUT' && r.url().endsWith(`/notes/${id}`))
  await page.getByRole('button', { name: 'ثبت یادداشت', exact: true }).click()
  assert.equal((await response).status(), 409)
  await page.locator('.reading-save-error[role=alert]').waitFor()
  assert.equal(await editor.inputValue(), 'نوشته محلی باقی می‌مونه')
  assert.equal(await page.getByText('در حساب شما ذخیره شد', { exact: true }).count(), 0)
  const stored = (await call(`/documents/${fixture.doc.id}`, 'GET')).notes.find(n => n.id === id)
  assert.equal(stored.body, external.body); assert.equal(stored.revision, external.revision)
  assert.ok(await page.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('cent:draft:') && localStorage.getItem(k) === 'نوشته محلی باقی می‌مونه')))
  await call(`/notes/${id}?revision=${stored.revision}`, 'DELETE')
  checks.push('Real revision409 preserves local draft and server note/revision, no false success; native dirty-new-note cancel preserves text, confirm resets editor; existing4000-character limit; temporary conflict note deleted')
  assert.deepEqual(errors, [])
  writeFileSync(artifact(`reading-states-${label}-result.json`), JSON.stringify({ success: true, checks, browserErrors: errors, injected: ['pending library', 'library503', 'unreadable library metadata', 'long note/title', 'document visibility event'], actual: ['note revision conflict', 'native draft confirmations', 'protected rendering/context-menu/print'] }, null, 2))
  console.log(`Phase 6 additional state checks passed: ${checks.length} groups.`)
  await context.close()
} finally { await browser.close() }
