---
title: "provider/token.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/token.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `provider/token.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](../client/contracts.md)
- [`client/endpoints.aug`](../client/endpoints.md)
- [`client/export.aug`](../client/export.md)
- [`client/login.aug`](../client/login.md)
- [`client/logout.aug`](../client/logout.md)
- [`client/protocol.aug`](../client/protocol.md)
- [`client/session.aug`](../client/session.md)
- [`client/views.aug`](../client/views.md)
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
- [`provider/authorization.aug`](authorization.md)
- [`provider/contracts.aug`](contracts.md)
- [`provider/credentials.aug`](credentials.md)
- [`provider/discovery.aug`](discovery.md)
- [`provider/export.aug`](export.md)
- [`provider/token.aug`](token.md)
- [`provider/userinfo.aug`](userinfo.md)
- [`provider/views.aug`](views.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
import AuthorizationCode and AccessGrant and TokenForm and TokenResponse and OAuthError and IdClaims from contracts
import settings and SigningKeys and KeyError and securityHeaders from common
import Crypto and signJwt and JwtError from august.crypto
import Clock from august.time
import ExpiringStore and StoreFull from august.memory
_oauthError(string code, string description) returns HttpResponse<Json> unless HttpError:
    return HttpResponse(body=Json(value=OAuthError(error=code, error_description=description)), status=400, headers=securityHeaders())
/** A real OAuth token endpoint. Exact client/redirect binding, S256 PKCE, expiry and one-use codes are enforced. Errors use OAuth JSON. */
endpoint POST "/provider/token" as token(HttpRequest http from request, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<AuthorizationCode> codes, resolve ExpiringStore<AccessGrant> access) returns HttpResponse<Json> uses crypto.sha256 and crypto.equal and crypto.random and crypto.signRsa and clock.now and keys.provider and codes.take and access.put unless CryptoError with status 503 and TimeError with status 503 and KeyError and JwtError and StoreFull with status 503 and HttpError:
    config = settings()
    try:
        form = http.form<TokenForm>()
        if form.grant_type != "authorization_code":
            return _oauthError(code="unsupported_grant_type", description="Only authorization_code is supported.")
        if form.client_id != config.clientId:
            return _oauthError(code="invalid_client", description="The registered client is required.")
        if not form.code.isToken(min=43, max=43) or not form.code_verifier.isToken(min=43, max=128):
            return _oauthError(code="invalid_grant", description="The authorization grant is invalid.")
        now = clock.now()
        match codes.take(key=form.code, now=now):
            when null:
                return _oauthError(code="invalid_grant", description="The authorization grant is invalid.")
            when some grant:
                challenge = crypto.sha256(input=form.code_verifier.bytes()).base64url()
                if grant.clientId != form.client_id or grant.redirectUri != form.redirect_uri or not crypto.equal(left=challenge.bytes(), right=grant.challenge.bytes()):
                    return _oauthError(code="invalid_grant", description="The authorization grant is invalid.")
                claims = IdClaims(iss=config.issuer, sub=grant.subject, aud=grant.clientId, exp=now + 300, iat=now, nonce=grant.nonce, name=grant.name)
                idToken = signJwt(key=keys.provider(), claims=Json(value=claims), kid="provider-1", tokenType="JWT")
                accessToken = crypto.random(size=32).base64url()
                value = AccessGrant(subject=grant.subject, name=grant.name, expires=now + 300)
                access.put(key=accessToken, value=value, expires=value.expires, now=now)
                body = TokenResponse(token_type="Bearer", access_token=accessToken, id_token=idToken, expires_in=300, scope="openid profile")
                return HttpResponse(body=Json(value=body), headers=securityHeaders())
    catch HttpError error:
        return _oauthError(code="invalid_request", description="Submit the required URL-encoded token fields once each.")
```

```aug [Braces]
import AuthorizationCode and AccessGrant and TokenForm and TokenResponse and OAuthError and IdClaims from contracts
import settings and SigningKeys and KeyError and securityHeaders from common
import Crypto and signJwt and JwtError from august.crypto
import Clock from august.time
import ExpiringStore and StoreFull from august.memory
_oauthError(string code, string description) returns HttpResponse<Json> unless HttpError {
    return HttpResponse(body=Json(value=OAuthError(error=code, error_description=description)), status=400, headers=securityHeaders())
}
/** A real OAuth token endpoint. Exact client/redirect binding, S256 PKCE, expiry and one-use codes are enforced. Errors use OAuth JSON. */
endpoint POST "/provider/token" as token(HttpRequest http from request, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<AuthorizationCode> codes, resolve ExpiringStore<AccessGrant> access) returns HttpResponse<Json> uses crypto.sha256 and crypto.equal and crypto.random and crypto.signRsa and clock.now and keys.provider and codes.take and access.put unless CryptoError with status 503 and TimeError with status 503 and KeyError and JwtError and StoreFull with status 503 and HttpError {
    config = settings()
    try {
        form = http.form<TokenForm>()
        if form.grant_type != "authorization_code" {
            return _oauthError(code="unsupported_grant_type", description="Only authorization_code is supported.")
        }
        if form.client_id != config.clientId {
            return _oauthError(code="invalid_client", description="The registered client is required.")
        }
        if not form.code.isToken(min=43, max=43) or not form.code_verifier.isToken(min=43, max=128) {
            return _oauthError(code="invalid_grant", description="The authorization grant is invalid.")
        }
        now = clock.now()
        match codes.take(key=form.code, now=now) {
            when null {
                return _oauthError(code="invalid_grant", description="The authorization grant is invalid.")
            }
            when some grant {
                challenge = crypto.sha256(input=form.code_verifier.bytes()).base64url()
                if grant.clientId != form.client_id or grant.redirectUri != form.redirect_uri or not crypto.equal(left=challenge.bytes(), right=grant.challenge.bytes()) {
                    return _oauthError(code="invalid_grant", description="The authorization grant is invalid.")
                }
                claims = IdClaims(iss=config.issuer, sub=grant.subject, aud=grant.clientId, exp=now + 300, iat=now, nonce=grant.nonce, name=grant.name)
                idToken = signJwt(key=keys.provider(), claims=Json(value=claims), kid="provider-1", tokenType="JWT")
                accessToken = crypto.random(size=32).base64url()
                value = AccessGrant(subject=grant.subject, name=grant.name, expires=now + 300)
                access.put(key=accessToken, value=value, expires=value.expires, now=now)
                body = TokenResponse(token_type="Bearer", access_token=accessToken, id_token=idToken, expires_in=300, scope="openid profile")
                return HttpResponse(body=Json(value=body), headers=securityHeaders())
            }
        }
    }
    catch HttpError error {
        return _oauthError(code="invalid_request", description="Submit the required URL-encoded token fields once each.")
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`_oauthError`](token.md#symbol-_oauthError) is a function returning `HttpResponse<Json>`.
- [`token`](token.md#symbol-token) handles `POST` `/provider/token` returning `HttpResponse<Json>`.

### `token` {#symbol-token}

[source](token.md#code)

**Inputs**

- `http` (`HttpRequest`) — read from the HTTP request.
- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.
- `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)) — injected; callers omit it.
- `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)) — injected; callers omit it.
- `codes` ([`ExpiringStore<AuthorizationCode>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.
- `access` ([`ExpiringStore<AccessGrant>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.

Returns: `HttpResponse<Json>`.

Capabilities: [`crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.provider`](../common/keys.md#symbol-SigningKeys.provider), [`codes.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`access.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Can fail with `CryptoError`, `TimeError`, `KeyError`, `JwtError`, `StoreFull`, `HttpError`. Callers must catch or propagate these errors.

HTTP route: `POST` `/provider/token`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

**What it does**

- Set `config` to call [`settings`](../common/settings.md#symbol-settings).
- Try these operations:
  - Set `form` to call `form` on `http` with type arguments [`TokenForm`](contracts.md#symbol-TokenForm).
  - If `grant_type` of `form` does not equal `"authorization_code"`:
    - Return call [`_oauthError`](token.md#symbol-_oauthError) with `code` = `"unsupported_grant_type"`; `description` = `"Only authorization_code is supported."`.
  - If `client_id` of `form` does not equal `clientId` of `config`:
    - Return call [`_oauthError`](token.md#symbol-_oauthError) with `code` = `"invalid_client"`; `description` = `"The registered client is required."`.
  - If not (call `isToken` on `code` of `form` with `min` = `43`; `max` = `43`) or not (call `isToken` on `code_verifier` of `form` with `min` = `43`; `max` = `128`):
    - Return call [`_oauthError`](token.md#symbol-_oauthError) with `code` = `"invalid_grant"`; `description` = `"The authorization grant is invalid."`.
  - Set `now` to call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
  - Select the matching case for call [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `codes` with `key` = `code` of `form`; `now` = `now`:
    - A null value, including omitted optional input:
      - Return call [`_oauthError`](token.md#symbol-_oauthError) with `code` = `"invalid_grant"`; `description` = `"The authorization grant is invalid."`.
    - A present, non-null value, named `grant`:
      - Set `challenge` to call `base64url` on call [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) on `crypto` with `input` = call `bytes` on `code_verifier` of `form`.
      - If ((`clientId` of `grant` does not equal `client_id` of `form`) or (`redirectUri` of `grant` does not equal `redirect_uri` of `form`)) or not (call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` = call `bytes` on `challenge`; `right` = call `bytes` on `challenge` of `grant`):
        - Return call [`_oauthError`](token.md#symbol-_oauthError) with `code` = `"invalid_grant"`; `description` = `"The authorization grant is invalid."`.
      - Set `claims` to call [`IdClaims`](contracts.md#symbol-IdClaims) with `iss` = `issuer` of `config`; `sub` = `subject` of `grant`; `aud` = `clientId` of `grant`; `exp` = (`now` plus `300`); `iat` = `now`; `nonce` = `nonce` of `grant`; `name` = `name` of `grant`.
      - Set `idToken` to call [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` = call [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider) on `keys`; `claims` = call `Json` with `value` = `claims`; `kid` = `"provider-1"`; `tokenType` = `"JWT"`; inject `crypto` from `crypto`.
      - Set `accessToken` to call `base64url` on call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` = `32`.
      - Set `value` to call [`AccessGrant`](contracts.md#symbol-AccessGrant) with `subject` = `subject` of `grant`; `name` = `name` of `grant`; `expires` = (`now` plus `300`).
      - Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `access` with `key` = `accessToken`; `value` = `value`; `expires` = `expires` of `value`; `now` = `now`.
      - Set `body` to call [`TokenResponse`](contracts.md#symbol-TokenResponse) with `token_type` = `"Bearer"`; `access_token` = `accessToken`; `id_token` = `idToken`; `expires_in` = `300`; `scope` = `"openid profile"`.
      - Return call `HttpResponse` with `body` = call `Json` with `value` = `body`; `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
- If they fail with `HttpError`, name the failure `error` and recover:
  - Return call [`_oauthError`](token.md#symbol-_oauthError) with `code` = `"invalid_request"`; `description` = `"Submit the required URL-encoded token fields once each."`.

**Author documentation**

A real OAuth token endpoint. Exact client/redirect binding, S256 PKCE, expiry and one-use codes are enforced. Errors use OAuth JSON.

### `_oauthError` {#symbol-_oauthError}

[source](token.md#code)

Private to its defining scope.

**Inputs**

- `code` (`string`) — required labeled input.
- `description` (`string`) — required labeled input.

Returns: `HttpResponse<Json>`.

Can fail with `HttpError`. Callers must catch or propagate these errors.

**What it does**

- Return call `HttpResponse` with `body` = call `Json` with `value` = call [`OAuthError`](contracts.md#symbol-OAuthError) with `error` = `code`; `error_description` = `description`; `status` = `400`; `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Capability interface from `august.crypto`.

- [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`.
- [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) (`size`: `int`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) (`input`: `Bytes`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa) (`key`: `RsaPrivateKey`, `input`: `Bytes`) → `Bytes`; can fail with `CryptoError`.

#### [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError)

Class from `august.crypto`.

Used as a type or provider.

#### [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt)

Function from `august.crypto`.

- [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) (`key`: `RsaPrivateKey`, `claims`: `Json`, `kid`: `string`, `tokenType`: `string`) → `string`; inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto); uses [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa); can fail with `JwtError`.

#### [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)

Capability interface from `august.memory`.

- [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) (`key`: `string`, `value`: `T`, `expires`: `int`, `now`: `int`) → `void`; can fail with `StoreFull`.
- [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) (`key`: `string`, `now`: `int`) → `optional T`.

#### [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull)

Class from `august.memory`.

Used as a type or provider.

#### [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)

Capability interface from `august.time`.

- [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.

#### [`securityHeaders`](../common/headers.md#symbol-securityHeaders)

Function from `common`.

- [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (no caller inputs) → `Headers`; can fail with `HttpError`.

#### [`KeyError`](../common/keys.md#symbol-KeyError)

Class from `common`.

Used as a type or provider.

#### [`SigningKeys`](../common/keys.md#symbol-SigningKeys)

Capability interface from `common`.

- [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider) (no caller inputs) → `RsaPrivateKey`; can fail with `KeyError`.

#### [`Settings`](../common/settings.md#symbol-Settings)

Record.

- Read `clientId` (`string`).
- Read `issuer` (`string`).

#### [`settings`](../common/settings.md#symbol-settings)

Function from `common`.

- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings).

#### [`AccessGrant`](contracts.md#symbol-AccessGrant)

Record from `contracts`.

- Construct with `subject`: `string`, `name`: `string`, `expires`: `int` → [`AccessGrant`](contracts.md#symbol-AccessGrant).
- Read `expires` (`int`).

#### [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode)

Record from `contracts`.

- Read `challenge` (`string`).
- Read `clientId` (`string`).
- Read `name` (`string`).
- Read `nonce` (`string`).
- Read `redirectUri` (`string`).
- Read `subject` (`string`).

#### [`IdClaims`](contracts.md#symbol-IdClaims)

Record from `contracts`.

- Construct with `iss`: `string`, `sub`: `string`, `aud`: `string`, `exp`: `int`, `iat`: `int`, `nonce`: `string`, `name`: `string` → [`IdClaims`](contracts.md#symbol-IdClaims).

#### [`OAuthError`](contracts.md#symbol-OAuthError)

Record from `contracts`.

- Construct with `error`: `string`, `error_description`: `string` → [`OAuthError`](contracts.md#symbol-OAuthError).

#### [`TokenForm`](contracts.md#symbol-TokenForm)

Record from `contracts`.

- Read `client_id` (`string`).
- Read `code` (`string`).
- Read `code_verifier` (`string`).
- Read `grant_type` (`string`).
- Read `redirect_uri` (`string`).

#### [`TokenResponse`](contracts.md#symbol-TokenResponse)

Record from `contracts`.

- Construct with `token_type`: `string`, `access_token`: `string`, `id_token`: `string`, `expires_in`: `int`, `scope`: `string` → [`TokenResponse`](contracts.md#symbol-TokenResponse).

### Built-in operations used by this file

- `Bytes.base64url` (no inputs) → `string`: Encode immutable bytes as unpadded RFC 4648 URL-safe base64.
- `HttpRequest.form` (no inputs) → `TokenForm`: Decode a form record inside a handler so protocol-specific error responses can be returned. Can fail with `HttpError`.
- `string.bytes` (no inputs) → `Bytes`: Encode this string as immutable UTF-8 bytes.
- `string.isToken` (`min`: `int`, `max`: `int`) → `bool`: Require an ASCII RFC 3986 unreserved token with a bounded length.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
