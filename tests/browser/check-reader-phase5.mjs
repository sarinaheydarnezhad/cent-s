import { chromium, firefox, webkit } from 'playwright'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// Normal persistent local database and its existing accounts. No fixture host.
const api = 'http://127.0.0.1:5108/api/cent/v1', root = 'http://127.0.0.1:5173/cent-s'
const out = resolve('docs/educational-reader-pilot/phase-5/verification')
const sessions = JSON.parse(readFileSync('.preview-artifacts/phase5/local-review-sessions.json', 'utf8'))
const student = sessions.find(s => s.role === 'STUDENT'), admin = sessions.find(s => s.role === 'ADMIN')
const checks = [], subjects = [], browsers = [], errors = []
async function call(path, { token = student.token, method = 'GET', body, expected = 200 } = {}) {
  const r = await fetch(api + path, { method, headers: { Authorization: token ? 'Bearer ' + token : '', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: globalThis.AbortSignal.timeout(30000) })
  assert.equal(r.status, expected, `${path}: ${r.status} ${await r.clone().text()}`)
  return r.status === 204 ? null : r.headers.get('content-type')?.includes('json') ? r.json() : r
}
function save() { writeFileSync(out + '/normal-local-acceptance.json', JSON.stringify({ environment: 'normal Cent.Preview/App_Data/preview.db', providerLogin: 'NOT TESTED: offline maintenance sessions for existing accounts', browsers, subjects, checks, errors }, null, 2)) }
mkdirSync(out, { recursive: true })
try {
  assert.equal((await call('/me')).id.toUpperCase(), student.id)
  assert.equal((await call('/admin/access', { token: admin.token })).role, 'ADMIN')
  const curriculum = await call('/curriculum')
  // Existing subscription covers five subjects. Give the existing owner Reading
  // through the existing local mock purchase flow; do not fabricate academic review.
  const reading = curriculum.courses.find(c => c.code === 'reading')
  let library = await call('/me/library')
  if (!library.readableTrainingIds.includes(reading.trainingId)) {
    const productId = crypto.randomUUID()
    await call('/admin/products/' + productId, { token: admin.token, method: 'PUT', body: { title: 'Local acceptance Reading access', kind: 'TRAINING', trainingId: reading.trainingId, priceRial: 10000, durationDays: null, active: true } })
    const order = await call('/checkout', { method: 'POST', body: { productId, requestId: crypto.randomUUID() } })
    await call(`/me/orders/${order.id}/verify`, { method: 'POST', body: {} })
    checks.push({ requirement: 'reading-access', status: 'PASS', method: 'existing DEVELOPMENT_MOCK checkout', orderId: order.id })
    library = await call('/me/library')
  }
  const documents = (await call('/admin/trainings', { token: admin.token })).documents
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    let browser
    try { browser = await engine.launch(name === 'chromium' ? { channel: 'chrome', headless: true, timeout: 20000 } : { headless: true, timeout: 20000 }); browsers.push({ name, status: 'PASS', version: browser.version() }) }
    catch (e) { browsers.push({ name, status: 'BLOCKED', error: e.message }); save(); continue }
    try {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
      const page = await context.newPage(); page.setDefaultTimeout(60000)
      page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept())
      await page.goto(root); await page.evaluate(s => { sessionStorage.setItem('cent:session:v1', s.token); sessionStorage.setItem('cent:session-expiry:v1', s.expiresAt) }, student)
      await page.goto(root + '/student/content'); await page.locator('main').waitFor()
      for (const course of curriculum.courses) {
        await page.setViewportSize({ width: 1440, height: 1000 })
        assert.ok(library.readableTrainingIds.includes(course.trainingId), course.code + ' access')
        const available = library.documents.filter(d => d.trainingId === course.trainingId && d.sourceId)
        const doc = available.find(d => d.published === false) || available.sort((a,b) => b.pageCount-a.pageCount)[0]
        assert.ok(doc, course.code + ' authorized document')
        const rows = await call(`/documents/${doc.id}/source-sections`)
        assert.ok(rows.every(s => s.delivery === 'section-v1' && !s.text && !s.pilotHtml))
        const overlay = JSON.parse(readFileSync('../Backend/backend/Cent.Module/Content/reviewed-v4.json', 'utf8'))
        const diagramSections = overlay.changes.filter(c => c.entity === 'sections' && c.after.Html?.includes('<svg')).map(c => c.id)
        const index = Math.max(0, rows.findIndex(row => diagramSections.includes(row.id)))
        const payload = await call(`/documents/${doc.id}/source-sections/${rows[index].id}`)
        assert.ok(payload.pilotHtml && payload.watermark.startsWith('IT-'))
        await call(`/documents/${doc.id}/source-sections/${rows[0].id}`, { token: null, expected: 401 })
        await page.goto(root + '/student/study/' + doc.id + '?page=' + (index + 1)); await page.locator('.pilot-content').waitFor()
        if (course.code === 'chemistry' && doc.published === false) {
          await page.getByText('بازبینی محلی پیش‌نویس؛ این محتوا هنوز منتشر یا از نظر علمی تأیید نشده است.', { exact: true }).waitFor()
          await page.evaluate(() => window.scrollTo(0, 0))
          await page.screenshot({ path: out + '/../after/student-local-draft-review-after.png' })
        }
        await page.keyboard.press('Tab'); assert.ok(await page.evaluate(() => document.activeElement !== document.body))
        const bodyText = 'Phase 5 anchored acceptance ' + course.code + ' ' + crypto.randomUUID()
        await page.locator('.pilot-content [data-block]').first().click()
        await page.locator('#reading-note-body').fill(bodyText)
        await page.reload(); await page.locator('.pilot-content').waitFor()
        assert.equal(await page.locator('#reading-note-body').inputValue(), bodyText)
        await page.getByRole('button', { name: 'ثبت یادداشت', exact: true }).click()
        await page.getByText('در حساب شما ذخیره شد', { exact: true }).waitFor()
        let anchored = (await call('/documents/' + doc.id)).notes.find(n => n.body === bodyText)
        assert.ok(anchored?.anchorJson)
        await page.reload(); await page.locator('.pilot-content').waitFor()
        await page.locator('.cent-note-text').filter({ hasText: bodyText }).click()
        assert.equal(await page.locator('#reading-note-body').inputValue(), bodyText)
        await page.getByRole('button', { name: 'اتصال دوباره به متن', exact: true }).click()
        const targets = page.locator('.pilot-content [data-block]:visible')
        await targets.nth((await targets.count()) > 1 ? 1 : 0).click({ position: { x: 5, y: 5 } })
        await page.getByRole('button', { name: 'ثبت یادداشت', exact: true }).click()
        await page.getByText('در حساب شما ذخیره شد', { exact: true }).waitFor()
        const updated = (await call('/documents/' + doc.id)).notes.find(n => n.id === anchored.id)
        assert.equal(updated.body, bodyText); assert.equal(updated.revision, anchored.revision + 1); assert.notEqual(updated.anchorJson, anchored.anchorJson)
        anchored = updated
        await call('/notes/' + anchored.id + '?revision=' + anchored.revision, { method: 'DELETE', expected: 204 })
        const image = page.locator('.pilot-content img').first()
        let imageZoom = false
        if (await image.count()) {
          await image.scrollIntoViewIfNeeded()
          await page.waitForFunction(() => { const i = document.querySelector('.pilot-content img'); return i?.complete && i.naturalWidth > 0 && i.src.startsWith('blob:') })
          await image.focus(); await page.keyboard.press('Enter'); await page.getByRole('dialog').waitFor()
          await page.getByRole('button', { name: 'بزرگ کردن تصویر', exact: true }).click()
          assert.equal(await page.locator('.lesson-image-dialog output').innerText(), '150%')
          await page.keyboard.press('Escape'); assert.equal(await page.getByRole('dialog').count(), 0); imageZoom = true
        }
        const noteId = crypto.randomUUID(), body = 'Phase 5 acceptance ' + course.code
        const note = await call('/notes/' + noteId, { method: 'PUT', body: { documentId: doc.id, page: 1, anchorY: .2, anchorJson: null, body, revision: 0 } })
        assert.equal((await call('/documents/' + doc.id)).notes.find(n => n.id === note.id).body, body)
        await call('/notes/' + note.id + '?revision=' + note.revision, { method: 'DELETE', expected: 204 })
        await call('/documents/' + doc.id + '/progress', { method: 'PUT', body: { page: 1 } })
        for (const theme of ['light', 'dark']) {
          await page.evaluate(t => window.ItatestAppearance.setPreference(t), theme)
          for (const width of [1440, 390]) {
            await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), course.code + ' overflow')
          }
        }
        subjects.push({ browser: name, subject: course.code, documentId: doc.id, status: 'PASS', granularContent: true, notesRoundTrip: true, draftRestored: true, anchoredNoteRestored: true, reattachedSameIdAndBody: true, imageZoom, progress: true, keyboardFocus: true, themes: ['light','dark'], viewports: [1440,390], realDevice: false })
        save()
      }
      await page.evaluate(s => { sessionStorage.setItem('cent:session:v1', s.token); sessionStorage.setItem('cent:session-expiry:v1', s.expiresAt) }, admin)
      for (const doc of documents.filter(d => !d.published && d.sourceId)) {
        const meta = await call(`/admin/documents/${doc.id}/preview/`, { token: admin.token })
        await call(`/admin/documents/${doc.id}/preview/`, { expected: 403 })
        const localReview = await call(`/documents/${doc.id}`)
        assert.equal(localReview.document.published, false)
        await call(`/documents/${doc.id}`, { token: admin.token, expected: 404 })
        await page.goto(root + '/admin/content-preview/' + doc.id); await page.locator('.pilot-content').waitFor()
        await page.getByLabel('انتخاب بخش').selectOption(meta.sections.at(-1).id)
        await page.locator('.pilot-content').waitFor()
        mkdirSync(out + '/../after', { recursive: true }); await page.screenshot({ path: out + '/../after/admin-preview-' + doc.id + '.png' })
        checks.push({ requirement: 'draft-admin-preview', documentId: doc.id, status: 'PASS', remainsDraft: true, explicitLocalStudentReview: true, otherIdentityDenied: true })
        save()
      }
      await context.close()
    } finally { await browser.close() }
  }
  assert.deepEqual(errors, [])
  checks.push({ requirement: 'normal-local-six-subject-journey', status: 'PASS' })
} catch (e) { errors.push(e.stack); process.exitCode = 1 }
finally { save() }
