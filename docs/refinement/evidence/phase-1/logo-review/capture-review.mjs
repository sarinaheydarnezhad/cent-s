/* global document, window, sessionStorage, innerWidth, getComputedStyle, fetch, URL, console */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from '../../../../../tests/browser/node_modules/playwright/index.mjs'
const out=path.dirname(fileURLToPath(import.meta.url)),parent=path.dirname(out),root=path.resolve(out,'../../../../..')
const web='http://localhost:5173/cent-s',api='http://127.0.0.1:5108/api/cent/v1'
const browser=await chromium.launch({channel:'chrome',headless:true})
const manifest={classification:'Actual local Cent.Preview; existing synthetic fixtures; no API or SDK mocks; Google disabled by local discovery',screenshots:[],errors:[]}
const write=()=>fs.writeFileSync(path.join(out,'screenshots.json'),JSON.stringify(manifest,null,2))
async function request(endpoint,token,method='GET',body) {
  const response=await fetch(api+endpoint,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined})
  if(!response.ok)throw Error(`Local API ${endpoint}: ${response.status}`)
  return response.json()
}
async function contextFor(session) {
  const context=await browser.newContext()
  await context.route('**/*',route=>{
    const address=new URL(route.request().url())
    return ['http:','https:'].includes(address.protocol)&&!['localhost','127.0.0.1'].includes(address.hostname)?route.abort():route.continue()
  })
  if(session)await context.addInitScript(({token,expiresAt})=>{sessionStorage.setItem('cent:session:v1',token);sessionStorage.setItem('cent:session-expiry:v1',expiresAt)},session)
  return context
}
async function captures(context,name,route) {
  const page=await context.newPage()
  page.on('pageerror',error=>manifest.errors.push(error.message))
  for(const width of [390,1440])for(const theme of ['light','dark']) {
    await page.setViewportSize({width,height:width===390?844:1000})
    await page.goto(web+route);await page.waitForSelector('#root > *')
    await page.evaluate(theme=>window.ItatestAppearance.setPreference(theme),theme)
    await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700)
    if(name==='dashboard')await page.locator('.dashboard-shell.student').waitFor()
    if(name==='admin')await page.locator('.dashboard-shell.admin').waitFor()
    const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,theme:document.documentElement.dataset.theme,marks:[...document.querySelectorAll('.brand img')].filter(el=>getComputedStyle(el).display!=='none').map(el=>({src:new URL(el.src).pathname,loaded:el.complete&&el.naturalWidth>0}))}))
    if(metrics.overflow||metrics.marks.some(mark=>!mark.loaded))throw Error(`Logo/layout check failed: ${name}/${theme}/${width}`)
    const file=`${name}-${theme}-${width}.png`
    await page.screenshot({path:path.join(out,file),fullPage:true})
    manifest.screenshots.push({file,route,width,theme,...metrics});write()
    if(width===390&&['dashboard','admin'].includes(name)) {
      await page.locator('.dashboard-topbar .mobile-only').click()
      await page.locator('.sidebar.open').waitFor()
      const file=`${name}-menu-${theme}-${width}.png`
      await page.screenshot({path:path.join(out,file),fullPage:true})
      manifest.screenshots.push({file,route,width,theme,state:'Existing mobile sidebar open; logo visible'});write()
    }
  }
  await page.close()
}
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1})
  for(const name of ['logo-comparison.html','logo-comparison.png','visual-comparisons.html','visual-comparisons.png'])if(!fs.existsSync(path.join(out,'before',name)))fs.copyFileSync(path.join(parent,name),path.join(out,'before',name))
  // Regenerate raster icons from the same SVG geometry; do not resize a previous raster.
  for(const size of [32,180,192]) {
    await page.setViewportSize({width:size,height:size})
    const data='data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,'public/brand/favicon.svg')).toString('base64')
    await page.setContent(`<style>body{margin:0}img{display:block;width:${size}px;height:${size}px}</style><img src="${data}" alt="Itatest favicon">`)
    await page.waitForFunction(()=>document.querySelector('img').complete&&document.querySelector('img').naturalWidth>0)
    await page.screenshot({path:path.join(root,`public/brand/favicon-${size}.png`)})
  }
  const tiles=[
    ['Original geometry source','../../../brand/logo-original-reference.png','Original green/shaded raster. Geometry source only.'],
    ['Approved recolored reference','../../../brand/logo-reference.png','Approved sage/slate/charcoal identity; prior SVG followed these proportions.'],
    ['Previous SVG','logo-review/before/symbol.svg','Preserved Phase 1 proposal before original-reference review.'],
    ['Refined light symbol','../../../../public/brand/symbol.svg','Original silhouette fitted with symmetric 45° flat paths.'],
    ['Refined dark symbol','../../../../public/brand/symbol-dark.svg','Same geometry; existing accessible dark-theme color mapping.','dark'],
    ['Monochrome','../../../../public/brand/monochrome.svg','Same geometry, charcoal flat fill.'],
    ['Inverted','../../../../public/brand/inverted.svg','Same geometry, off-white flat fill.','dark'],
    ['Primary wordmark','../../../../public/brand/logo-primary.svg','Existing title case and live text retained.'],
    ['Dark wordmark','../../../../public/brand/logo-dark.svg','No wordmark typography or placement redesign.','dark'],
  ]
  const small=[16,24,32,48].map(size=>`<figure><img style="width:${size}px;height:${size}px" src="../../../../public/brand/favicon.svg" alt="${size} pixel favicon"><figcaption>${size}px</figcaption></figure>`).join('')
  const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Itatest logo — original reference review</title><style>body{font:16px Arial,sans-serif;margin:32px;background:#F5F7F7;color:#29343C}h1{font-size:28px}h2{font-size:19px}p{line-height:1.6}main{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}article{background:white;padding:20px;border-radius:16px;min-width:0}article.dark{background:#182127;color:#F5F7F7}article>img{width:100%;height:210px;object-fit:contain}.small{display:flex;align-items:center;gap:20px;min-height:90px}.small img{image-rendering:auto}figure{margin:0}figcaption{font-size:13px;margin-top:12px}section{margin-top:24px;background:white;padding:24px;border-radius:16px}.board{width:100%;max-height:560px;object-fit:contain}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:12px;border-bottom:1px solid #E0E4E6}small{line-height:1.6}</style><h1>Itatest — original-reference logo refinement</h1><p>Both previously missing files are now available and reviewed. Original raster controls geometry; recolored reference and board control identity. Flat colors follow approved hex values. Final owner approval is pending.</p><main>${tiles.map(([title,src,note,kind=''])=>`<article class="${kind}"><h2>${title}</h2><img src="${src}" alt="${title}"><p>${note}</p></article>`).join('')}</main><section><h2>Actual CSS sizes — DPR 1; 16 / 24 / 32 / 48px</h2><p>Viewed at 100% image scale. Browser antialiasing remains visible at 16px; no alternate simplified logo geometry introduced.</p><div class="small">${small}</div><div class="small" style="background:#182127;color:#F5F7F7;padding:16px">${small}</div></section><section><h2>Geometry comparison, normalized to 248px symbol width</h2><table><tr><th>Measure</th><th>Previous SVG</th><th>Refined SVG</th></tr><tr><td>Total silhouette height</td><td>256.6px</td><td>245px</td></tr><tr><td>Upper chevron centerline thickness</td><td>55.6px</td><td>68px</td></tr><tr><td>Middle chevron centerline thickness</td><td>55.9px</td><td>48px</td></tr><tr><td>Top to diamond apex</td><td>181.6px</td><td>171px</td></tr></table><p>Raster threshold bounds: about 248 × 243px. New vector silhouette: 248 × 245px. Small differences reflect antialiasing, shading and a symmetric fit, rather than recovery of an exact vector master. Both original and refined mark retain two chevrons and one diamond. All variants use identical paths.</p></section><section><h2>Approved brand board</h2><img class="board" src="../../../brand/brand-board-reference.png" alt="User supplied brand board"><p>Board confirms symbol family, sage/slate neutrals and light/inverted usage. Its gradients, shading, lowercase wordmark and conceptual page features are not copied into this scoped geometry refinement.</p></section>`
  fs.writeFileSync(path.join(parent,'logo-comparison.html'),html)
  await page.setViewportSize({width:1440,height:1000})
  await page.goto(pathToFileURL(path.join(parent,'logo-comparison.html')).href)
  await page.evaluate(()=>Promise.all([...document.images].map(img=>img.decode())))
  await page.screenshot({path:path.join(out,'logo-comparison.png'),fullPage:true})
  fs.copyFileSync(path.join(out,'logo-comparison.png'),path.join(parent,'logo-comparison.png'))
  await page.close()
  if((await request('/status')).payments!=='DEVELOPMENT_MOCK')throw Error('Expected isolated local mock preview')
  const publicContext=await contextFor()
  await captures(publicContext,'home','/');await captures(publicContext,'login','/login');await publicContext.close()
  const admin=await request('/auth/login',null,'POST',{email:'admin@cent.local',password:'cent-local-preview-only'})
  const users=await request('/admin/users',admin.token)
  const orders=await request('/admin/orders',admin.token)
  const fixture=JSON.parse(fs.readFileSync(path.join(root,'tests/browser/artifacts/result.json'),'utf8'))
  const order=orders.find(item=>item.trainingId===fixture.trainingId&&item.status==='PAID')
  const user=users.find(item=>item.id===order?.userId)
  if(!user?.email.startsWith('study-'))throw Error('Known existing local fixture not found; no account created')
  const student=await request('/auth/login',null,'POST',{email:user.email,password:'cent-local-preview-only'})
  const studentContext=await contextFor(student)
  await captures(studentContext,'dashboard','/student');await studentContext.close()
  const adminContext=await contextFor(admin)
  await captures(adminContext,'admin','/admin');await adminContext.close()
  let comparisons=fs.readFileSync(path.join(out,'before/visual-comparisons.html'),'utf8')
  for(const name of ['home-light-1440.png','home-dark-1440.png','login-light-390.png','login-dark-390.png','dashboard-light-390.png','dashboard-dark-390.png'])comparisons=comparisons.replaceAll(`src="${name}"`,`src="logo-review/${name}"`)
  comparisons=comparisons.replace('<h1>','<p>Updated after original-reference logo review: home/login/dashboard images use the refined SVG. Reader images retain the prior foundation capture because that shell has no Brand placement. <a href="logo-comparison.html">New logo reference comparison</a>.</p><h1>')
  fs.writeFileSync(path.join(parent,'visual-comparisons.html'),comparisons)
  const comparisonPage=await browser.newPage({viewport:{width:1440,height:1000}})
  await comparisonPage.goto(pathToFileURL(path.join(parent,'visual-comparisons.html')).href)
  await comparisonPage.evaluate(()=>Promise.all([...document.images].map(img=>img.decode())))
  await comparisonPage.screenshot({path:path.join(parent,'visual-comparisons.png'),fullPage:true})
  write();console.log(JSON.stringify({screenshots:manifest.screenshots.length,errors:manifest.errors}))
} catch(error){manifest.errors.push(error.message);write();throw error}
finally{await browser.close()}
