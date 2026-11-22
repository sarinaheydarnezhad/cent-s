import fs from 'node:fs'
import path from 'node:path'
const root=path.resolve('docs/refinement'),out=path.join(root,'evidence/phase-1')
for(const name of ['PROGRAM_STATUS-before.md','DESIGN_SYSTEM-before.md']) {
  const file=path.join(out,name)
  let text=fs.readFileSync(file,'utf8')
  if(!text.includes('Snapshot links rebased')) {
    text=text.replace(/\]\(([^)]+)\)/g,(match,target)=>/^(?:https?:|#|\/)/.test(target)?match:`](../../${target})`)
    fs.writeFileSync(file,'<!-- Snapshot links rebased from docs/refinement; historical content retained. -->\n'+text)
  }
}
const broken=[]
for(const directory of [root,out])for(const entry of fs.readdirSync(directory,{withFileTypes:true})) {
  if(!entry.isFile()||!entry.name.endsWith('.md'))continue
  const file=path.join(directory,entry.name),source=fs.readFileSync(file,'utf8')
  for(const match of source.matchAll(/\]\(([^)]+)\)/g)) {
    const target=match[1].replace(/^<|>$/g,'')
    if(/^(?:https?:|#)/.test(target))continue
    if(!fs.existsSync(path.resolve(directory,target.split('#')[0])))broken.push({file,target})
  }
}
const report={brokenLinks:broken,coreFiles:['PHASE_1_REPORT.md','POST_GIS_CHECKPOINT.md','DESIGN_SYSTEM.md','PROGRAM_STATUS.md'].map(name=>({name,exists:fs.existsSync(path.join(root,name))}))}
fs.writeFileSync(path.join(out,'documentation-validation.json'),JSON.stringify(report,null,2))
if(broken.length)throw Error(`${broken.length} broken documentation links`)
