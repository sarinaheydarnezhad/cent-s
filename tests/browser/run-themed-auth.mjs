// Runs existing suites unchanged with a browser context system appearance.
import { chromium } from 'playwright'
import { argv } from 'node:process'
const colorScheme=argv[2]
const suite=argv[3]
if(!['light','dark'].includes(colorScheme)||!['google-gis','google-auth'].includes(suite))throw Error('Expected light|dark google-gis|google-auth')
const launch=chromium.launch.bind(chromium)
chromium.launch=async options=>{
  const browser=await launch(options)
  const newContext=browser.newContext.bind(browser)
  browser.newContext=options=>newContext({...options,colorScheme})
  return browser
}
await import(`./check-${suite}.mjs`)
