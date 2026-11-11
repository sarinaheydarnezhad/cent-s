import { copyFileSync, rmSync } from 'node:fs'

const fallback = new URL('../dist/404.html', import.meta.url)
if (process.env.CENT_HOSTING === 'cloudflare' || process.env.CLOUDFLARE_PAGES === '1') {
  // Pages serves unknown routes through index.html when no top-level 404 exists.
  // A catch-all _redirects rule would also intercept real scripts and PDF assets.
  rmSync(fallback, { force: true })
} else {
  copyFileSync(new URL('../dist/index.html', import.meta.url), fallback)
}
