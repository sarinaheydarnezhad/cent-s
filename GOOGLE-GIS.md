# Google Identity Services

GIS is the only Google authentication implementation. The SDK renders its official button, receives a server nonce and returns an ID token to the Cent GIS completion endpoint. Cent verifies the signature, issuer, audience, lifetime and challenge binding before issuing its existing session.

The authorization-code client, PKCE helper, callback page/routes and legacy browser tests were removed. Selecting a historical backend mode no longer enables them. Do not restore those endpoints as a runtime fallback.

See [Authentication](AUTHENTICATION.md) and the backend docs/CENT-AUTHENTICATION.md implementation report for current contracts, security, configuration, tests and deployment preparation. Older audit/evidence files describe historical behavior only.
