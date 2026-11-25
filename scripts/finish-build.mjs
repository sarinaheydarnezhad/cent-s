import { copyFileSync, rmSync, readdirSync } from 'node:fs'

function assertPrivateContentExcluded(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory)
    if (/^(?:Lessons|provenance|figures|Content|docs|\.preview-artifacts)$/i.test(entry.name) || /\.(?:zip|db|bak|mdf|ldf)(?:$|\.)/i.test(entry.name) || /^(?:reviewed-v4|curriculum.*|.*answers.*|mock-exams|lesson-sections)\.(?:json|md|html|txt)$/i.test(entry.name)) throw new Error(`Private educational content in frontend build: ${entry.name}`)
    if (entry.isDirectory()) assertPrivateContentExcluded(target)
  }
}
assertPrivateContentExcluded(new URL('../dist/', import.meta.url))

const fallback = new URL('../dist/404.html', import.meta.url)
if (process.env.CENT_HOSTING === 'cloudflare' || process.env.CLOUDFLARE_PAGES === '1') {
  // Pages serves unknown routes through index.html when no top-level 404 exists.
  // A catch-all _redirects rule would also intercept real scripts and PDF assets.
  rmSync(fallback, { force: true })
} else {
  copyFileSync(new URL('../dist/index.html', import.meta.url), fallback)
}
