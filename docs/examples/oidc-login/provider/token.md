---
title: "provider/token.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/provider/token.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Available from `august.crypto`.

Interface. Follow the linked specification for its full explanation.

**[`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal)**

**Inputs and dependencies**

- `left`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `right`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal).

**[`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random)**

**Inputs and dependencies**

- `size`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256)**

**Inputs and dependencies**

- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa)**

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

#### [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError)

Available from `august.crypto`.

Class. Follow the linked specification for its full explanation.

#### [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt)

Available from `august.crypto`.

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.
- `claims`: `Json`. The caller supplies this labeled input. Read reference values without copying them.
- `kid`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `tokenType`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `string`.

Capabilities: [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa).

Possible failures: `JwtError`. The caller must catch or propagate them.

#### [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)

Available from `august.memory`.

Interface. Follow the linked specification for its full explanation.

**[`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put)**

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `StoreFull`. The caller must catch or propagate them.

**[`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take)**

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `optional T`.

Capabilities: [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take).

#### [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull)

Available from `august.memory`.

Class. Follow the linked specification for its full explanation.

#### [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)

Available from `august.time`.

Interface. Follow the linked specification for its full explanation.

**[`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now)**

Result: `int`.

Capabilities: [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now).

Possible failures: `TimeError`. The caller must catch or propagate them.

#### [`securityHeaders`](../common/headers.md#symbol-securityHeaders)

Available from `common`.

Result: `Headers`.

Possible failures: `HttpError`. The caller must catch or propagate them.

#### [`KeyError`](../common/keys.md#symbol-KeyError)

Available from `common`.

Class. Follow the linked specification for its full explanation.

#### [`SigningKeys`](../common/keys.md#symbol-SigningKeys)

Available from `common`.

Interface. Follow the linked specification for its full explanation.

**[`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider)**

Result: `RsaPrivateKey`.

Capabilities: [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider).

Possible failures: `KeyError`. The caller must catch or propagate them.

#### [`Settings`](../common/settings.md#symbol-Settings)

Immutable record. Follow the linked specification for its full explanation.

Field `clientId`: `string`. Read-only after initialization.

Field `issuer`: `string`. Read-only after initialization.

#### [`settings`](../common/settings.md#symbol-settings)

Available from `common`.

