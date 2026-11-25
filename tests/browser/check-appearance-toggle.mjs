/* global document, window, getComputedStyle, innerWidth, URL, console, localStorage */
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { root, artifact, browserOptions } from './environment.mjs'

const browser = await chromium.launch(browserOptions)
const checks = []
const toggle = page => page.locator('.appearance-toggle').first()
const theme = page => page.locator('html').getAttribute('data-theme')
async function mock(context) {
  await context.route('**/api/cent/v1/**', route => route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify(route.request().url().endsWith('/google/config') ? {enabled:false,mode:'GisIdToken',clientId:null} : {}) }))
  await context.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { window.__themeAtDomReady = document.documentElement.dataset.theme }, {once:true}))
}
try {
  for (const colorScheme of ['light','dark']) {
    const context = await browser.newContext({colorScheme,viewport:{width:390,height:844}})
    await mock(context)
    const page = await context.newPage(); await page.goto(root+'/login'); await toggle(page).waitFor()
    assert.equal(await theme(page),colorScheme)
    assert.equal(await page.evaluate(() => window.__themeAtDomReady),colorScheme)
    assert.equal(await page.evaluate(() => localStorage.getItem('itatest:appearance:v1')),colorScheme)
    assert.equal(await page.locator('.appearance-control select').count(),0)
    assert.equal(await toggle(page).getAttribute('aria-label'),colorScheme==='dark'?'تغییر به حالت روشن':'تغییر به حالت تاریک')
    assert.equal(await toggle(page).locator('svg').getAttribute('aria-hidden'),'true')
    const opposite = colorScheme==='dark'?'light':'dark'
    await toggle(page).click(); assert.equal(await theme(page),opposite)
    await page.reload(); await toggle(page).waitFor()
    assert.equal(await theme(page),opposite); assert.equal(await page.evaluate(() => window.__themeAtDomReady),opposite)
    await page.emulateMedia({colorScheme}); assert.equal(await theme(page),opposite)
    await toggle(page).focus(); await page.keyboard.press('Space'); assert.equal(await theme(page),colorScheme)
    await page.keyboard.press('Enter'); assert.equal(await theme(page),opposite)
    assert.equal(await toggle(page).evaluate(el => el===document.activeElement),true)
    const focus = await toggle(page).evaluate(el => ({outline:getComputedStyle(el).outlineStyle,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}))
    assert.notEqual(focus.outline,'none'); assert.equal(focus.width,44); assert.equal(focus.height,44)
    await page.getByRole('link',{name:'ایتاتست — صفحه اصلی'}).first().click(); assert.equal(await theme(page),opposite)
    for(const selected of ['light','dark']) {
      if(await theme(page)!==selected) await toggle(page).click()
      for(const width of [320,375,390,768,1024,1280,1440]) {
        await page.setViewportSize({width,height:900})
        const box = await toggle(page).boundingBox()
        assert.deepEqual([box.width, box.height], [44, 44], `${selected} theme toggle at ${width}px`)
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth+1),`${selected} home overflow ${width}`)
      }
    }
    assert.match(await page.title(),/Itatest/)
    assert.equal(await page.locator('link[rel=icon][type="image/svg+xml"]').getAttribute('href'),new URL(root+'/brand/favicon.svg').pathname)
    const other = await context.newPage(); await other.goto(root+'/login'); await toggle(other).waitFor()
    await toggle(page).click()
    await other.waitForFunction(expected => document.documentElement.dataset.theme===expected,await theme(page))
    await page.evaluate(() => localStorage.clear())
    await other.waitForFunction(expected => document.documentElement.dataset.theme===expected,colorScheme)
    checks.push(`${colorScheme} OS default saved before React; opposite-action icon/name; mouse/Space/Enter; focus/44px target; reload/navigation; OS independence; seven widths/both themes; title/favicon; cross-tab switching/clear`)
    await context.close()
  }
  for(const saved of ['system','invalid']) for(const colorScheme of ['light','dark']) {
    const context = await browser.newContext({colorScheme}); await mock(context)
    await context.addInitScript(saved => { if (!localStorage.getItem('phase31-seeded')) { localStorage.setItem('itatest:appearance:v1',saved); localStorage.setItem('phase31-seeded','yes') } },saved)
    const page = await context.newPage(); await page.goto(root+'/login'); await toggle(page).waitFor()
    assert.equal(await page.evaluate(() => window.ItatestAppearance.getPreference()),colorScheme)
    assert.equal(await page.evaluate(() => localStorage.getItem('itatest:appearance:v1')),colorScheme)
    assert.equal(await page.evaluate(() => window.__themeAtDomReady),colorScheme)
    await page.reload(); await toggle(page).waitFor(); assert.equal(await theme(page),colorScheme)
    await context.close()
  }
  checks.push('Legacy System and invalid saved preferences migrate to Light/Dark under both OS defaults and persist across reload')
  const blocked = await browser.newContext({colorScheme:'dark'}); await mock(blocked)
  await blocked.addInitScript(() => Object.defineProperty(window,'localStorage',{get(){throw Error('blocked test storage')}}))
  const blockedPage = await blocked.newPage(); await blockedPage.goto(root+'/login'); await toggle(blockedPage).click()
  assert.equal(await theme(blockedPage),'light'); await blocked.close()
  checks.push('Storage-denied startup and in-memory switching remain usable')
  const startup = await browser.newContext({colorScheme:'dark'})
  await startup.route('**/src/main.tsx*',route => route.abort())
  await startup.route('**/assets/index-*.js',route => route.abort())
  const startupPage = await startup.newPage(); await startupPage.goto(root+'/login')
  assert.equal(await startupPage.locator('#root').textContent(),'')
  assert.equal(await startupPage.evaluate(() => getComputedStyle(document.documentElement).backgroundColor),'rgb(24, 33, 39)')
  await startup.close()
  checks.push('Dark startup background resolves when React cannot load')
  writeFileSync(artifact('appearance-result.json'),JSON.stringify({success:true,kind:'Light/Dark appearance checks; synthetic API responses',checks},null,2))
  console.log(`Appearance browser checks passed: ${checks.length} groups`)
} finally { await browser.close() }
