/* global fetch, crypto, console, sessionStorage */
import { chromium } from 'playwright'
import process from 'node:process'
import { URL } from 'node:url'
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { api, root, artifact, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
async function request(path, token, method = 'GET', body) {
  const response = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  assert.ok(response.ok, `${path}: ${response.status} ${response.ok ? '' : await response.text()}`)
  return response.status === 204 ? null : response.json()
}
const admin = await request('/auth/login', null, 'POST', { email: 'admin@cent.local', password: 'cent-local-preview-only' })
const learner = await request('/auth/register', null, 'POST', { email: `notes-${Date.now()}@test.local`, name: 'Notes regression', password: 'notes-local-check' })
const curriculum = await request('/curriculum')
const course = curriculum.courses.find(c => c.code === 'math')
assert.ok(course, 'Import the curriculum before running this check.')
const productId = crypto.randomUUID()
await request(`/admin/products/${productId}`, admin.token, 'PUT', { title: 'Local notes verification', kind: 'TRAINING', trainingId: course.trainingId, priceRial: 10000, durationDays: null, active: true })
const order = await request('/checkout', learner.token, 'POST', { productId, requestId: crypto.randomUUID() })
await request(`/me/orders/${order.id}/verify`, learner.token, 'POST', {})
const doc = curriculum.documents.find(d => d.trainingId === course.trainingId)
const browser = await chromium.launch(browserOptions)
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 950 } })
  const errors = [], savedIds = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(root + '/')
  await page.evaluate(token => sessionStorage.setItem('cent:session:v1', token), learner.token)
  await page.goto(`${root}/student/study/${doc.id}`)
  await page.locator('.cent-source-text > div').filter({ hasText: /.+/ }).waitFor()
  const editor = page.getByLabel('متن یادداشت')
  const saveButton = page.getByRole('button', { name: 'ثبت یادداشت', exact: true })
  const newButton = page.getByRole('button', { name: 'یادداشت جدید', exact: true })
  const noteText = '.cent-page-notes .cent-note-text p'
  async function save(text) {
    await editor.fill(text)
    const response = page.waitForResponse(r => r.request().method() === 'PUT' && new URL(r.url()).pathname.includes('/notes/'))
    await saveButton.click()
    const saved = await response
    assert.equal(saved.status(), 200, `Saving '${text}': ${await saved.text()}`)
    const note = await saved.json()
    await page.locator('.cent-save-status').filter({ hasText: 'در حساب شما ذخیره شد' }).waitFor()
    return note.id
  }
  for (let i = 1; i <= 3; i++) {
    if (i > 1) await newButton.click()
    savedIds.push(await save(`Consecutive note ${i}`))
    assert.equal(await page.locator(noteText).count(), i)
  }
  assert.equal(new Set(savedIds).size, 3)
  // Updating a selected note must edit that note, without replacing another one.
  await page.locator('.cent-note-text').filter({ hasText: 'Consecutive note 1' }).click()
  assert.equal(await save('Consecutive note 1 edited'), savedIds[0])
  await newButton.click()
  savedIds.push(await save('New note after editing'))
  assert.equal(new Set(savedIds).size, 4)
  // A failed request keeps its creation ID for retry instead of creating duplicates.
  await newButton.click()
  let retryId
  await page.route('**/notes/*', async route => {
    if (route.request().method() !== 'PUT') return route.continue()
    retryId = route.request().url().split('/').at(-1)
    return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Temporary notes check failure' }) })
  }, { times: 1 })
  await editor.fill('Note after retry')
  await saveButton.click()
  await page.getByText('Temporary notes check failure', { exact: true }).waitFor()
  savedIds.push(await save('Note after retry'))
  assert.equal(savedIds.at(-1), retryId)
  assert.equal(new Set(savedIds).size, 5)
  // Deleting the selected note must also leave the editor ready for a fresh note.
  page.once('dialog', dialog => dialog.accept())
  const deletion = page.waitForResponse(r => r.request().method() === 'DELETE' && r.url().includes('/notes/'))
  await page.locator('.cent-page-notes article').filter({ hasText: 'Note after retry' }).getByRole('button', { name: 'حذف یادداشت' }).click()
  assert.equal((await deletion).status(), 204)
  await page.locator('.cent-save-status').filter({ hasText: 'یادداشت حذف شد' }).waitFor()
  const afterDelete = await save('New note after deletion')
  assert.ok(!savedIds.includes(afterDelete))
  await page.reload()
  await page.locator(noteText).filter({ hasText: 'New note after deletion' }).waitFor()
  const texts = await page.locator(noteText).allTextContents()
  assert.deepEqual(texts.sort(), ['Consecutive note 1 edited', 'Consecutive note 2', 'Consecutive note 3', 'New note after editing', 'New note after deletion'].sort())
  const stored = await request(`/documents/${doc.id}`, learner.token)
  assert.equal(stored.notes.length, 5)
  assert.equal(new Set(stored.notes.map(n => n.id)).size, 5)
  assert.deepEqual(errors, [])
  if (process.env.ITATEST_TEST_CAPTURE !== '0') await page.screenshot({ path: artifact('consecutive-notes.png'), fullPage: true })
  writeFileSync(artifact('consecutive-notes-result.json'), JSON.stringify({ success: true, persistedNotes: 5, checked: ['three consecutive creations', 'edit then create', 'failed request retry', 'delete then create', 'reload persistence'], browserErrors: errors }, null, 2))
  console.log('Notes checks passed: consecutive notes, editing, retry, deletion and five distinct notes persisted after reload.')
} finally { await browser.close() }
