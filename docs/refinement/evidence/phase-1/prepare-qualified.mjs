import fs from 'node:fs'
for(const file of ['safe-notes.mjs','targeted-recovery.mjs']) {
  const source=fs.readFileSync(`docs/refinement/evidence/runtime-2026-11-18/${file}`,'utf8')
  fs.writeFileSync(`docs/refinement/evidence/phase-1/${file}`,source.replaceAll('phase0-','phase1-'))
}
