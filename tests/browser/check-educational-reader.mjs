import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

// Explicit disposable local fixture; never read the shared preview credentials.
const api = 'http://127.0.0.1:5120/api/cent/v1', root = 'http://127.0.0.1:5190/cent-s'
const out = resolve('docs/educational-reader-pilot/phase-3/after')
mkdirSync(out, { recursive: true })
const fixtures = JSON.parse(readFileSync('.preview-artifacts/reader-phase3/bin/Cent.Preview/debug/App_Data/isolated/admin-fixtures.json', 'utf8'))
const learner = fixtures.find(f => f.role === 'STUDENT'), admin = fixtures.find(f => f.role === 'SuperAdmin'), outsider = fixtures.find(f => f.role === 'UserManager')
async function request(path, method = 'GET', body, token = learner.token, expected = 200) {
  const response = await fetch(api + path, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  assert.equal(response.status, expected, `${method} ${path}: ${await response.clone().text()}`)
  return response
}
async function call(...args) { const r = await request(...args); return r.status === 204 ? null : r.json() }
const curriculum = await call('/curriculum'), results = [], errors = []
const corpus = ['curriculum.json', 'curriculum-2026.json', 'curriculum-2026-r2.json'].flatMap(name => JSON.parse(readFileSync('../Backend/backend/Cent.Module/Content/' + name, 'utf8')).sources)
function documentId(key) {
  const b = createHash('sha256').update('cent-curriculum-v1:document:' + key).digest().subarray(0, 16)
  return `${Buffer.from(b.subarray(0, 4)).reverse().toString('hex')}-${Buffer.from(b.subarray(4, 6)).reverse().toString('hex')}-${Buffer.from(b.subarray(6, 8)).reverse().toString('hex')}-${b.subarray(8, 10).toString('hex')}-${b.subarray(10).toString('hex')}`
}
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
page.on('pageerror', error => errors.push(error.message))
page.on('dialog', dialog => dialog.accept())
try {
  await page.goto(root)
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), learner.token)
  for (const subject of ['math', 'physics', 'chemistry', 'biology', 'logic', 'reading']) {
    const course = curriculum.courses.find(c => c.code === subject)
    const source = subject === 'logic' ? corpus.find(s => s.key === 'logic/ch18-venn.html') : corpus.find(s => s.course === subject)
    const doc = curriculum.documents.find(d => d.id === documentId(source.key))
    assert.ok(doc, subject)
    const productId = crypto.randomUUID()
    await call('/admin/products/' + productId, 'PUT', { title: 'Disposable reader verification ' + subject, kind: 'TRAINING', trainingId: course.trainingId, priceRial: 10000, durationDays: null, active: true }, admin.token)
    if (!(await call('/me/library')).readableDocumentIds.includes(doc.id)) {
      const order = await call('/checkout', 'POST', { productId, requestId: crypto.randomUUID() })
      await call(`/me/orders/${order.id}/verify`, 'POST', {})
    }
    for (const note of (await call(`/documents/${doc.id}`)).notes.filter(n => n.body === 'P3 disposable ' + subject))
      await call('/notes/' + note.id + '?revision=' + note.revision, 'DELETE', undefined, learner.token, 204)
    const rows = await call(`/documents/${doc.id}/source-sections`)
    assert.ok(rows.length > 1 && rows.every(s => s.delivery === 'section-v1' && s.text === '' && !s.pilotHtml))
    const index = subject === 'math' ? 2 : 1
    const section = rows[index], path = `/documents/${doc.id}/source-sections/${section.id}`
    const response = await request(path), payload = await response.json()
    assert.match(response.headers.get('cache-control'), /no-store/)
    assert.ok(payload.pilotHtml && payload.contentRevision && payload.watermark.startsWith('IT-'))
    assert.equal(payload.text, '')
    assert.equal((await fetch(api + path)).status, 401)
    await request(path, 'GET', undefined, outsider.token, 403)
    for (const asset of payload.assets) {
      const assetPath = path + '/assets/' + asset.id
      const r = await request(assetPath)
      assert.equal(r.headers.get('content-type').split(';')[0], asset.mime)
      assert.match(r.headers.get('cache-control'), /no-store/)
      assert.equal((await fetch(api + assetPath)).status, 401)
      await request(assetPath, 'GET', undefined, outsider.token, 403)
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(`${root}/student/study/${doc.id}?page=${index + 1}`)
    await page.locator('.pilot-lesson').waitFor({ timeout: 90000 })
    assert.equal(await page.locator('.pilot-content img').count(), (payload.pilotHtml.match(/<img /g) || []).length)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForFunction(() => [...document.querySelectorAll('.pilot-lesson img')].filter(el => el.getBoundingClientRect().top < window.innerHeight + 500).every(el => el.complete && el.naturalWidth > 0))
    assert.equal(await page.locator('.pilot-content script,.pilot-content svg,.pilot-content [onclick],.pilot-content [style]').count(), 0)
    assert.ok(await page.locator('.pilot-content [data-block]').count() > 0)
    await page.screenshot({ path: `${out}/${subject}-desktop.png`, fullPage: true })
    await page.locator('.pilot-content [data-block]').first().click()
    await page.locator('#reading-note-body').fill('P3 disposable ' + subject)
    await page.getByRole('button', { name: 'ثبت یادداشت', exact: true }).click()
    await page.getByText('در حساب شما ذخیره شد', { exact: true }).waitFor()
    let note = (await call(`/documents/${doc.id}`)).notes.find(n => n.body === 'P3 disposable ' + subject)
    assert.ok(note?.anchorJson)
    await page.reload()
    await page.locator('.pilot-pin').first().waitFor()
    await page.locator('.pilot-pin').first().click()
    assert.equal(await page.locator('#reading-note-body').inputValue(), note.body)
    await page.getByRole('button', { name: 'اتصال دوباره به متن', exact: true }).click()
    const target = page.locator('.pilot-content [data-block]:visible').nth(1)
    await target.click()
    await page.getByRole('button', { name: 'ثبت یادداشت', exact: true }).click()
    await page.getByText('در حساب شما ذخیره شد', { exact: true }).waitFor()
    const updated = (await call(`/documents/${doc.id}`)).notes.find(n => n.id === note.id)
    assert.equal(updated.id, note.id); assert.equal(updated.body, note.body); assert.equal(updated.revision, note.revision + 1)
    assert.notEqual(updated.anchorJson, note.anchorJson)
    note = updated
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'بستن یادداشت‌ها', exact: true }).click()
    await page.locator('.pilot-lesson').scrollIntoViewIfNeeded()
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), subject + ' mobile overflow')
    await page.screenshot({ path: `${out}/${subject}-mobile.png` })
    await page.evaluate(() => window.ItatestAppearance.setPreference('dark'))
    await page.screenshot({ path: `${out}/${subject}-dark.png` })
    await page.evaluate(() => window.ItatestAppearance.setPreference('light'))
    await call('/notes/' + note.id + '?revision=' + note.revision, 'DELETE', undefined, learner.token, 204)
    results.push({ subject, sections: rows.length, assetsInSample: payload.assets.length, annotationRestored: true, reattachedWithoutChangingIdOrText: true, mobileOverflow: false })
    await page.waitForTimeout(2500)
  }
  assert.deepEqual(errors, [])
  writeFileSync(out + '/results.json', JSON.stringify({ passed: true, subjects: results, errors }, null, 2))
  console.log('Six-subject educational reader checks passed')
} finally { await browser.close() }
