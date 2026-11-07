import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const root = (process.env.CENT_TEST_WEB_URL || 'http://localhost:5173/cent-s').replace(/\/$/, '')
export const api = (process.env.CENT_TEST_API_URL || 'http://127.0.0.1:5108/api/cent/v1').replace(/\/$/, '')
const output = new URL('./artifacts/', import.meta.url)
mkdirSync(output, { recursive: true })
export const artifact = name => fileURLToPath(new URL(name, output))
export const browserOptions = {
  headless: true,
  ...(process.env.CENT_TEST_CHROME_PATH
    ? { executablePath: process.env.CENT_TEST_CHROME_PATH }
    : { channel: process.env.CENT_TEST_BROWSER_CHANNEL || 'chrome' }),
}

export async function requireLocalPreview() {
  for (const address of [root, api]) {
    const parsed = new URL(address)
    if (!['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)) {
      throw new Error('These browser checks create test data and run only against a local preview.')
    }
  }
  const response = await fetch(api + '/status')
  if (!response.ok || (await response.json()).payments !== 'DEVELOPMENT_MOCK') {
    throw new Error('Start Cent.Preview with development mock payments before running browser checks.')
  }
}
