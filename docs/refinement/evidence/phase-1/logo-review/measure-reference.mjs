/* global document, Image, console */
import { chromium } from '../../../../../tests/browser/node_modules/playwright/index.mjs'
import { pathToFileURL, fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
const out=path.dirname(fileURLToPath(import.meta.url))
const root=path.resolve(out,'../../../../..')
const browser=await chromium.launch({channel:'chrome',headless:true})
try {
  const page=await browser.newPage()
  await page.goto(pathToFileURL(path.join(root,'docs/brand/README.md')).href)
  const result=await page.evaluate(async source=>{
    const img=new Image();img.src=source;await img.decode()
    const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0)
    const {data}=ctx.getImageData(0,0,img.width,img.height)
    const rows=[],mask=new Uint8Array(img.width*img.height)
    for(let y=80;y<370;y++) {
      const xs=[]
      for(let x=70;x<410;x++) {
        const i=(y*img.width+x)*4,r=data[i],g=data[i+1],b=data[i+2]
        if(g>r*1.12&&g>b*1.12&&g>35){xs.push(x);mask[y*img.width+x]=1}
      }
      if(xs.length)rows.push({y,left:xs[0],right:xs.at(-1),count:xs.length})
    }
    const components=[]
    for(let i=0;i<mask.length;i++)if(mask[i]) {
      const pending=[i],points=[];mask[i]=0
      for(let j=0;j<pending.length;j++) {
        const p=pending[j],x=p%img.width,y=Math.floor(p/img.width);points.push({x,y})
        for(const q of [p-1,p+1,p-img.width,p+img.width])if(mask[q]){mask[q]=0;pending.push(q)}
      }
      if(points.length>100)components.push({pixels:points.length,minX:Math.min(...points.map(p=>p.x)),maxX:Math.max(...points.map(p=>p.x)),minY:Math.min(...points.map(p=>p.y)),maxY:Math.max(...points.map(p=>p.y)),rows:rows.filter(r=>points.some(p=>p.y===r.y)).map(r=>({y:r.y,xs:points.filter(p=>p.y===r.y).map(p=>p.x).sort((a,b)=>a-b)}))})
    }
    return {width:img.width,height:img.height,threshold:'g > r*1.12 and g > b*1.12 and g > 35; raster antialiasing excluded approximately',components,rows}
  },'data:image/png;base64,'+fs.readFileSync(path.join(root,'docs/brand/logo-original-reference.png')).toString('base64'))
  fs.writeFileSync(path.join(out,'original-raster-measurements.json'),JSON.stringify(result,null,2))
  console.log(JSON.stringify(result.components.map(c=>{
    const median=values=>values.sort((a,b)=>a-b)[Math.floor(values.length/2)]
    const shoulder=c.rows.reduce((a,b)=>b.xs.at(-1)-b.xs[0]>a.xs.at(-1)-a.xs[0]?b:a)
    const upper=c.rows.filter(r=>r.y>c.minY+10&&r.y<shoulder.y-10)
    const lower=c.rows.filter(r=>r.y>shoulder.y+8&&r.y<c.maxY-4)
    const inner=upper.filter(r=>!r.xs.includes(242)&&r.xs.some(x=>x<242)&&r.xs.some(x=>x>242))
    return {pixels:c.pixels,bounds:[c.minX,c.minY,c.maxX,c.maxY],shoulderY:shoulder.y,outerLeftSum:median(upper.map(r=>r.xs[0]+r.y)),outerRightDifference:median(upper.map(r=>r.xs.at(-1)-r.y)),lowerLeftDifference:median(lower.map(r=>r.xs[0]-r.y)),lowerRightSum:median(lower.map(r=>r.xs.at(-1)+r.y)),innerLeftSum:median(inner.map(r=>r.xs.filter(x=>x<242).at(-1)+r.y)),innerRightDifference:median(inner.map(r=>r.xs.find(x=>x>242)-r.y))}
  }),null,2))
} finally {await browser.close()}
