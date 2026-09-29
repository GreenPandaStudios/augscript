# Same-app OpenID Connect login

The provider and its client are August modules in one native executable. The client uses the real discovery, token, JWKS and UserInfo HTTP endpoints hosted by that executable.

```sh
node scripts/bootstrap-native.mjs
node bin/aug.mjs run examples/oidc-login
```

Open `http://127.0.0.1:8787`. Sign in with username **ada** and password **august-demo**. API contracts and an interactive explorer are at `/openapi.json` and `/docs`.

## Flow

1. `/login/start` fetches discovery and creates a browser-bound transaction with random state, nonce and PKCE verifier.
2. `/provider/authorize` checks the registered client, exact callback and S256 challenge, then renders an August login component.
3. `/provider/login` checks the browser cookie, Origin, CSRF token and PBKDF2 password verifier before issuing a short-lived authorization code.
4. `/login/callback` consumes its transaction and exchanges that code over HTTP. `/provider/token` consumes the code and checks PKCE, expiry and client/redirect binding.
5. The client fetches JWKS, verifies the RS256 ID token, validates issuer/audience/time/nonce, and checks the UserInfo subject. It then creates a separately signed application-session JWT.
6. `/me` verifies the session JWT and its live registry entry. POST `/logout` checks Origin and CSRF and revokes that entry.

All imports, bindings, capabilities, effects and checked errors are visible in the August modules. Native code supplies transport, cryptographic primitives, time and serialization.

## Development profile

This example explicitly binds to loopback HTTP. Its one documented demo account, signing keys and bounded stores are process-local. Restarting invalidates codes and sessions. External deployments need HTTPS settings, Secure cookies, persistent account/password management, signing-key rotation and shared revocation storage. This is an implemented authorization-code profile, not a certified identity provider.

Protocol rules are grounded in [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation), [S256 PKCE](https://datatracker.ietf.org/doc/html/rfc7636) and [JWT validation guidance](https://www.rfc-editor.org/rfc/rfc8725.html). The current client accepts the configured single-audience RS256 profile; broader providers need additional supported claim and JOSE variants.

`tests/oidc-login.test.mjs` runs the browser flow, verifies the provider signature with Node's independent JWK/RSA implementation, and checks replay, PKCE, tampering, token-context separation and revocation. See `docs/web-library-gaps.md` for remaining language and library work.
