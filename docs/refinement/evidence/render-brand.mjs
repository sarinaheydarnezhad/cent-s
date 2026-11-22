/* global console */
import fs from 'node:fs'
import { URL } from 'node:url'
import { createCanvas } from '@napi-rs/canvas'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const pdf = await getDocument({
  data: new Uint8Array(fs.readFileSync(new URL('../../brand/Itatest-Complete-Brand-Design-Guidelines-V1.pdf', import.meta.url))),
  useSystemFonts: true,
}).promise
for (let start = 1; start <= pdf.numPages; start += 6) {
  const sheet = createCanvas(1320, 1880)
  const context = sheet.getContext('2d')
  context.fillStyle = '#d8dde0'
  context.fillRect(0, 0, sheet.width, sheet.height)
  for (let i = start; i <= Math.min(start + 5, pdf.numPages); i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1 })
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    const offset = i - start, x = (offset % 2) * 660, y = Math.floor(offset / 2) * 626
    const scale = Math.min(640 / canvas.width, 590 / canvas.height)
    context.fillStyle = '#182127'
    context.font = '18px sans-serif'
    context.fillText(`PDF page ${i}`, x + 10, y + 22)
    context.drawImage(canvas, x + 10, y + 30, canvas.width * scale, canvas.height * scale)
    fs.writeFileSync(new URL(`./brand-page-${i}.png`, import.meta.url), canvas.toBuffer('image/png'))
  }
  fs.writeFileSync(new URL(`./brand-contact-${start}.png`, import.meta.url), sheet.toBuffer('image/png'))
}
console.log(`Rendered all ${pdf.numPages} pages and five contact sheets`)
