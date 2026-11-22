/* global console */
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs'

const base='docs/refinement/evidence/phase-4/'
const json=name=>JSON.parse(readFileSync(base+name,'utf8'))
const log=name=>{const bytes=readFileSync(base+name);return bytes[0]===255&&bytes[1]===254?bytes.toString('utf16le'):bytes.toString('utf8')}
const development=json('dashboard-development-result.json'),root=json('dashboard-root-result.json')
const accessibility=json('accessibility-development-result.json'),rootAccessibility=json('accessibility-root-result.json')
const appearance=json('appearance-development-result.json'),rootAppearance=json('appearance-root-result.json')
const delivery=json('delivery-verification.json'),lint=json('focused-lint.json')
for(const result of [development,root,accessibility,rootAccessibility,appearance,rootAppearance,delivery])assert.equal(result.success,true)
assert.equal(development.checks.length,13);assert.equal(root.checks.length,13)
assert.equal(development.screenshots.length,13);assert.equal(root.screenshots.length,0)
assert.equal(accessibility.measurements.length,rootAccessibility.measurements.length)
for(const theme of ['light','dark'])assert.ok(accessibility.measurements.some(pair=>pair.theme===theme&&pair.selector==='.student-priority-list a'))
for(const entry of lint){assert.equal(entry.errorCount,0);assert.equal(entry.warningCount,0)}
const legacy=json('legacy-assessment-lint.json'),baseline=json('baseline-assessment-lint.json')
const messages=result=>result.flatMap(row=>row.messages.map(message=>({rule:message.ruleId,severity:message.severity,text:message.message.split('\n')[0]})))
assert.deepEqual(messages(legacy),messages(baseline));assert.equal(legacy[0].errorCount,1)
assert.match(log('unit.log'),/Tests\s+156 passed/)
for(const name of ['build-default.log','build-root.log'])assert.match(log(name),/built in/)
for(const theme of ['light','dark','root']){
 assert.match(log(`google-gis-${theme}.log`),/passed \(16 scenarios\)/)
 assert.match(log(`google-auth-${theme}.log`),/passed \(9 scenarios\)/)
}
for(const capture of development.screenshots)assert.ok(existsSync(base+capture.path))
const names=readdirSync(base).filter(name=>name.endsWith('.png'))
assert.equal(names.length,13);assert.ok(names.every(name=>name.startsWith('after-')))
const summary={success:true,unitTests:156,unitFiles:9,newPresentationTests:8,mockedAuthExecutions:75,dashboardGroupsPerEnvironment:13,responsiveObservationsPerEnvironment:development.observations.length,renderedContrastPairsPerEnvironment:accessibility.measurements.length,appearanceGroupsPerEnvironment:5,productionBases:['/cent-s/','/'],focusedLintFiles:lint.length,focusedLintErrors:0,preservedAssessmentLintErrors:1,afterScreenshots:13,protectedFiles:Object.keys(delivery.hashes).length,noBeforeCaptures:true,noMatchedPairs:true,noCommitPushDeploy:true,phase5Started:false}
writeFileSync(base+'validation-summary.json',JSON.stringify(summary,null,2))
for(const name of ['PROGRAM_STATUS.md','PROGRAM_BRIEF.md','IMPLEMENTATION_PLAN.md','DECISION_LOG.md','DESIGN_SYSTEM.md','COMPONENT_USAGE_GUIDE.md','FEEDBACK_PATTERNS.md','UX_WRITING.md','ACCEPTANCE_CRITERIA.md','AUDIT_COVERAGE.md','REGRESSION_REPORT.md','VISUAL_REVIEW.md','OPEN_QUESTIONS.md','COMPONENT_INVENTORY.md']){
 const path='docs/refinement/'+name
 let text=readFileSync(path,'utf8').replace('Phase 4 alone is authorized:','Phase 4 is implemented for explicit visual approval. Its authorized scope is:')
 if(['PROGRAM_STATUS.md','REGRESSION_REPORT.md','AUDIT_COVERAGE.md'].includes(name)&&!text.includes('Phase 4 validation:'))text=text.replace('\n---\n',`\nPhase 4 validation: 156 unit tests; 75 mocked authentication executions; TypeScript and both production bases; 13 dashboard groups and 26 responsive observations per environment; ${summary.renderedContrastPairsPerEnvironment} rendered contrast pairs per environment; 5 appearance groups per environment; connected personal-progress/account-isolation regression. New presentation/helpers lint is clean; one unchanged assessment-effect error matches HEAD. 13 AFTER-only screenshots; 26 protected files and excluded workflow bodies preserved. See the report for evidence and retained limitations. Await explicit visual approval; Phase 5 has not started.\n\n---\n`)
 writeFileSync(path,text)
}

