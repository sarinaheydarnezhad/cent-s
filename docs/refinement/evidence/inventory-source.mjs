/* global console */
import fs from 'node:fs'
import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import { Buffer } from 'node:buffer'
import ts from 'typescript'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const output = new URL('./', import.meta.url)
function walk(directory) { return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]) }
const files = walk(path.join(root, 'src')).filter(file => /\.(tsx?|css)$/.test(file))
const messages = [], exports = [], css = []
for (const file of files) {
  const relative = path.relative(root, file).replaceAll('\\', '/')
  const source = fs.readFileSync(file, 'utf8')
  if (file.endsWith('.css')) { css.push({ file: relative, source }); continue }
  if (file.endsWith('.test.ts')) continue
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) exports.push({ file: relative, name: node.name.text })
    if (ts.isJsxText(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      const text = node.text.trim().replace(/\s+/g, ' ')
      if (/[\u0600-\u06ff]/.test(text)) messages.push({ file: relative, line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, kind: ts.SyntaxKind[node.kind], text, scope: file.endsWith('questions.ts') ? 'educational reference data; not UI rewriting scope' : 'UI or service text; contextual review needed' })
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
}
const frequency = values => Object.entries(values.reduce((result, value) => { result[value] = (result[value] || 0) + 1; return result }, {})).sort((a,b) => b[1]-a[1])
const styles = css.map(({ file, source }) => ({ file, bytes: Buffer.byteLength(source), colorOccurrences: [...source.matchAll(/#[\da-f]{3,8}\b|rgba?\([^)]+\)/gi)].length, colors: frequency([...source.matchAll(/#[\da-f]{3,8}\b|rgba?\([^)]+\)/gi)].map(x=>x[0])), gradients: [...source.matchAll(/(?:linear|radial|conic)-gradient\(/g)].length, radii: frequency([...source.matchAll(/border-radius\s*:\s*([^;}]+)/g)].map(x=>x[1])), tokens: [...source.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)].map(x=>({ name:x[1],value:x[2] })), breakpoints: frequency([...source.matchAll(/(?:min|max)-width\s*:\s*(\d+)px\)/g)].map(x=>x[1])) }))
function luminance(hex) { const rgb=hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4); return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722 }
const pairs = [['current success button','#ffffff','#19956a'],['current warning text on white','#e09a29','#ffffff'],['current focus on white','#79a36c','#ffffff'],['approved primary button','#ffffff','#4d687a'],['sage with white','#ffffff','#a5b5a1'],['sage with charcoal','#29343c','#a5b5a1'],['secondary on off white','#65737d','#f5f7f7'],['proposed warning on warning background','#9a702b','#f8f0e2'],['proposed error on error background','#b54c4c','#f8eaea']]
const contrast = pairs.map(([name,foreground,background])=>({ name,foreground,background,ratio:Number(((Math.max(luminance(foreground),luminance(background))+.05)/(Math.min(luminance(foreground),luminance(background))+.05)).toFixed(2)) }))
fs.writeFileSync(new URL('ux-text-inventory.json', output), JSON.stringify(messages,null,2))
fs.writeFileSync(new URL('source-inventory.json', output), JSON.stringify({ exports,styles,contrast },null,2))
console.log(JSON.stringify({ messages:messages.length, exports:exports.length, styles:styles.map(({file,bytes,colorOccurrences,gradients,radii})=>({file,bytes,colorOccurrences,gradients,radiusValues:radii.length})),contrast },null,2))
