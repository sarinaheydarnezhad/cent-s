import fs from 'node:fs'
for(const [file,needle,replacement] of [
  ['src/pages/PracticePages.tsx','<div className="container cent-exam">','<div className="container cent-exam"><div className="standalone-appearance"><AppearanceControl/></div>'],
  ['src/pages/StudyReader.tsx','<header className="cent-reader-header">','<header className="cent-reader-header"><AppearanceControl/>'],
]) {
  const source=fs.readFileSync(file,'utf8')
  if(!source.includes(needle)) throw Error(`Missing insertion in ${file}`)
  fs.writeFileSync(file,source.replace(needle,replacement))
}
