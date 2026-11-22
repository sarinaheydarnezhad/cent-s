# Cent on Cloudflare Pages

For Google Identity Services mode, follow [GOOGLE-GIS.md](GOOGLE-GIS.md) before
publishing. The backend must already support `/auth/google/config`; it supplies
the mode and public client ID. No new Vite variable is needed. `public/_headers`
adds login popup compatibility and retains callback security headers. Review any
external CSP/COOP/cache/analytics rules; no live settings are changed by these files.

The Pages project is `itatest`, with production branch `main` and custom hosts
`itatest.ir` and `www.itatest.ir`. The Cent API remains on Liara at
`https://lerona-app.com/api/cent/v1`; `lerona-api` is the Liara application name.

Build and upload from this directory using PowerShell:

```powershell
$env:VITE_BASE_PATH = '/'
$env:VITE_CENT_API_URL = 'https://lerona-app.com/api/cent/v1'
$env:CENT_HOSTING = 'cloudflare'
npm.cmd run build
npx.cmd wrangler@4.160.0 pages deploy dist --project-name itatest --branch main
```

Log into the intended Cloudflare account with Wrangler if necessary. Upload only
`dist`; database, payment and SMS credentials belong on the backend. This is a
direct-upload project; Git pushes do not automatically publish it to Cloudflare.
Review local changes before publishing. The GitHub Pages workflow remains separate.

Cloudflare builds omit the top-level `404.html` so Pages uses its native SPA
fallback. Do not add a wildcard `/* /index.html 200` redirect: redirects also
match real asset requests. Ordinary builds retain GitHub Pages' `404.html`.
Cloudflare-managed builds can set `CLOUDFLARE_PAGES=1` instead of `CENT_HOSTING`.

DNS configuration:

| Host | Type | Target | Proxy |
| --- | --- | --- | --- |
| `itatest.ir` | CNAME | `itatest.pages.dev` | Proxied |
| `www.itatest.ir` | CNAME | `itatest.pages.dev` | Proxied |

Hostiran's nameservers for **itatest.ir only** are `brit.ns.cloudflare.com` and
`leonidas.ns.cloudflare.com`. Leave `lerona-app.com` on its existing Liara DNS.
Both custom hosts must also be attached under the Pages project's custom domains.
DNS delegation and certificate issuance must finish before testing custom HTTPS.

Liara allows exactly `https://itatest.ir`, `https://www.itatest.ir`,
`https://itatest.pages.dev`, and the earlier GitHub Pages origin for Cent.
`Cent__ClientBaseUrl=https://itatest.ir`; `Cent__PublicApiBaseUrl` stays
`https://lerona-app.com`. Preserve every unrelated setting when updating Liara.
Changing Liara environment values restarts its current image. Frontend publishing
does not require uploading pending backend code or applying migrations.

Verify the five public courses, direct `/courses/math` and `/login` links,
refreshes, mobile layout, the actual API URL and CORS, and JavaScript/PDF worker
content types after publishing. Private study and administrator endpoints must
continue requiring authentication.
