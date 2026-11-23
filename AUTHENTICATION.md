# Itatest authentication

The application exposes two login methods: Iranian mobile SMS OTP and Google's official GIS button. They issue the same Cent bearer session. The profile page can link a proven mobile or Google identity to the current account. Accounts never merge automatically by email or phone.

The complete English implementation report (root causes, architecture, endpoints, settings, tests, migration, rollback, account recovery and Lerona isolation) is in the adjacent backend repository at docs/CENT-AUTHENTICATION.md.

## Local configuration

Use VITE_CENT_API_URL=/api/cent/v1, VITE_BASE_PATH=/cent-s/ and CENT_BACKEND_URL=http://127.0.0.1:5108. Configure the backend's exact Cent allowed frontend origin, Cent Google enablement/public client ID and independent Cent SMS secrets. Google settings are discovered through /auth/google/config. Do not put secrets in Vite variables.

For production https://itatest.ir use VITE_BASE_PATH=/ and the operator's actual HTTPS Cent API base URL. The currently documented API is https://lerona-app.com/api/cent/v1. This is shared hosting, not shared accounts. With the existing Cloudflare workflow set CENT_HOSTING=cloudflare. Review dist/_headers, CSP, HTTPS, CORS, API connectivity and SPA fallback before release.

Google Cloud needs exact authorized JavaScript origins, including https://itatest.ir and the local origin. The JavaScript GIS flow uses no redirect URI/client secret. See [official Google setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid). Loading the SDK and rendering its button remains Google's responsibility; no imitation button is shipped.

## Behavior and verification

Phone and OTP inputs accept Persian/Arabic digits and use numeric mobile keyboards. OTP paste, focus, resend countdown, duplicate-submission protection, Persian errors and safe protected-page return are supported. OTPs and challenge proofs live only in memory; refresh returns to number entry while the backend retains cooldown and abuse budgets. Sessions use existing tab-scoped storage, /me restoration, seven-day expiry and server logout. There is no refresh-token endpoint.

Run npm.cmd test, npm.cmd run lint and npm.cmd run build. Start a local Vite server, then run npm.cmd --prefix tests/browser run test:auth and npm.cmd --prefix tests/browser run test:google-gis with CENT_TEST_WEB_URL set to that local base URL. Browser checks intercept APIs and GIS and send no real SMS or Google credentials. They do not establish real provider or production behavior.

Email/password login and Authorization Code/PKCE are removed. Existing accounts, IDs and purchase associations remain intact. Signed-in users can link an identity from their profile. Signed-out password-only users require operator-supervised ownership recovery against the original account; never silently attach a matching Google email.
