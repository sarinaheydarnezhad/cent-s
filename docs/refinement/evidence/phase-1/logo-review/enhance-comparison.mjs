/* global document */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from '../../../../../tests/browser/node_modules/playwright/index.mjs'
const out=path.dirname(fileURLToPath(import.meta.url)),parent=path.dirname(out),root=path.resolve(out,'../../../../..')
const original='data:image/png;base64,'+fs.readFileSync(path.join(root,'docs/brand/logo-original-reference.png')).toString('base64')
fs.writeFileSync(path.join(out,'original-normalized.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 86 284 284"><image width="481" height="471" href="${original}"/></svg>`)
fs.writeFileSync(path.join(out,'before-normalized.svg'),fs.readFileSync(path.join(out,'before/symbol.svg'),'utf8').replace('160 138 704 728','131.2258 121.2258 761.5484 761.5484'))
const file=path.join(parent,'logo-comparison.html')
let html=fs.readFileSync(file,'utf8')
if(!html.includes('id="normalized"'))html=html.replace('<main>','<section id="normalized"><h2>Geometry at matched silhouette width</h2><p>Original raster crop / previous SVG / refined SVG. Original shading is retained only in the reference crop; production assets remain flat. Matched widths make the band thickness and diamond placement easier to compare.</p><main><article><h2>Original silhouette</h2><img src="logo-review/original-normalized.svg" alt="Original raster cropped to symbol"></article><article><h2>Previous SVG</h2><img src="logo-review/before-normalized.svg" alt="Previous SVG normalized to same width"></article><article><h2>Refined SVG</h2><img src="../../../../public/brand/symbol.svg" alt="Refined SVG normalized to same width"></article></main></section><h2>References and complete variant set</h2><main>')
fs.writeFileSync(file,html)
const browser=await chromium.launch({channel:'chrome',headless:true})
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1})
  await page.goto(pathToFileURL(file).href)
  await page.evaluate(()=>Promise.all([...document.images].map(img=>img.decode())))
  await page.screenshot({path:path.join(out,'logo-comparison.png'),fullPage:true})
  await page.locator('#normalized').screenshot({path:path.join(out,'geometry-detail.png')})
  await page.locator('section').filter({has:page.getByRole('heading',{name:'Actual CSS sizes — DPR 1; 16 / 24 / 32 / 48px',exact:true})}).screenshot({path:path.join(out,'favicon-actual-sizes.png')})
  fs.copyFileSync(path.join(out,'logo-comparison.png'),path.join(parent,'logo-comparison.png'))
  // Preserve old HTML as an explicitly historical source with working relative paths.
  for(const name of ['logo-comparison.html','visual-comparisons.html']) {
    const old=path.join(out,'before',name)
    let content=fs.readFileSync(old,'utf8')
    if(!content.includes('<base '))content=content.replace('<meta charset="utf-8">','<meta charset="utf-8"><base href="../../">')
    fs.writeFileSync(old,content)
  }
} finally {await browser.close()}
