import fs from 'node:fs'
for(const file of ['src/styles.css','src/cent.css']) {
  let css=fs.readFileSync(file,'utf8')
  css=css.replace(/font-weight:\s*(900|800|700|600|500|400)\b/g,(_,weight)=>`font-weight:var(--weight-${({'900':'hero','800':'hero','700':'bold','600':'semibold','500':'medium','400':'normal'})[weight]})`)
  fs.writeFileSync(file,css)
}
const file='src/pages/PracticePages.tsx'
let source=fs.readFileSync(file,'utf8')
source=source.replace('<div className="container cent-exam"><div className="standalone-appearance"><AppearanceControl/></div>','<div className="container cent-exam">{kind === \'diagnostic\' && <div className="standalone-appearance"><AppearanceControl/></div>}')
fs.writeFileSync(file,source)
