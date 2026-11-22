/* global console */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
const out='docs/refinement/evidence/phase-2'
const hashes=JSON.parse(fs.readFileSync(`${out}/protected-before.json`,'utf8'))
const protection=Object.entries(hashes).map(([file,before])=>({file,unchanged:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')===before}))
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)])
const built=walk('dist')
const distinctive=['A shared language for the next step.','CALM INTELLIGENCE / LOCAL DEVELOPMENT','reference-shell','component-reference.tsx']
const production={referenceFiles:built.filter(x=>/component-reference|reference\.css/.test(x)),leakedContent:[]}
for(const file of built.filter(x=>/\.(js|css|html)$/.test(x)))for(const text of distinctive)if(fs.readFileSync(file,'utf8').includes(text))production.leakedContent.push({file,text})
const backend=execFileSync('git',['-c','safe.directory=D:/Lerona/Backend','-C','D:/Lerona/Backend','status','--short'],{encoding:'utf8'}).trim()
const result={branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),staged:execFileSync('git',['diff','--cached','--name-only'],{encoding:'utf8'}).trim(),backendStatus:backend,protection,production,qualification:'Raw hashes protect GIS/services/session/router/appearance/headers/config/package/brand. Backend source is read-only. Backend tests were not rerun; earlier prebuilt results are historical evidence only.'}
fs.writeFileSync(`${out}/delivery-verification.json`,JSON.stringify(result,null,2))
fs.writeFileSync(`${out}/changed-files.txt`,execFileSync('git',['status','--short','--untracked-files=all'],{encoding:'utf8'}))
if(result.branch!=='main'||backend||result.staged||protection.some(x=>!x.unchanged)||production.referenceFiles.length||production.leakedContent.length)throw Error('Delivery boundary failure; inspect verification JSON')
execFileSync('git',['diff','--check'],{encoding:'utf8'})
console.log(`Delivery boundaries pass; ${protection.length} raw protected-file hashes; production reference absent; main, nothing staged, backend clean`)
