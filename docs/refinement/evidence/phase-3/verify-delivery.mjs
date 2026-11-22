import fs from 'node:fs'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
const out='docs/refinement/evidence/phase-3/'
const before=JSON.parse(fs.readFileSync(out+'protected-before.json'))
const changed=Object.keys(before).filter(f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')!==before[f])
assert.deepEqual(changed,[],'Protected auth/service/component/brand/theme files unchanged')
const original=f=>execFileSync('git',['show','HEAD:'+f],{encoding:'utf8'}).replace(/\r\n/g,'\n')
const current=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n')
const beforeRender=s=>s.slice(s.indexOf('export function'),s.indexOf('  return <'))
for(const file of ['src/pages/public/LoginPage.tsx','src/pages/public/GoogleCallbackPage.tsx'])assert.equal(beforeRender(current(file)),beforeRender(original(file)),file+' state/effect/submission logic')
const details=s=>s.slice(s.indexOf('export function CourseDetails')).replace('narrow-page public-course-page','narrow-page')
assert.equal(details(current('src/pages/CourseCatalog.tsx')),details(original('src/pages/CourseCatalog.tsx')),'Course access/fetch/product logic unchanged')
assert.equal(current('src/main.tsx').replace("import './public.css'\n",''),original('src/main.tsx'))
assert.ok(!/#[\da-f]{3,8}\b|rgba?\(|gradient\(/i.test(current('src/public.css')),'Public composition reuses semantic colors')
const branch=execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim()
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()
const initial=JSON.parse(fs.readFileSync(out+'git-before.json'))
assert.equal(branch,'main');assert.equal(head,initial.head)
assert.equal(execFileSync('git',['diff','--cached','--name-only'],{encoding:'utf8'}).trim(),'')
execFileSync('git',['diff','--check'],{stdio:'pipe'})
for(const dir of ['dist','.preview-artifacts/phase3-root']){
 assert.ok(fs.existsSync(dir+'/index.html'))
 assert.equal(fs.existsSync(dir+'/component-reference.html'),false)
 assert.equal(fs.existsSync(dir+'/docs/refinement/evidence/phase-3/index.html'),false)
 assert.deepEqual(fs.readFileSync(dir+'/_headers'),fs.readFileSync('public/_headers'))
}
const result={success:true,branch,head,protectedFileCount:Object.keys(before).length,changed,authLogicUnchanged:true,courseAccessLogicUnchanged:true,mainChange:'One public CSS import only; early callback capture/theme unaffected',backend:'No backend repository access or edit; existing local preview reused',production:'Both outputs contain original security headers; development references/evidence not copied',staged:false}
fs.writeFileSync(out+'delivery-verification.json',JSON.stringify(result,null,2))
fs.writeFileSync(out+'changed-files.txt',execFileSync('git',['status','--short','--untracked-files=all'],{encoding:'utf8'}))