const descriptions={
 'dashboard-connected-light-1440':'Returning learner / Light / Desktop',
 'dashboard-connected-dark-1440':'Returning learner / Dark / Desktop',
 'dashboard-connected-light-390':'Returning learner / Light / Mobile',
 'dashboard-connected-dark-390':'Returning learner / Dark / Mobile',
 'navigation-dark-390':'Student navigation / Dark / Mobile',
 'account-connected-dark-390':'Read-only account / Dark / Mobile',
 'account-connected-light-1440':'Read-only account / Light / Desktop',
 'dashboard-new-connected-dark-390':'New learner / Dark / Mobile',
 'dashboard-new-connected-light-1440':'New learner / Light / Desktop',
 'dashboard-loading-injected-light-390':'INJECTED delayed mastery / Light / Mobile',
 'dashboard-recovery-injected-dark-390':'INJECTED library failure / Dark / Mobile',
 'dashboard-unmapped-injected-light-390':'INJECTED unknown recommendation code / Light / Mobile',
 'dashboard-curriculum-unavailable-injected-light-390':'INJECTED unavailable curriculum / Light / Mobile',
}
const escape=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const cards=development.screenshots.map(capture=>{
 const title=descriptions[capture.state]||capture.state
 return `<article><h2>${escape(title)}</h2><p>${capture.state.includes('injected')?'Explicitly injected browser state; not a server outcome.':'Connected isolated-preview test account; real local API response. Synthetic student, development mock purchase; no production/student data.'}</p><a href="${escape(capture.path)}"><img loading="lazy" src="${escape(capture.path)}" alt="${escape(title)} — implemented Phase 4 AFTER screenshot"></a><a class="original" href="${escape(capture.path)}">Open original screenshot</a></article>`
}).join('\n')
writeFileSync(base+'index.html',`<!doctype html><html lang="en" dir="ltr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Itatest Phase 4 — AFTER review</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f7f7;color:#29343c;font:16px/1.65 system-ui,sans-serif}header,main{max-width:1400px;margin:auto;padding:24px}header{padding-bottom:8px}h1{font-size:28px;margin:0 0 12px}h2{font-size:18px;margin:0}p{margin:8px 0 16px}a{color:#3d5667}a:focus-visible{outline:3px solid #4d687a;outline-offset:4px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}article{min-width:0;background:white;padding:20px;border:1px solid #e0e4e6;border-radius:16px}article p{font-size:14px;color:#5e6d77}img{display:block;width:100%;height:480px;object-fit:contain;object-position:top;background:#edf1f2;border-radius:8px}.original{display:inline-flex;min-height:44px;align-items:center}@media(max-width:760px){.grid{grid-template-columns:1fr}header,main{padding:16px}img{height:auto;max-height:700px}}</style><header><h1>Itatest Phase 4 — AFTER review</h1><p>Student dashboard, navigation and read-only account presentation. Phases 3 and 3.1 are visually approved and closed with their documented technical limits retained. Phase 4 awaits explicit visual approval; Phase 5 has not started.</p><p>13 new AFTER screenshots only. No new BEFORE captures or matched comparison pairs. All students are isolated local preview fixtures. Progress, results, dates, source titles and saved page values are actual responses from that preview. The returning account has a submitted practice outcome and a mock-paid existing resource. The new account has no result or study history. INJECTED states are labeled explicitly.</p><p>Review hierarchy, Slate/Sage roles, honest progress and recommendations, resume access, responsive navigation and read-only identity. Purchase/subscription sections shown below the identity card retain their existing Phase 7 presentation and limitations. No production, real Google or full WCAG/cross-browser claim follows from this evidence.</p><p><a href="../../PHASE_4_REPORT.md">Full Phase 4 report</a> · <a href="validation-summary.json">Validation summary</a> · <a href="dashboard-development-result.json">Connected and injected checks</a> · <a href="accessibility-development-result.json">Representative accessibility measurements</a></p></header><main class="grid">${cards}</main></html>`)

writeFileSync(base+'README.md',`# Phase 4 evidence\n\nOpen [AFTER review gallery](index.html) or [Phase 4 report](../../PHASE_4_REPORT.md).\n\n13 new AFTER captures only; no new before captures or matched pairs. Connected screenshots use synthetic isolated-preview students with real saved local API data. Purchase setup is DEVELOPMENT_MOCK only. Injected loading/failure/mapping states are explicitly labeled. Four additional injected states (assessment unavailable, mastery unavailable, incomplete guidance and owned resources without history) are assertion-only to minimize screenshots. Tokens/credentials and fixture session records remain in ignored .preview-artifacts, outside this evidence folder.\n\n[Summary](validation-summary.json), [development dashboard](dashboard-development-result.json), [root dashboard](dashboard-root-result.json), [development accessibility](accessibility-development-result.json), [root accessibility](accessibility-root-result.json), [protected boundaries](delivery-verification.json), [focused lint](focused-lint.json). Unit/build/auth/appearance and connected personal-progress logs are retained beside these files. Legacy assessment lint and its exact HEAD baseline are recorded separately; they are not new failures.\n\nInitial checks exposed whitespace in actual recommendation codes, an inherited sidebar caption color, and inherited visibility transitions interfering with focus. All corrected in the tested final presentation; the shared disclosure hook remains unchanged. An intermediate injection helper attempted to parse a raced routed response; injected variants now use explicit snapshots of actual connected fixture data. The authentication mocks now return the correct empty mastery contract rather than a generic array, correcting an intermediate mock-only dashboard render error. All 75 auth executions were repeated; existing assertions remain intact.\n`)
console.log(`Review finalized: ${summary.dashboardGroupsPerEnvironment} dashboard groups per environment, ${summary.afterScreenshots} AFTER screenshots.`)
