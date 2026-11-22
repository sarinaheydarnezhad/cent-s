import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const out=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(out,'../../../../..')
const directory=path.join(root,'public/brand')
fs.mkdirSync(path.join(out,'before'),{recursive:true})
for(const file of fs.readdirSync(directory))if(!fs.existsSync(path.join(out,'before',file)))fs.copyFileSync(path.join(directory,file),path.join(out,'before',file))
// Symmetric 45-degree paths fitted to the original raster silhouette, excluding its shading.
const geometry=['M242 106 366 230 332 264 242 174 152 264 118 230Z','M242 202 317 277 293 301 242 250 191 301 167 277Z','M242 277 279 314 242 351 205 314Z']
const viewBox='100 86 284 284'
const paths=colors=>geometry.map((d,i)=>`<path fill="${colors[i]}" d="${d}"/>`).join('')
const variants={symbol:['#A5B5A1','#4D687A','#29343C'],'symbol-dark':['#A5B5A1','#9CB8C9','#F5F7F7'],monochrome:['#29343C','#29343C','#29343C'],inverted:['#F5F7F7','#F5F7F7','#F5F7F7']}
for(const [name,colors] of Object.entries(variants))fs.writeFileSync(path.join(directory,name+'.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="Itatest">${paths(colors)}</svg>\n`)
for(const [name,colors] of [['primary',variants.symbol],['dark',variants['symbol-dark']]])fs.writeFileSync(path.join(directory,`logo-${name}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 160" role="img" aria-label="Itatest"><svg x="0" y="8" width="140" height="144" viewBox="${viewBox}">${paths(colors)}</svg><text x="164" y="112" fill="${name==='dark'?'#F5F7F7':'#29343C'}" font-family="Inter,Arial,sans-serif" font-size="100" font-weight="700">Itatest</text></svg>\n`)
fs.writeFileSync(path.join(directory,'favicon.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#F5F7F7"/><svg x="2" y="2" width="28" height="28" viewBox="${viewBox}">${paths(variants.symbol)}</svg></svg>\n`)
fs.writeFileSync(path.join(out,'geometry.json'),JSON.stringify({source:'docs/brand/logo-original-reference.png',viewBox,geometry,axis:242,edgeAngles:'45 degrees',widths:[248,150,74],height:245,apexY:[106,202,277],innerApexY:[174,250],centerlineGaps:[28,27],variants,note:'Symmetric vector fit to a shaded, antialiased raster. Approximate silhouette, not recovered exact vector master. All variants share these paths; dark colors retained from Phase 1.'},null,2))
