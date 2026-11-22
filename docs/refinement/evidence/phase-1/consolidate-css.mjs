// One-time Phase 1 migration, retained as review evidence; not application code.
import fs from 'node:fs'
import postcss from 'postcss'

const groups = {
  success: '#19956a #267155 #217c58 #24795a #38674c #52773d #3a5c34 #2e6c50 #52704a #416446 #3a573e #41654b #436d65',
  warning: '#e09a29 #6d5821 #9a6334 #9d681d #96651b #9b6817 #a46d18 #817456 #8a7039 #8a814b #4f4a20',
  error: '#d45151 #9d3434 #ac3d3d',
  'success-surface': '#e8f7f0 #eff9f4 #e8f6f0 #e9f7f1 #e7f6ef #eaf8f1 #e9f7f0 #edf3ea #f0f3e9 #e4eedc #ecf0e3 #edf1e3 #e7ecd9',
  'warning-surface': '#fff8e8 #fff6df #fff6dd #fff4ed #fff3dc #fff5df #fff1cc #fff2d8 #f4f0e5 #fffdf2 #ebe7d9 #ddd39b',
  'error-surface': '#fff0f0 #ffeded #fff5ef',
}
const roles = new Map(Object.entries(groups).flatMap(([role, values]) => values.split(' ').map(value => [value, role])))
const strong = /(?:^|[ ,.])(?:\.footer|\.sidebar|\.auth-visual|\.score-orbit|\.cta-box|\.test-topbar|\.results-hero|\.package-hero|\.cent-store-hero|\.cent-dashboard-lead)(?:[ :>.{]|$)/
const changed = []
for (const file of ['src/styles.css', 'src/cent.css']) {
  const root = postcss.parse(fs.readFileSync(file, 'utf8'))
  root.walkRules(rule => {
    if (rule.selector === ':root') { rule.remove(); return }
    // Educational source sheets and document pixels retain their existing colors.
    if (/cent-source-text|cent-page-shell|cent-question-figure/.test(rule.selector)) return
    rule.walkDecls(decl => {
      const original = decl.value
      const surface = /background|fill/.test(decl.prop)
      const border = /border|outline/.test(decl.prop)
      const text = decl.prop === 'color'
      const darkPanel = strong.test(rule.selector)
      if (/gradient\(/.test(decl.value)) {
        const dark = /var\(--navy|#102a43|#0d293f|#0b5754|#164d5d|#173f58|#174b63|#164e63/.test(decl.value)
        decl.value = `var(--color-${dark ? 'strong-surface' : 'surface-subtle'})`
      }
      if (/shadow/.test(decl.prop)) decl.value = 'var(--shadow-small)'
      decl.value = decl.value.replace(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b/g, raw => {
        const value = raw.toLowerCase()
        if (value.startsWith('rgb')) return `var(--color-${border ? (darkPanel ? 'on-strong-line' : 'border') : surface ? 'surface' : 'text-secondary'})`
        if (value.length === 9 || value === '#0002') return 'var(--color-overlay)'
        if (value === '#fff' || value === '#ffffff' || value === 'white') return `var(--color-${text ? 'on-strong' : 'surface'})`
        if (roles.has(value)) return `var(--color-${roles.get(value)})`
        const hex = value.slice(1)
        const channels = [0,2,4].map(i => parseInt(hex.slice(i,i+2),16))
        const brightness = channels.reduce((sum,x)=>sum+x,0)/3
        if (border) return `var(--color-${/focus/.test(rule.selector) ? 'focus' : 'border'})`
        if (surface) return `var(--color-${brightness < 100 ? 'strong-surface' : brightness < 185 ? 'selected' : 'surface-subtle'})`
        if (text && darkPanel) return `var(--color-${brightness > 150 ? 'on-strong-secondary' : 'on-strong-accent'})`
        return `var(--color-${brightness < 105 ? 'text' : 'text-secondary'})`
      })
      if (surface) decl.value = decl.value.replace(/var\(--navy(?:-2)?\)/g, 'var(--color-strong-surface)')
      if (original !== decl.value) changed.push({file,selector:rule.selector,property:decl.prop,before:original,after:decl.value})
    })
  })
  fs.writeFileSync(file,root.toString())
}
fs.writeFileSync('docs/refinement/evidence/phase-1/css-migration.json',JSON.stringify(changed,null,2))
