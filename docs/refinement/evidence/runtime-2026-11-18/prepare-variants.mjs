import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
const source = 'D:/app/itatest/tests/browser'
const destination = path.dirname(fileURLToPath(import.meta.url))
function imports(code) {
  return code.replace("from 'playwright'", `from '${pathToFileURL(source + '/node_modules/playwright/index.mjs').href}'`)
    .replace("from './environment.mjs'", `from '${pathToFileURL(source + '/environment.mjs').href}'`)
}
let notes = fs.readFileSync(source + '/check-notes.mjs', 'utf8')
const begin = notes.indexOf('  // Deleting the selected note')
const end = notes.indexOf('  assert.deepEqual(errors, [])', begin)
if (begin < 0 || end < 0) throw Error('Notes boundaries missing')
notes = notes.slice(0, begin) + `  await page.reload()
  await page.locator(noteText).filter({ hasText: 'Note after retry' }).waitFor()
  const stored = await request(\`/documents/\${doc.id}\`, learner.token)
  assert.equal(stored.notes.length, 5)
  assert.equal(new Set(stored.notes.map(n => n.id)).size, 5)
  assert.deepEqual(stored.notes.map(n => n.body).sort(), ['Consecutive note 1 edited', 'Consecutive note 2', 'Consecutive note 3', 'New note after editing', 'Note after retry'].sort())
` + notes.slice(end)
notes = notes.replace("'delete then create', ", '').replace('deletion and five distinct notes', 'five distinct notes')
notes = notes.replaceAll('consecutive-notes', 'phase0-safe-notes')
fs.writeFileSync(destination + '/safe-notes.mjs', imports(notes))
let recovery = fs.readFileSync(source + '/check-recovery.mjs', 'utf8')
recovery = "import { readFileSync } from 'node:fs'\n" + recovery
recovery = recovery.replace("const student=await login(users.find(u=>u.role==='STUDENT').email)", `const fixture=JSON.parse(readFileSync('${source}/artifacts/result.json','utf8'))
const orders=await fetch(api+'/admin/orders',{headers:{Authorization:'Bearer '+admin.token}}).then(r=>r.json())
const ownOrder=orders.find(o=>o.trainingId===fixture.trainingId)
if(!ownOrder)throw Error('This smoke fixture has no order')
const ownStudent=users.find(u=>u.id===ownOrder.userId)
if(!ownStudent?.email.startsWith('study-'))throw Error('Not a smoke learner')
const student=await login(ownStudent.email)`)
recovery = recovery.replaceAll('recovery-result', 'phase0-targeted-recovery-result').replace('reader-final.png','phase0-targeted-recovery.png')
fs.writeFileSync(destination + '/targeted-recovery.mjs', imports(recovery))
let study = fs.readFileSync(source + '/check-study-return.mjs', 'utf8')
study = study.replace("  assert.equal(await page.getByLabel('انتخاب صفحه').inputValue(), String(pageNumber))", "  await page.waitForFunction(n => document.querySelector('select[aria-label=\"انتخاب صفحه\"]')?.value === String(n), pageNumber)\n  assert.equal(await page.getByLabel('انتخاب صفحه').inputValue(), String(pageNumber))")
study = study.replaceAll('study-return-page.png', 'phase0-study-return-settled.png').replaceAll('study-return-result.json', 'phase0-study-return-settled-result.json')
fs.writeFileSync(destination + '/study-return-settled.mjs', imports(study))
console.log('Prepared audit-only variants; original test files unchanged; notes deletion omitted; recovery targets the smoke learner; study waits for loaded reader page.')
