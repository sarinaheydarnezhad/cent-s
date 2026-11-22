/* global console */
import fs from 'node:fs'
import { URL } from 'node:url'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const file = new URL('../../brand/Itatest-Complete-Brand-Design-Guidelines-V1.pdf', import.meta.url)
const pdf = await getDocument({ data: new Uint8Array(fs.readFileSync(file)), useSystemFonts: true }).promise
let text = ''
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i)
  const content = await page.getTextContent()
  text += `\n--- PAGE ${i} ---\n${content.items.map(item => item.str).join('\n')}\n`
}
fs.writeFileSync(new URL('./brand-guidelines-extracted.txt', import.meta.url), text)
console.log(`Extracted ${pdf.numPages} pages`)
