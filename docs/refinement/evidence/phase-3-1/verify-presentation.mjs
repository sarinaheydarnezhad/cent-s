/* global document, window, getComputedStyle, console */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
import { root, browserOptions } from '../../../../tests/browser/environment.mjs'

const out = 'docs/refinement/evidence/phase-3-1/'
const browser = await chromium.launch(browserOptions)
const result = { root, success: false, images: [], contrast: [] }
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  for (const theme of ['light', 'dark']) {
    for (const route of ['/', '/login']) {
      await page.goto(root + route)
      await page.evaluate(value => window.ItatestAppearance.setPreference(value), theme)
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => document.fonts.ready)
      if (route === '/') {
        assert.match(await page.locator('h1').textContent(), /سردرگم نمون،هدفمند بخون\./)
        for (const selector of ['.public-colosseum', '.public-headline-emphasis img']) {
          const image = await page.locator(selector).evaluate(async el => {
            await el.decode()
            return { src: el.currentSrc, width: el.naturalWidth, height: el.naturalHeight, alt: el.alt }
          })
          assert.ok(image.width > 1000 && image.height > 600)
          assert.equal(image.alt, '')
          assert.ok(image.src.startsWith(root + '/images/'))
          result.images.push({ theme, selector, ...image })
        }
      }
      // Check all opaque surface endpoints used by the new gradients. Their
      // luminance bounds conservatively cover their blends and transparency.
      const specifications = route === '/' ? [
        ['.public-hero h1', ['surface', 'page', 'interactive-selected']],
        ['.public-hero-copy > p', ['surface', 'page', 'interactive-selected']],
        ['.public-exam-available p', ['surface', 'interactive-selected']],
        ['.public-path p', ['surface', 'learning-surface']],
        ['.public-final p', ['surface', 'interactive-selected']],
      ] : [
        ['.auth-visual h2', ['learning-surface', 'interactive-selected', 'surface-subtle']],
        ['.auth-visual p', ['learning-surface', 'interactive-selected', 'surface-subtle']],
      ]
      const pairs = await page.evaluate(specifications => {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 1
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        const themeStyles = getComputedStyle(document.documentElement)
        const rgb = value => {
          ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1)
          return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3)
        }
        const luminance = color => rgb(color).map(v => {
          v /= 255
          return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4
        }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
        const pairs = specifications.flatMap(([selector, tokens]) => {
          const foreground = getComputedStyle(document.querySelector(selector)).color
          return tokens.map(token => {
            const background = themeStyles.getPropertyValue(`--color-${token}`).trim()
            if (!background) throw Error(`Missing surface token: ${token}`)
            const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
            return { selector, token, foreground, background, ratio: (values[0] + .05) / (values[1] + .05) }
          })
        })
        return pairs
      }, specifications)
      for (const pair of pairs) {
        result.contrast.push({ theme, ...pair })
        assert.ok(pair.ratio >= 4.5, `${theme} ${pair.selector} against ${pair.token}: ${pair.ratio}`)
      }
    }
  }
  result.success = true
  console.log(`Presentation checks passed: ${result.images.length} decoded assets, ${result.contrast.length} gradient endpoint contrast pairs`)
} finally {
  fs.writeFileSync(out + `presentation-${root.includes(':5180') ? 'root' : 'development'}-result.json`, JSON.stringify(result, null, 2))
  await browser.close()
}
