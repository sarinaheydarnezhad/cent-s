import fs from 'node:fs'
import crypto from 'node:crypto'
const directory='docs/refinement/evidence/phase-1'
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const screenshots=fs.readdirSync(directory).filter(x=>x.endsWith('.png')).map(file=>({file,sha256:hash(`${directory}/${file}`),kind:file.startsWith('gis-mock-')?'Mock SDK/API, actual component render; not official Google button':file==='logo-comparison.png'?'Supplied reference and provisional SVG browser rendering':file==='visual-comparisons.png'?'Montage of actual preserved baseline/light/dark screenshots':'Actual isolated Cent.Preview, no response mocking'}))
fs.writeFileSync(`${directory}/deliverables-manifest.json`,JSON.stringify({screenshots,notes:'No generated mockups. Missing logo-original-reference.png and brand-board-reference.png are not represented. Local fixture names and order data are synthetic test records. No credentials/session tokens in screenshots/manifests.'},null,2))
