import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'

const root = 'http://127.0.0.1:5124/api/cent/v1'
const fixtures = JSON.parse(readFileSync('.preview-artifacts/reader-phase4-final-build/bin/Cent.Preview/debug/App_Data/isolated/admin-fixtures.json', 'utf8'))
const learner = fixtures.find(f => f.role === 'STUDENT')
async function get(path, token = learner.token) {
  return fetch(root + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
}
const catalog = await (await get('/curriculum')).json()
const doc = catalog.documents.find(d => catalog.courses.some(c => c.code === 'chemistry' && c.trainingId === d.trainingId))
const rows = await (await get(`/documents/${doc.id}/source-sections`)).json()
assert.ok(rows.length === 50 && rows.every(s => !s.text && s.delivery === 'section-v1'))
const started = performance.now()
const responses = await Promise.all(rows.slice(0, 18).map(s => get(`/documents/${doc.id}/source-sections/${s.id}`)))
const statuses = responses.map(r => r.status)
const burstElapsedMs = Math.round(performance.now() - started)
assert.ok(statuses.every(s => s === 200 || s === 429), statuses.join(','))
assert.ok(statuses.includes(429), 'Database-backed burst/enumeration protection must reject the burst')
for (const response of responses) {
  assert.match(response.headers.get('cache-control'), /no-store/)
  if (response.status === 429) assert.ok(Number(response.headers.get('retry-after')) > 0)
  else {
    const body = await response.json()
    assert.match(body.watermark, /^IT-[a-f0-9]{32}$/)
    assert.ok(!JSON.stringify(body).includes(learner.token))
  }
}
const assessmentResponse = await get('/reviewed-assessments/')
assert.equal(assessmentResponse.status, 200)
const assessments = await assessmentResponse.json()
assert.equal(assessments.length, 42)
assert.ok(assessments.every(a => !('questionIds' in a) && !('correctAnswer' in a)))
const reading = assessments.find(a => a.subject === 'reading')
const attempt = await fetch(root + `/reviewed-assessments/${reading.id}/start`, { method: 'POST', headers: { Authorization: `Bearer ${learner.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: crypto.randomUUID() }) })
assert.equal(attempt.status, 200, await attempt.clone().text())
const issued = await attempt.json()
assert.equal(issued.questions.length, 10); assert.equal(issued.passages.length, 2)
assert.ok(!/"(?:correctAnswer|explanation|correctOptionText|solution)"/i.test(JSON.stringify(issued)))
assert.equal((await get(`/attempts/${issued.id}`)).status, 404)
assert.equal((await get(`/reviewed-assessments/`, null)).status, 401)
for (const path of ['/docs/Lessons/Itatest-Mathematics-Minimal-Corrections-v1.zip', '/Backend/backend/Cent.Module/Content/reviewed-v4.json', '/docs/educational-reader-pilot/phase-4/package-validation.json']) {
  const response = await fetch('http://127.0.0.1:5194' + path)
  const bytes = new Uint8Array(await response.arrayBuffer())
  assert.ok(response.status === 404 || response.headers.get('content-type')?.includes('text/html'))
  assert.ok(!(bytes[0] === 80 && bytes[1] === 75), 'Private ZIP must never be served')
}
writeFileSync('docs/educational-reader-pilot/phase-4/verification/http-security-results.json', JSON.stringify({ passed: true, concurrentRequests: statuses.length, statuses, burstElapsedMs, totalElapsedMs: Math.round(performance.now() - started), assessmentDefinitions: assessments.length, readingKeysHidden: true, anonymousDenied: true, privateBuildPathsExcluded: true }, null, 2))
console.log('Phase 4 concurrent protection, assessment secrecy and private build checks passed')
