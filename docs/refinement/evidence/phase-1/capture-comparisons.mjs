/* global document */
import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
import { pathToFileURL, fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
const out=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(out,'../../../..')
const browser=await chromium.launch({channel:'chrome',headless:true})
try {
  const page=await browser.newPage({viewport:{width:1280,height:1080}})
  await page.goto(pathToFileURL(path.join(out,'logo-comparison.html')).href)
  await page.screenshot({path:path.join(out,'logo-comparison.png'),fullPage:true})
  for(const size of [32,180,192]) {
    await page.setViewportSize({width:size,height:size})
    await page.setContent(`<style>body{margin:0}img{display:block;width:${size}px;height:${size}px}</style><img src="${pathToFileURL(path.join(root,'public/brand/favicon.svg')).href}">`)
    await page.waitForFunction(()=>document.querySelector('img').complete)
    await page.screenshot({path:path.join(root,`public/brand/favicon-${size}.png`)})
  }
  const comparisons=[
    ['Home','../runtime-2026-11-18/runtime-home-1440.png','home-light-1440.png','home-dark-1440.png'],
    ['Login','../baseline-login-390.png','login-light-390.png','login-dark-390.png'],
    ['Dashboard','../runtime-2026-11-18/runtime-dashboard-populated-390.png','dashboard-light-390.png','dashboard-dark-390.png'],
    ['Reader','../runtime-2026-11-18/runtime-reader-pdf-1440.png','reader-light-1440.png','reader-dark-1440.png'],
  ]
  const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Itatest Phase 1 visual comparisons</title><style>body{font:16px Arial;margin:24px;background:#F5F7F7;color:#29343C}section{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:32px 0}img{width:100%;vertical-align:top}article{min-width:0}h1{font-size:24px}</style><h1>Actual Phase 0 / Phase 1 light / Phase 1 dark</h1><p>Local preview data differs between sessions. Login baseline originally had an unavailable API. Comparison concerns brand/theme foundations, not data identity or later page redesign. No generated mockups.</p>${comparisons.map(([name,original,light,dark])=>`<h2>${name}</h2><section>${[['Phase 0',original],['Phase 1 light',light],['Phase 1 dark',dark]].map(([title,src])=>`<article><h3>${title}</h3><img src="${src}" alt="${name} ${title}"></article>`).join('')}</section>`).join('')}`
  fs.writeFileSync(path.join(out,'visual-comparisons.html'),html)
  await page.setViewportSize({width:1440,height:1000})
  await page.goto(pathToFileURL(path.join(out,'visual-comparisons.html')).href)
  await page.screenshot({path:path.join(out,'visual-comparisons.png'),fullPage:true})
}finally{await browser.close()}