Result: [`Settings`](../common/settings.md#symbol-Settings).

#### [`AccessGrant`](contracts.md#symbol-AccessGrant)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `subject`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`AccessGrant`](contracts.md#symbol-AccessGrant).

Field `expires`: `int`. Read-only after initialization.

#### [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

Field `clientId`: `string`. Read-only after initialization.

Field `redirectUri`: `string`. Read-only after initialization.

Field `challenge`: `string`. Read-only after initialization.

Field `subject`: `string`. Read-only after initialization.

Field `nonce`: `string`. Read-only after initialization.

Field `name`: `string`. Read-only after initialization.

#### [`IdClaims`](contracts.md#symbol-IdClaims)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `iss`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `sub`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `aud`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `exp`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `iat`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `nonce`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`IdClaims`](contracts.md#symbol-IdClaims).

#### [`OAuthError`](contracts.md#symbol-OAuthError)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `error`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `error_description`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`OAuthError`](contracts.md#symbol-OAuthError).

#### [`TokenForm`](contracts.md#symbol-TokenForm)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

Field `grant_type`: `string`. Read-only after initialization.

Field `client_id`: `string`. Read-only after initialization.

Field `code`: `string`. Read-only after initialization.

Field `code_verifier`: `string`. Read-only after initialization.

Field `redirect_uri`: `string`. Read-only after initialization.

#### [`TokenResponse`](contracts.md#symbol-TokenResponse)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `token_type`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `access_token`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `id_token`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `expires_in`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `scope`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`TokenResponse`](contracts.md#symbol-TokenResponse).

### Built-in operations used by this file

#### `Bytes.base64url`

Encode immutable bytes as unpadded RFC 4648 URL-safe base64.

Result: `string`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `HttpRequest.form`

Decode a form record inside a handler so protocol-specific error responses can be returned.

Result: `TokenForm`.

Possible failures: `HttpError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.bytes`

Encode this string as immutable UTF-8 bytes.

Result: `Bytes`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.isToken`

Require an ASCII RFC 3986 unreserved token with a bounded length.

Inputs: `min`: `int`; `max`: `int`.

Result: `bool`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `token` {#symbol-token}

[source](token.md#code)

**Inputs and dependencies**

- `http`: `HttpRequest`. The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP request.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](../common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `codes`: [`ExpiringStore<AuthorizationCode>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `access`: [`ExpiringStore<AccessGrant>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Json>`.

Capabilities: [`crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.provider`](../common/keys.md#symbol-SigningKeys.provider), [`codes.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), [`access.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put).

Possible failures: `CryptoError`, `TimeError`, `KeyError`, `JwtError`, `StoreFull`, `HttpError`. The caller must catch or propagate them.

HTTP route: `POST` `/provider/token`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: `CryptoError` returns status 503; `TimeError` returns status 503; [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503.

**Author documentation**

A real OAuth token endpoint. Exact client/redirect binding, S256 PKCE, expiry and one-use codes are enforced. Errors use OAuth JSON.

**Behavior when execution reaches this operation**

- Set `config` to the result of call [`settings`](../common/settings.md#symbol-settings).
- Try these operations:
  - Set `form` to the result of call `form` on `http` with type arguments [`TokenForm`](contracts.md#symbol-TokenForm).
  - If (`grant_type` of `form` does not equal `"authorization_code"`) is true:
    - Return the result of call [`_oauthError`](token.md#symbol-_oauthError) with `code` set to `"unsupported_grant_type"`; `description` set to `"Only authorization_code is supported."` and finish this operation.
  - If (`client_id` of `form` does not equal `clientId` of `config`) is true:
    - Return the result of call [`_oauthError`](token.md#symbol-_oauthError) with `code` set to `"invalid_client"`; `description` set to `"The registered client is required."` and finish this operation.
  - If (not (the result of call `isToken` on `code` of `form` with `min` set to `43`; `max` set to `43`) or not (the result of call `isToken` on `code_verifier` of `form` with `min` set to `43`; `max` set to `128`)) is true:
    - Return the result of call [`_oauthError`](token.md#symbol-_oauthError) with `code` set to `"invalid_grant"`; `description` set to `"The authorization grant is invalid."` and finish this operation.
  - Set `now` to the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
  - Select the matching case for the result of call [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `codes` with `key` set to `code` of `form`; `now` set to `now`:
    - A null value, including omitted optional input:
      - Return the result of call [`_oauthError`](token.md#symbol-_oauthError) with `code` set to `"invalid_grant"`; `description` set to `"The authorization grant is invalid."` and finish this operation.
    - A present, non-null value, named `grant`:
      - Set `challenge` to the result of call `base64url` on the result of call [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) on `crypto` with `input` set to the result of call `bytes` on `code_verifier` of `form`.
      - If (((`clientId` of `grant` does not equal `client_id` of `form`) or (`redirectUri` of `grant` does not equal `redirect_uri` of `form`)) or not (the result of call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` set to the result of call `bytes` on `challenge`; `right` set to the result of call `bytes` on `challenge` of `grant`)) is true:
        - Return the result of call [`_oauthError`](token.md#symbol-_oauthError) with `code` set to `"invalid_grant"`; `description` set to `"The authorization grant is invalid."` and finish this operation.
      - Set `claims` to the result of call [`IdClaims`](contracts.md#symbol-IdClaims) with `iss` set to `issuer` of `config`; `sub` set to `subject` of `grant`; `aud` set to `clientId` of `grant`; `exp` set to (`now` plus `300`); `iat` set to `now`; `nonce` set to `nonce` of `grant`; `name` set to `name` of `grant`.
      - Set `idToken` to the result of call [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) with `key` set to the result of call [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider) on `keys`; `claims` set to the result of call `Json` with `value` set to `claims`; `kid` set to `"provider-1"`; `tokenType` set to `"JWT"`; supply dependencies `crypto` from `crypto`.
      - Set `accessToken` to the result of call `base64url` on the result of call [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` with `size` set to `32`.
      - Set `value` to the result of call [`AccessGrant`](contracts.md#symbol-AccessGrant) with `subject` set to `subject` of `grant`; `name` set to `name` of `grant`; `expires` set to (`now` plus `300`).
      - Call [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `access` with `key` set to `accessToken`; `value` set to `value`; `expires` set to `expires` of `value`; `now` set to `now`.
      - Set `body` to the result of call [`TokenResponse`](contracts.md#symbol-TokenResponse) with `token_type` set to `"Bearer"`; `access_token` set to `accessToken`; `id_token` set to `idToken`; `expires_in` set to `300`; `scope` set to `"openid profile"`.
      - Return the result of call `HttpResponse` with `body` set to the result of call `Json` with `value` set to `body`; `headers` set to the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) and finish this operation.
- If they fail with `HttpError`, name the failure `error` and recover:
  - Return the result of call [`_oauthError`](token.md#symbol-_oauthError) with `code` set to `"invalid_request"`; `description` set to `"Submit the required URL-encoded token fields once each."` and finish this operation.

### `_oauthError` {#symbol-_oauthError}

[source](token.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `code`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `description`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `HttpResponse<Json>`.

Possible failures: `HttpError`. The caller must catch or propagate them.

**Behavior when execution reaches this operation**

- Return the result of call `HttpResponse` with `body` set to the result of call `Json` with `value` set to the result of call [`OAuthError`](contracts.md#symbol-OAuthError) with `error` set to `code`; `error_description` set to `description`; `status` set to `400`; `headers` set to the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
