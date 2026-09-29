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

<a id="symbol-token"></a>
### `token` · [source](token.md#code)

A real OAuth token endpoint. Exact client/redirect binding, S256 PKCE, expiry and one-use codes are enforced. Errors use OAuth JSON.

**Inputs:** Take `http` (`HttpRequest`) from HTTP request. Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`. Resolve [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) as `clock`. Resolve [`SigningKeys`](../common/keys.md#symbol-SigningKeys) as `keys`. Resolve [`ExpiringStore<AuthorizationCode>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `codes`. Resolve [`ExpiringStore<AccessGrant>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `access`.

Returns `HttpResponse<Json>`. Uses [`crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.provider`](../common/keys.md#symbol-SigningKeys.provider), [`codes.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`access.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). Can fail with `CryptoError`, `TimeError`, `KeyError`, `JwtError`, `StoreFull`, `HttpError`.

HTTP route: `POST` `/provider/token`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

- Set `config` to the result of [`settings`](../common/settings.md#symbol-settings).
- Try:
  - Set `form` to the result of `form` on `http` with type arguments [`TokenForm`](contracts.md#symbol-TokenForm).
  - If `grant_type` of `form` does not equal `"authorization_code"`:
    - Return the result of [`_oauthError`](token.md#symbol-_oauthError) with `code` as `"unsupported_grant_type"`, `description` as `"Only authorization_code is supported."`.
  - If `client_id` of `form` does not equal `clientId` of `config`:
    - Return the result of [`_oauthError`](token.md#symbol-_oauthError) with `code` as `"invalid_client"`, `description` as `"The registered client is required."`.
  - If not (the result of `isToken` on `code` of `form` with `min` as `43`, `max` as `43`) or not (the result of `isToken` on `code_verifier` of `form` with `min` as `43`, `max` as `128`):
    - Return the result of [`_oauthError`](token.md#symbol-_oauthError) with `code` as `"invalid_grant"`, `description` as `"The authorization grant is invalid."`.
  - Set `now` to the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
  - Match the result of [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `codes` with `key` as `code` of `form`, `now`:
    - A null value, including omitted optional input:
      - Return the result of [`_oauthError`](token.md#symbol-_oauthError) with `code` as `"invalid_grant"`, `description` as `"The authorization grant is invalid."`.
    - A present, non-null value, named `grant`:
      - Set `challenge` to the result of `base64url` on the result of [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) on `crypto` with `input` as the result of `bytes` on `code_verifier` of `form`.
      - If ((`clientId` of `grant` does not equal `client_id` of `form`) or (`redirectUri` of `grant` does not equal `redirect_uri` of `form`)) or not (the result of [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` as the result of `bytes` on `challenge`, `right` as the result of `bytes` on `challenge` of `grant`):
        - Return the result of [`_oauthError`](token.md#symbol-_oauthError) with `code` as `"invalid_grant"`, `description` as `"The authorization grant is invalid."`.
      - Set `claims` to a new [`IdClaims`](contracts.md#symbol-IdClaims) with `iss` as `issuer` of `config`, `sub` as `subject` of `grant`, `aud` as `clientId` of `grant`, `exp` as `now` plus `300`, `iat` as `now`, `nonce` as `nonce` of `grant`, `name` as `name` of `grant`.
      - Set `idToken` to the result of [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` as the result of [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider) on `keys`, `claims` as a new `Json` with `value` as `claims`, `kid` as `"provider-1"`, `tokenType` as `"JWT"` using `crypto`.
      - Set `accessToken` to the result of `base64url` on the result of [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` as `32`.
      - Set `value` to a new [`AccessGrant`](contracts.md#symbol-AccessGrant) with `subject` as `subject` of `grant`, `name` as `name` of `grant`, `expires` as `now` plus `300`.
      - Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `access` with `key` as `accessToken`, `value`, `expires` as `expires` of `value`, `now`.
      - Set `body` to a new [`TokenResponse`](contracts.md#symbol-TokenResponse) with `token_type` as `"Bearer"`, `access_token` as `accessToken`, `id_token` as `idToken`, `expires_in` as `300`, `scope` as `"openid profile"`.
      - Return a new `HttpResponse` with `body` as a new `Json` with `value` as `body`, `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
- Catch `HttpError` as `error`:
  - Return the result of [`_oauthError`](token.md#symbol-_oauthError) with `code` as `"invalid_request"`, `description` as `"Submit the required URL-encoded token fields once each."`.

<a id="symbol-_oauthError"></a>
### `_oauthError` · [source](token.md#code)

Private to its defining scope.

**Inputs:** Take `code` (`string`). Take `description` (`string`).

Returns `HttpResponse<Json>`. Can fail with `HttpError`.

- Return a new `HttpResponse` with `body` as a new `Json` with `value` as a new [`OAuthError`](contracts.md#symbol-OAuthError) with `error` as `code`, `error_description` as `description`, `status` as `400`, `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).

### Dependencies

- [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`: [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`; [`random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) (`size`: `int`) → `Bytes`; can fail with `CryptoError`; [`sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) (`input`: `Bytes`) → `Bytes`; can fail with `CryptoError`; [`signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa) (`key`: `RsaPrivateKey`, `input`: `Bytes`) → `Bytes`; can fail with `CryptoError`.
- [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError) from `august.crypto`.
- [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) (`key`: `RsaPrivateKey`, `claims`: `Json`, `kid`: `string`, `tokenType`: `string`) → `string`; can fail with `JwtError` from `august.crypto`.
- [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`: [`put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) (`key`: `string`, `value`: `T`, `expires`: `int`, `now`: `int`) → `void`; can fail with `StoreFull`; [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) (`key`: `string`, `now`: `int`) → `optional T`.
- [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) from `august.memory`.
- [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`: [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.
- [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (no caller inputs) → `Headers`; can fail with `HttpError` from `common`.
- [`KeyError`](../common/keys.md#symbol-KeyError) from `common`.
- [`SigningKeys`](../common/keys.md#symbol-SigningKeys) from `common`: [`provider`](../common/keys.md#symbol-SigningKeys.provider) (no caller inputs) → `RsaPrivateKey`; can fail with `KeyError`.
- [`Settings`](../common/settings.md#symbol-Settings): read `clientId` (`string`); read `issuer` (`string`).
- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings) from `common`.
- [`AccessGrant`](contracts.md#symbol-AccessGrant) from `contracts`: construct with `subject`: `string`, `name`: `string`, `expires`: `int`; read `expires` (`int`).
- [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) from `contracts`: read `challenge` (`string`); read `clientId` (`string`); read `name` (`string`); read `nonce` (`string`); read `redirectUri` (`string`); read `subject` (`string`).
- [`IdClaims`](contracts.md#symbol-IdClaims) from `contracts`: construct with `iss`: `string`, `sub`: `string`, `aud`: `string`, `exp`: `int`, `iat`: `int`, `nonce`: `string`, `name`: `string`.
- [`OAuthError`](contracts.md#symbol-OAuthError) from `contracts`: construct with `error`: `string`, `error_description`: `string`.
- [`TokenForm`](contracts.md#symbol-TokenForm) from `contracts`: read `client_id` (`string`); read `code` (`string`); read `code_verifier` (`string`); read `grant_type` (`string`); read `redirect_uri` (`string`).
- [`TokenResponse`](contracts.md#symbol-TokenResponse) from `contracts`: construct with `token_type`: `string`, `access_token`: `string`, `id_token`: `string`, `expires_in`: `int`, `scope`: `string`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Bytes.base64url`: Encode immutable bytes as unpadded RFC 4648 URL-safe base64.
- `HttpRequest.form`: Decode a form record inside a handler so protocol-specific error responses can be returned.
- `string.bytes`: Encode this string as immutable UTF-8 bytes.
- `string.isToken`: Require an ASCII RFC 3986 unreserved token with a bounded length.

::::

:::::
