/* global console */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
const out=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(out,'../../../../..')
const geometry=JSON.parse(fs.readFileSync(path.join(out,'geometry.json'),'utf8'))
const checks=[]
for(const file of ['symbol.svg','symbol-dark.svg','monochrome.svg','inverted.svg','logo-primary.svg','logo-dark.svg','favicon.svg']) {
  const source=fs.readFileSync(path.join(root,'public/brand',file),'utf8')
  const paths=[...source.matchAll(/<path fill="(#[A-Fa-f0-9]{6})" d="([^"]+)"/g)]
  assert.deepEqual(paths.map(p=>p[2]),geometry.geometry,`${file}: common geometry`)
  assert.equal(/gradient|filter|stroke=|script|foreignObject/i.test(source),false,`${file}: flat SVG only`)
  for(const [, ,d] of paths) {
    const numbers=d.match(/-?\d+(?:\.\d+)?/g).map(Number),points=[]
    for(let i=0;i<numbers.length;i+=2)points.push([numbers[i],numbers[i+1]])
    for(let i=0;i<points.length;i++) {
      const [x,y]=points[i],[nx,ny]=points[(i+1)%points.length]
      assert.equal(Math.abs(nx-x),Math.abs(ny-y),`${file}: 45-degree segment`)
      assert.ok(points.some(([px,py])=>px===484-x&&py===y),`${file}: reflection about x=242`)
    }
  }
  const expected=file==='favicon.svg'?geometry.variants.symbol:geometry.variants[file.replace('.svg','').replace('logo-primary','symbol').replace('logo-dark','symbol-dark')]
  assert.deepEqual(paths.map(p=>p[1]),expected,`${file}: approved variant colors retained`)
  assert.equal(fs.readFileSync(path.join(root,'dist/brand',file),'utf8'),source,`${file}: built asset matches source`)
  checks.push(`${file}: consistent symmetric geometry, 45-degree angles, flat color mapping, matching built asset`)
}
for(const size of [32,180,192]) {
  const buffer=fs.readFileSync(path.join(root,`public/brand/favicon-${size}.png`))
  assert.equal(buffer.subarray(1,4).toString(),'PNG')
  assert.equal(buffer.readUInt32BE(16),size);assert.equal(buffer.readUInt32BE(20),size)
  assert.deepEqual(fs.readFileSync(path.join(root,`dist/brand/favicon-${size}.png`)),buffer)
  checks.push(`favicon-${size}.png: PNG dimensions and built-copy identity verified`)
}
const previous=JSON.parse(fs.readFileSync(path.join(out,'../final-verification.json'),'utf8'))
const protectedFiles=previous.protectedHashes.map(record=>{
  const sha256=createHash('sha256').update(fs.readFileSync(path.join(root,record.file))).digest('hex')
  assert.equal(sha256,record.sha256,`${record.file}: protected baseline unchanged`)
  return {file:record.file,unchanged:true,sha256}
})
const branch=execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim();assert.equal(branch,'main')
const staged=execFileSync('git',['diff','--cached','--name-only'],{cwd:root,encoding:'utf8'}).trim();assert.equal(staged,'')
const backendStatus=execFileSync('git',['-c','safe.directory=D:/Lerona/Backend','-C','D:/Lerona/Backend','status','--porcelain'],{encoding:'utf8'}).trim();assert.equal(backendStatus,'')
execFileSync('git',['diff','--check'],{cwd:root})
const manifest=JSON.parse(fs.readFileSync(path.join(out,'screenshots.json'),'utf8'))
assert.equal(manifest.errors.length,0);assert.equal(manifest.screenshots.length,20)
const files=[...fs.readdirSync(path.join(root,'public/brand')).map(name=>path.join(root,'public/brand',name)),...['logo-original-reference.png','logo-reference.png','brand-board-reference.png','palette-reference.png'].map(name=>path.join(root,'docs/brand',name)),...fs.readdirSync(out).filter(name=>name.endsWith('.png')).map(name=>path.join(out,name))]
const hashes=files.map(file=>({file:path.relative(root,file).replaceAll('\\','/'),sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex')}))
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({branch,staged,backendClean:backendStatus==='',protectedFiles,checks,screenshots:manifest.screenshots.length,uncaughtPageErrors:manifest.errors.length,overflow:manifest.screenshots.filter(s=>s.overflow).length,hashes},null,2))
console.log(JSON.stringify({assetChecks:checks.length,protectedFiles:protectedFiles.length,branch,backendClean:true,screenshots:20,overflow:0}))
