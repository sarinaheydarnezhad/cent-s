/* global console */
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs'

const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).replace(/\r\n/g,'\n')
const current=path=>readFileSync(path,'utf8').replace(/\r\n/g,'\n')
const head=path=>git('show',`HEAD:${path}`)
const checks=[]
const protectedFiles=['src/App.tsx','src/state/AppState.tsx','src/services/cent.ts','src/services/scoring.ts','src/services/study-return.ts','src/pages/StudyReader.tsx','src/pages/PersonalResults.tsx','src/pages/LearningProgress.tsx','src/components/ProtectedRoute.tsx','src/components/useNavigationDisclosure.ts','src/components/AppearanceControl.tsx','src/components/GoogleSignIn.tsx','src/components/Brand.tsx','src/pages/public/LoginPage.tsx','src/pages/public/GoogleCallbackPage.tsx','public/appearance.js','public/_headers','package.json','package-lock.json','vite.config.ts','src/foundations.css','src/foundation-ui.css','src/public.css','src/styles.css','src/cent.css','src/pages/admin/CentAdmin.tsx']
const hashes={}
for(const path of protectedFiles){assert.equal(current(path),head(path),path);hashes[path]=createHash('sha256').update(readFileSync(path)).digest('hex')}
checks.push(`${protectedFiles.length} protected route, session, service, reader, results, appearance, brand, admin and configuration files match HEAD`)
const practice=current('src/pages/PracticePages.tsx'),originalPractice=head('src/pages/PracticePages.tsx')
assert.equal(practice.slice(practice.indexOf('export function CentExamPage')),originalPractice.slice(originalPractice.indexOf('export function CentExamPage')))
checks.push('All assessment, simulator, result and submission functions remain byte-equivalent after newline normalization; only dashboard implementation/imports are replaced')
const commerce=current('src/pages/CommercePages.tsx'),originalCommerce=head('src/pages/CommercePages.tsx')
assert.equal(commerce.slice(commerce.indexOf('export function CatalogPage'),commerce.indexOf('export function AccountPage')),originalCommerce.slice(originalCommerce.indexOf('export function CatalogPage'),originalCommerce.indexOf('export function AccountPage')))
const account=commerce.slice(commerce.indexOf('export function AccountPage')),originalAccount=originalCommerce.slice(originalCommerce.indexOf('export function AccountPage'))
assert.equal(account.slice(0,account.indexOf('  return')),originalAccount.slice(0,originalAccount.indexOf('  return')))
assert.equal(account.slice(account.indexOf('<section className="cent-membership">')),originalAccount.slice(originalAccount.indexOf('<section className="cent-membership">')))
checks.push('Commerce, library and notes page functions, account data hooks, membership and order markup match HEAD')
for(const path of ['tests/browser/check-google-gis.mjs','tests/browser/check-google-auth.mjs'])assert.equal(current(path).replace("    if (path === '/me/mastery') return send({ courses: [] })\n",''),head(path))
checks.push('Authentication test changes add only the previously missing mastery response fixture; every existing assertion and scenario remains unchanged')
assert.equal(current('src/main.tsx').replace("import './student.css'\n",''),head('src/main.tsx'))
assert.equal(git('diff','--cached','--name-only'),'')
assert.ok(git('rev-parse','HEAD').trim().startsWith('1ed76ee'))
assert.equal(git('branch','--show-current').trim(),'main')
git('-c','core.safecrlf=false','diff','--check')
for(const path of ['dist','.preview-artifacts/phase4-root']){
 assert.ok(existsSync(`${path}/index.html`))
 assert.equal(readFileSync(`${path}/_headers`,'utf8'),readFileSync('public/_headers','utf8'))
 assert.equal(existsSync(`${path}/component-reference.html`),false)
 assert.equal(existsSync(`${path}/docs`),false)
 for(const asset of ['brand/symbol.svg','brand/symbol-dark.svg','images/hero-colosseum.webp','images/hero-underline.webp'])assert.deepEqual(readFileSync(`${path}/${asset}`),readFileSync(`public/${asset}`))
}
checks.push('Both production outputs preserve headers/brand/public artwork and exclude the development reference and documentation')
mkdirSync('.preview-artifacts/phase4-baseline',{recursive:true})
writeFileSync('.preview-artifacts/phase4-baseline/PracticePages.tsx',head('src/pages/PracticePages.tsx'))
writeFileSync('docs/refinement/evidence/phase-4/delivery-verification.json',JSON.stringify({success:true,head:git('rev-parse','HEAD').trim(),branch:'main',checks,hashes,scope:'No commit/push/deploy or backend repository source/configuration/build operation. Test fixtures use supported isolated-preview APIs only.'},null,2))
console.log(`Delivery boundary verification passed (${checks.length} groups).`)
