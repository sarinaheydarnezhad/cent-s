/* global console */
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
const out=path.dirname(fileURLToPath(import.meta.url)),parent=path.dirname(out),docs=path.resolve(out,'../../..')
const names=['PHASE_1_REPORT.md','VISUAL_REVIEW.md','DESIGN_SYSTEM.md','DECISION_LOG.md','OPEN_QUESTIONS.md','PROGRAM_STATUS.md','LOGO_REVIEW_REPORT.md']
const spacing={'20new':'20 new','124unit':'124 unit','124passed':'124 passed','7files':'7 files','9appearance':'9 appearance','9groups':'9 groups','10asset':'10 asset','10checks':'10 checks','14protected':'14 protected','0errors':'0 errors','0warnings':'0 warnings','0uncaught':'0 uncaught','0document':'0 document','10appearance':'10 appearance','45-degree':'45-degree','symmetric45':'symmetric 45','exact45':'exact 45','Phase1':'Phase 1','Phase2':'Phase 2','existing93':'existing 93','154global':'154 global','at390':'at 390','and1440':'and 1440','silhouette248':'silhouette 248','approximately248':'approximately 248','monochrome/inverted and favicon; PNG':'monochrome/inverted and favicon; PNG'}
const broken=[]
for(const name of names) {
  const file=path.join(docs,name)
  let content=fs.readFileSync(file,'utf8')
  for(const [before,after] of Object.entries(spacing))content=content.replaceAll(before,after)
  fs.writeFileSync(file,content)
  for(const match of content.matchAll(/\]\(([^)]+)\)/g)) {
    const link=match[1]
    if(/^(https?:|#)/.test(link))continue
    if(!fs.existsSync(path.resolve(docs,decodeURI(link.split('#')[0]))))broken.push({file:name,link})
  }
}
assert.deepEqual(broken,[])
const manifestFile=path.join(parent,'deliverables-manifest.json')
const archive=path.join(out,'before/deliverables-manifest.json')
if(!fs.existsSync(archive))fs.copyFileSync(manifestFile,archive)
const manifest=JSON.parse(fs.readFileSync(archive,'utf8'))
for(const item of manifest.screenshots)if(['logo-comparison.png','visual-comparisons.png'].includes(item.file)) {
  item.sha256=createHash('sha256').update(fs.readFileSync(path.join(parent,item.file))).digest('hex')
  item.kind=item.file==='logo-comparison.png'?'Original/recolored/brand-board reference review and refined flat SVG browser rendering':'Actual preserved Phase 0 and latest refined-logo light/dark screenshots; reader remains historical'
}
manifest.notes='Original Phase 1 screenshot set retained; two comparison images updated for supplied original/brand-board references. Old comparison images and original manifest archived in logo-review/before. Twenty new actual local page captures are indexed separately at logo-review/screenshots.json. Local fixture names/order data are synthetic. No generated mockups or credentials/session tokens.'
fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2))
fs.writeFileSync(path.join(out,'documentation-check.json'),JSON.stringify({reviewedDocuments:names,brokenLinks:broken,priorComparisonManifestPreserved:true},null,2))
console.log(JSON.stringify({documents:names.length,brokenLinks:broken.length,updatedComparisonEntries:2}))
