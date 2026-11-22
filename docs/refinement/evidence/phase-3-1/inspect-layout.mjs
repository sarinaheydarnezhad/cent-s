import { chromium } from '../../../../tests/browser/node_modules/playwright/index.mjs'
import { browserOptions } from '../../../../tests/browser/environment.mjs'
const browser=await chromium.launch(browserOptions)
try {
 const page=await browser.newPage({viewport:{width:1024,height:900}})
 await page.goto('http://127.0.0.1:5173/cent-s/');await page.waitForTimeout(800)
 console.log(JSON.stringify(await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('body *')].map(el=>{const b=el.getBoundingClientRect();return {tag:el.tagName,class:el.className,left:b.left,right:b.right,width:b.width}}).filter(b=>b.left<0||b.right>innerWidth)})),null,2))
} finally {await browser.close()}
