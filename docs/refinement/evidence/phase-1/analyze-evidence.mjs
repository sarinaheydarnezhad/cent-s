import fs from 'node:fs'
import zlib from 'node:zlib'
const dir='docs/refinement/evidence/phase-1'
const review=JSON.parse(fs.readFileSync(`${dir}/foundation-review.json`,'utf8'))
function luminance(rgb) {return rgb.match(/[\d.]+/g).slice(0,3).map(x=>Number(x)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0)}
const contrast=[...new Map(review.contrast.flatMap(row=>row.pairs.map(pair=>[`${row.theme}/${pair.role}`,{theme:row.theme,...pair}]))).values()].map(pair=>{
  const a=luminance(pair.foreground),b=luminance(pair.background)
  const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05)
  const target=['focus','border-interactive','progress'].includes(pair.role)?3:4.5
  return {...pair,ratio:Number(ratio.toFixed(2)),target,pass:ratio>=target}
})
const summary={responsiveCases:review.responsive.length,overflow:review.responsive.filter(x=>x.overflow),reviewErrors:review.errors,contrast,contrastFailures:contrast.filter(x=>!x.pass)}
fs.writeFileSync(`${dir}/evidence-summary.json`,JSON.stringify(summary,null,2))
for(const file of ['baseline-smoke.log']) {
  const full=fs.readFileSync(`${dir}/${file}`)
  if(full.length>1000000) {
    fs.writeFileSync(`${dir}/${file}.gz`,zlib.gzipSync(full))
    const lines=full.toString().split('\n')
    fs.writeFileSync(`${dir}/${file}`,lines.slice(0,110).join('\n')+`\n\n[Repeated closed-page exception-handler output omitted here: ${lines.length} original lines / ${full.length} bytes. Complete original bytes preserved in ${file}.gz. This run failed and was interrupted.]\n`)
  }
}
