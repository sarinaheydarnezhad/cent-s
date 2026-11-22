import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { browserOptions } from '../../../../tests/browser/environment.mjs'

// Delivery derivatives of the supplied artwork only; no generated/repainted pixels.
const browser = await chromium.launch(browserOptions)
try {
  const page = await browser.newPage()
  const results = []
  mkdirSync('public/images', { recursive: true })
  for (const name of ['hero-colosseum', 'hero-underline']) {
    const source = readFileSync(`docs/brand/${name}.png`)
    const result = await page.evaluate(async ({ data, name }) => {
      const img = new Image()
      img.src = `data:image/png;base64,${data}`
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = img.width; canvas.height = img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0)
      const pixels = ctx.getImageData(0, 0, img.width, img.height).data
      const thresholds = [8, 32, 64, 128, 200].map(alpha => ({ alpha, bounds: [img.width, img.height, 0, 0], pixels: 0 }))
      let left = img.width, top = img.height, right = 0, bottom = 0, transparent = 0, partial = 0, min = 255, max = 0
      for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
        const alpha = pixels[(y * img.width + x) * 4 + 3]
        min = Math.min(min, alpha); max = Math.max(max, alpha)
        if (!alpha) transparent++
        else { left = Math.min(left, x); right = Math.max(right, x + 1); top = Math.min(top, y); bottom = Math.max(bottom, y + 1); if (alpha < 255) partial++ }
        for (const threshold of thresholds) if (alpha >= threshold.alpha) {
          threshold.pixels++; const b = threshold.bounds
          b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x + 1); b[3] = Math.max(b[3], y + 1)
        }
      }
      // Remove only fully transparent exterior padding from the brushstroke.
      const bounds = name === 'hero-underline' ? [left, top, right, bottom] : [0, 0, img.width, img.height]
      const output = document.createElement('canvas')
      output.width = bounds[2] - bounds[0]; output.height = bounds[3] - bounds[1]
      output.getContext('2d').drawImage(canvas, ...[bounds[0], bounds[1], output.width, output.height], 0, 0, output.width, output.height)
      const encoded = output.toDataURL('image/webp', 0.95)
      return { sourceWidth: img.width, sourceHeight: img.height, alphaRange: [min, max], transparentPixels: transparent, partiallyTransparentPixels: partial, visibleBounds: [left, top, right, bottom], thresholds, derivativeBounds: bounds, width: output.width, height: output.height, encoded }
    }, { data: source.toString('base64'), name })
    const { encoded, ...metadata } = result
    const bytes = Buffer.from(encoded.split(',')[1], 'base64')
    writeFileSync(`public/images/${name}.webp`, bytes)
    results.push({ name, sourceBytes: source.length, deliveredBytes: bytes.length, quality: 0.95, ...metadata })
  }
  writeFileSync('docs/refinement/evidence/phase-3-1/assets.json', JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
} finally { await browser.close() }
