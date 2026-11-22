/* global console, document, window, getComputedStyle */
import fs from 'node:fs'
import { URL } from 'node:url'
import { chromium } from '../../../tests/browser/node_modules/playwright/index.mjs'

const root = 'http://127.0.0.1:5173/cent-s'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const report = { kind: 'Actual unmocked local frontend; backend unavailable', screenshots: [], matrix: [], redirects: [], pageErrors: [] }
const routes = ['/', '/exam', '/courses/math', '/diagnostic/intro', '/package', '/login', '/missing-page', '/auth/google/callback']
try {
  const context = await browser.newContext()
  const page = await context.newPage()
  page.on('pageerror', error => report.pageErrors.push(error.message))
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of routes) {
      await page.goto(root + route)
      await page.locator('#root > *').first().waitFor()
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(600)
      // Wait for actual request failure; do not manufacture response data.
      if (['/', '/exam', '/courses/math', '/package'].includes(route)) {
        await page.locator('.cent-error').first().waitFor({ timeout: 15000 })
      }
      const metrics = await page.evaluate(() => ({
        viewport: window.innerWidth, scrollWidth: document.documentElement.scrollWidth,
        bodyBackground: getComputedStyle(document.body).background,
        font: getComputedStyle(document.body).fontFamily,
        unnamedButtons: [...document.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).map(b => b.className),
      }))
      report.matrix.push({ width, route, ...metrics })
      if ([320, 390, 1440].includes(width)) {
        const name = `baseline-${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}-${width}.png`
        await page.screenshot({ path: new URL(name, import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true })
        report.screenshots.push({ name, route, width, height: 900, theme: 'existing light appearance', data: 'unmocked; API unavailable where relevant' })
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto(root + '/login')
  await page.getByRole('button', { name: 'ثبت‌نام', exact: true }).click()
  await page.screenshot({ path: new URL('baseline-register-390.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true })
  report.screenshots.push({ name: 'baseline-register-390.png', route: '/login', state: 'register', width: 390, height: 900, theme: 'existing light appearance' })
  const mobileMenu = page.getByRole('button', { name: 'نمایش منو' })
  await mobileMenu.click()
  await page.screenshot({ path: new URL('baseline-menu-390.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true })
  report.screenshots.push({ name: 'baseline-menu-390.png', route: '/login', state: 'menu open', width: 390, height: 900, theme: 'existing light appearance' })
  for (const route of ['/student', '/student/study/00000000-0000-0000-0000-000000000001', '/admin', '/checkout?product=unknown', '/diagnostic/test', '/diagnostic/results', '/student/simulators/result', '/checkout/success?order=unknown']) {
    await page.goto(root + route)
    await page.waitForURL(root + '/login')
    report.redirects.push({ requested: route, final: new URL(page.url()).pathname })
  }
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(root + '/login')
  const light = await page.evaluate(() => ({ background: getComputedStyle(document.body).background, form: getComputedStyle(document.querySelector('.auth-card')).backgroundColor }))
  await page.emulateMedia({ colorScheme: 'dark' })
  const dark = await page.evaluate(() => ({ background: getComputedStyle(document.body).background, form: getComputedStyle(document.querySelector('.auth-card')).backgroundColor }))
  report.systemAppearance = { light, dark, identical: JSON.stringify(light) === JSON.stringify(dark) }
  fs.writeFileSync(new URL('runtime-baseline.json', import.meta.url), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ screenshots: report.screenshots.length, matrixCases: report.matrix.length, overflows: report.matrix.filter(x => x.scrollWidth > x.viewport), redirects: report.redirects, pageErrors: report.pageErrors, systemAppearance: report.systemAppearance }, null, 2))
} finally { await browser.close() }
