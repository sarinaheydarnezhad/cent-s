import fs from 'node:fs'
const directory='docs/refinement/evidence/phase-1'
const report=JSON.parse(fs.readFileSync(`${directory}/qualified-helper-lint-initial.json`,'utf8'))
for(const row of report) {
  const names=[...new Set(row.messages.filter(m=>m.ruleId==='no-undef').map(m=>m.message.match(/'([^']+)'/)[1]))]
  if(names.length)fs.writeFileSync(row.filePath,`/* global ${names.join(', ')} */\n`+fs.readFileSync(row.filePath,'utf8'))
}
for(const name of ['phase1-safe-notes-result.json','phase1-targeted-recovery-result.json']) {
  const source=`tests/browser/artifacts/${name}`
  if(fs.existsSync(source))fs.copyFileSync(source,`${directory}/${name}`)
}
