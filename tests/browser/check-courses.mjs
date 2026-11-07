import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { api, root, artifact, browserOptions, requireLocalPreview } from './environment.mjs'

await requireLocalPreview()
const response = await fetch(api + '/curriculum')
assert.equal(response.status, 200)
const curriculum = await response.json()
assert.equal(curriculum.courses.length, 5)
assert.equal(curriculum.documents.length, 39)
const browser = await chromium.launch(browserOptions)
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 950 } })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  for (const path of ['/', '/package', '/exam']) {
    await page.goto(root + path)
    await page.locator('[data-course]').last().waitFor()
    assert.equal(await page.locator('[data-course]').count(), 5)
    for (const course of curriculum.courses)
      assert.equal(await page.locator(`[data-course="${course.code}"] h3`).innerText(), course.title)
  }
  for (const course of curriculum.courses) {
    await page.goto(`${root}/courses/${course.code}`)
    await page.getByRole('heading', { name: course.title, exact: true }).waitFor()
    assert.equal(await page.locator('details').count(), curriculum.chapters.filter(ch => ch.courseCode === course.code).length)
    assert.equal(await page.getByRole('link', { name: 'شروع مطالعه', exact: true }).count(), 0)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(root + '/package')
  await page.locator('[data-course]').last().waitFor()
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  await page.screenshot({ path: artifact('source-courses-mobile.png'), fullPage: true })
  await page.route('**/api/cent/v1/curriculum', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Course catalog unavailable' }) }))
  await page.reload()
  await page.getByRole('alert').filter({ hasText: 'Course catalog unavailable' }).waitFor()
  assert.equal(await page.locator('[data-course]').count(), 0)
  await page.unroute('**/api/cent/v1/curriculum')
  const { documents: omittedDocuments, ...oldCurriculum } = curriculum
  assert.ok(omittedDocuments.length)
  await page.route('**/api/cent/v1/curriculum', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(oldCurriculum) }))
  await page.reload()
  await page.getByRole('alert').waitFor()
  assert.ok((await page.locator('body').innerText()).length > 100)
  assert.equal(await page.locator('[data-course]').count(), 0)
  assert.deepEqual(errors, [])
  writeFileSync(artifact('source-courses-result.json'), JSON.stringify({ success: true, courses: curriculum.courses.map(c => c.code), sourceDocuments: curriculum.documents.length, verified: ['public-home', 'catalog', 'course-introduction', 'all-course-outlines', 'mobile', 'api-error-without-demo-fallback', 'lesson-access-protection'] }, null, 2))
  console.log('Source course browser checks passed: five backend courses on every public listing, correct outlines, mobile layout and no demo fallback.')
} finally { await browser.close() }
