/* global console */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
const out='docs/refinement/evidence/phase-2'
const documents=['PROGRAM_BRIEF','PROGRAM_STATUS','DECISION_LOG','DESIGN_SYSTEM','UX_WRITING','ACCEPTANCE_CRITERIA','AUDIT_COVERAGE','REGRESSION_REPORT','VISUAL_REVIEW','OPEN_QUESTIONS','IMPLEMENTATION_PLAN','PHASE_2_REPORT','COMPONENT_INVENTORY','COMPONENT_USAGE_GUIDE','FEEDBACK_PATTERNS']
const failures=[]
for(const name of documents) {
 const file=`docs/refinement/${name}.md`;const source=fs.readFileSync(file,'utf8')
 for(const match of source.matchAll(/\]\(([^)]+)\)/g)) {
  const target=match[1].replace(/^<|>$/g,'').split('#')[0]
  if(!target||/^[a-z]+:/i.test(target))continue
  const resolved=path.resolve(path.dirname(file),decodeURI(target))
  if(!fs.existsSync(resolved))failures.push({file,target})
 }
}
const html=fs.readFileSync(`${out}/index.html`,'utf8')
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
 const target=match[1];if(!target||target.startsWith('#')||/^[a-z]+:/i.test(target))continue
 if(!fs.existsSync(path.resolve(out,target)))failures.push({file:'index.html',target})
}
const report=fs.readFileSync('docs/refinement/PHASE_2_REPORT.md','utf8')
const headings=[...report.matchAll(/^## (\d+)\./gm)].map(x=>Number(x[1]))
if(headings.length!==25||headings.some((x,i)=>x!==i+1))failures.push({reportHeadings:headings})
const result={success:failures.length===0,documents:documents.length,reportSections:headings.length,matchedBeforeAfterPairs:(html.match(/class="pair"/g)||[]).length,failures}
fs.writeFileSync(`${out}/documentation-validation.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1
