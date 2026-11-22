/* global document, window, innerWidth, fetch, URL */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import ts from 'typescript'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
const out = 'docs/refinement/evidence/phase-2'
const protectedFiles = ['src/components/GoogleSignIn.tsx', 'src/state/AppState.tsx', 'src/App.tsx', 'src/services/cent.ts', ...fs.readdirSync('src/services').filter(x => x.startsWith('google-')).map(x => 'src/services/' + x), 'public/appearance.js', 'public/_headers', 'vite.config.ts', 'package-lock.json', 'package.json', ...fs.readdirSync('public/brand').map(x => 'public/brand/' + x)]
const hashes = Object.fromEntries(protectedFiles.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))
fs.writeFileSync(`${out}/protected-before.json`, JSON.stringify(hashes, null, 2))
fs.writeFileSync(`${out}/git-before.json`, JSON.stringify({ branch: execFileSync('git', ['branch', '--show-current'], {encoding:'utf8'}).trim(), head: execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'}).trim(), status: execFileSync('git', ['status', '--short'], {encoding:'utf8'}).trim(), backend:execFileSync('git',['-c','safe.directory=D:/Lerona/Backend','-C','D:/Lerona/Backend','status','--short'],{encoding:'utf8'}).trim() }, null, 2))
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x => x.isDirectory() ? walk(path.join(dir,x.name)) : [path.join(dir,x.name)]) }
const inventory = walk('src').filter(x=>/\.tsx$/.test(x)).map(file=>{
  const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
  const tags={}, classes={}, imports=[]
  function visit(node) {
    if(ts.isImportDeclaration(node)) imports.push(node.moduleSpecifier.text)
    if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)) {
      const name=node.tagName.getText(source);tags[name]=(tags[name]||0)+1
      for(const attr of node.attributes.properties) if(ts.isJsxAttribute(attr)&&attr.name.getText(source)==='className'&&attr.initializer&&ts.isStringLiteral(attr.initializer)) for(const cls of attr.initializer.text.split(/\s+/)) classes[cls]=(classes[cls]||0)+1
    }
    ts.forEachChild(node,visit)
  } visit(source)
  return {file,tags,classes,imports}
})
fs.writeFileSync(`${out}/source-before.json`,JSON.stringify(inventory,null,2))
const status=await (await fetch('http://127.0.0.1:5108/api/cent/v1/status')).json()
if(status.payments!=='DEVELOPMENT_MOCK')throw Error('Local mock preview required')
fs.writeFileSync(`${out}/preview-status.json`,JSON.stringify({status, binary:'D:/app/itatest/.preview-artifacts/bin/Cent.Preview/debug/Cent.Preview.dll', database:'D:/app/itatest/.preview-artifacts/bin/Cent.Preview/debug/App_Data/preview.db', qualification:'Existing isolated frontend-local binary/database; no rebuild, migration or backend source edit.'},null,2))
const browser=await chromium.launch({channel:'chrome',headless:true})
try {
 const context=await browser.newContext()
 await context.route('**/*',route=>{const u=new URL(route.request().url());return /^https?:$/.test(u.protocol)&&!['localhost','127.0.0.1'].includes(u.hostname)?route.abort():route.continue()})
 const page=await context.newPage()
 const captures=[]
 for(const [name,route] of [['login','/login'],['catalog','/package'],['course','/courses/math']])for(const theme of ['light','dark'])for(const width of [390,1440]) {
   await page.setViewportSize({width,height:900});await page.goto('http://localhost:5173/cent-s'+route)
   await page.evaluate(theme=>window.ItatestAppearance.setPreference(theme),theme)
   await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready)
   const file=`before-${name}-${theme}-${width}.png`;await page.screenshot({path:`${out}/${file}`,fullPage:true})
   captures.push({file,route,theme,width,kind:'Actual local backend; no mocked API responses',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)})
 }
 fs.writeFileSync(`${out}/before-captures.json`,JSON.stringify(captures,null,2))
} finally {await browser.close()}
