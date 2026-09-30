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
// aug-spec: "token.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "token.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

A real OAuth token endpoint. Exact client/redirect binding, S256 PKCE, expiry and one-use codes are enforced. Errors use OAuth JSON. The caller supplies `http` as `HttpRequest` from HTTP request. Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys` as [`SigningKeys`](../common/keys.md#symbol-SigningKeys), `codes` as [`ExpiringStore<AuthorizationCode>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore), and `access` as [`ExpiringStore<AccessGrant>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). The result is `HttpResponse<Json>`. It can use [`crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random), [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.provider`](../common/keys.md#symbol-SigningKeys.provider), [`codes.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take), and [`access.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `CryptoError`, `TimeError`, `KeyError`, `JwtError`, `StoreFull`, and `HttpError`.

This handles `POST` requests at `/provider/token`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks. For declared failures, `CryptoError` returns status 503, `TimeError` returns status 503, and [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) returns status 503. It sets `config` to the value from [`settings`](../common/settings.md#symbol-settings).

It tries the following steps. It sets `form` to the value from `form` on `http` with type arguments [`TokenForm`](contracts.md#symbol-TokenForm). If `form.grant_type` does not equal `"authorization_code"`, it returns the value from [`_oauthError`](token.md#symbol-_oauthError) (`code` set to `"unsupported_grant_type"` and `description` set to `"Only authorization_code is supported."`). If `form.client_id` does not equal `config.clientId`, it returns the value from [`_oauthError`](token.md#symbol-_oauthError) (`code` set to `"invalid_client"` and `description` set to `"The registered client is required."`).

If not (the value from `isToken` on `form.code` (`min` set to `43` and `max` set to `43`)) or not (the value from `isToken` on `form.code_verifier` (`min` set to `43` and `max` set to `128`)), it returns the value from [`_oauthError`](token.md#symbol-_oauthError) (`code` set to `"invalid_grant"` and `description` set to `"The authorization grant is invalid."`). It sets `now` to the value from [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.

Select the first matching case for the value from [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `codes` (`key` set to `form.code` and `now`). If the selected value is null, it returns the value from [`_oauthError`](token.md#symbol-_oauthError) (`code` set to `"invalid_grant"` and `description` set to `"The authorization grant is invalid."`).

If the selected value is not null, it names it `grant` and follows these steps. It sets `challenge` to the unpadded URL-safe base64 encoding of the value from [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) on `crypto` (`input` set to the UTF-8 bytes of `form.code_verifier`).

If `grant.clientId` does not equal `form.client_id` or `grant.redirectUri` does not equal `form.redirect_uri` or not (the value from [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` (`left` set to the UTF-8 bytes of `challenge` and `right` set to the UTF-8 bytes of `grant.challenge`)), it returns the value from [`_oauthError`](token.md#symbol-_oauthError) (`code` set to `"invalid_grant"` and `description` set to `"The authorization grant is invalid."`).

It sets `claims` to a new [`IdClaims`](contracts.md#symbol-IdClaims) (`iss` set to `config.issuer`, `sub` set to `grant.subject`, `aud` set to `grant.clientId`, `exp` set to `now` plus `300`, `iat` set to `now`, `nonce` set to `grant.nonce`, and `name` set to `grant.name`). It sets `idToken` to the value from [`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) (`key` set to the value from [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider) on `keys`, `claims` set to a new `Json` (`value` set to `claims`), `kid` set to `"provider-1"`, and `tokenType` set to `"JWT"`) using `crypto`.

It sets `accessToken` to the unpadded URL-safe base64 encoding of the value from [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) on `crypto` (`size` set to `32`). It sets `value` to a new [`AccessGrant`](contracts.md#symbol-AccessGrant) (`subject` set to `grant.subject`, `name` set to `grant.name`, and `expires` set to `now` plus `300`). It calls [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) on `access` (`key` set to `accessToken`, `value`, `expires` set to `value.expires`, and `now`).

It sets `body` to a new [`TokenResponse`](contracts.md#symbol-TokenResponse) (`token_type` set to `"Bearer"`, `access_token` set to `accessToken`, `id_token` set to `idToken`, `expires_in` set to `300`, and `scope` set to `"openid profile"`). It returns a new `HttpResponse` (`body` set to a new `Json` (`value` set to `body`) and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)). If this attempt raises `HttpError`, it catches it as `error` and returns the value from [`_oauthError`](token.md#symbol-_oauthError) (`code` set to `"invalid_request"` and `description` set to `"Submit the required URL-encoded token fields once each."`).

<a id="symbol-_oauthError"></a>
### `_oauthError` · [source](token.md#code)

Private to its defining scope. The caller supplies `code` and `description` as `string`. The result is `HttpResponse<Json>`. It can fail with `HttpError`. It returns a new `HttpResponse` (`body` set to a new `Json` (`value` set to a new [`OAuthError`](contracts.md#symbol-OAuthError) (`error` set to `code` and `error_description` set to `description`)), `status` set to `400`, and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)).

### Dependencies

The file uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`. [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) takes `left` and `right` as `Bytes`. It returns `bool`. It can use [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). [`random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random) takes `size` as `int`. It returns `Bytes`. It can use [`Crypto.random`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.random). It can fail with `CryptoError`. [`sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256) takes `input` as `Bytes`. It returns `Bytes`. It can use [`Crypto.sha256`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.sha256). It can fail with `CryptoError`. [`signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa) takes `key` as `RsaPrivateKey` and `input` as `Bytes`. It returns `Bytes`. It can use [`Crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa). It can fail with `CryptoError`. The file uses [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError) from `august.crypto`.

[`signJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-signJwt) from `august.crypto` takes `key` as `RsaPrivateKey`, `claims` as `Json`, and `kid` and `tokenType` as `string`. It returns `string`. Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). It can use [`crypto.signRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.signRsa). It can fail with `JwtError`.

The file uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`. The type parameters are `T` which must satisfy `Data`. [`put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put) takes `key` as `string`, `value` as `T`, and `expires` and `now` as `int`. It returns no value. It can use [`ExpiringStore.put`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.put). It can fail with `StoreFull`. [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) takes `key` as `string` and `now` as `int`. It returns `optional T`. It can use [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take). The file uses [`StoreFull`](../dependencies/august/0.19.0/memory/store.md#symbol-StoreFull) from `august.memory`.

The file uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`. [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) takes no caller inputs. It returns `int`. It can use [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now). It can fail with `TimeError`. [`securityHeaders`](../common/headers.md#symbol-securityHeaders) from `common` takes no caller inputs. It returns `Headers`. It can fail with `HttpError`. The file uses [`KeyError`](../common/keys.md#symbol-KeyError) from `common`. The file uses [`SigningKeys`](../common/keys.md#symbol-SigningKeys) from `common`. [`provider`](../common/keys.md#symbol-SigningKeys.provider) takes no caller inputs. It returns `RsaPrivateKey`. It can use [`SigningKeys.provider`](../common/keys.md#symbol-SigningKeys.provider). It can fail with `KeyError`.

The file uses [`Settings`](../common/settings.md#symbol-Settings). `clientId` is a read-only field of type `string`. `issuer` is a read-only field of type `string`. [`settings`](../common/settings.md#symbol-settings) from `common` takes no caller inputs. It returns [`Settings`](../common/settings.md#symbol-Settings). The file uses [`AccessGrant`](contracts.md#symbol-AccessGrant) from `contracts`. Construction takes `subject` and `name` as `string` and `expires` as `int`. `expires` is a read-only field of type `int`.

The file uses [`AuthorizationCode`](contracts.md#symbol-AuthorizationCode) from `contracts`. `challenge` is a read-only field of type `string`. `clientId` is a read-only field of type `string`. `name` is a read-only field of type `string`. `nonce` is a read-only field of type `string`. `redirectUri` is a read-only field of type `string`. `subject` is a read-only field of type `string`. The file uses [`IdClaims`](contracts.md#symbol-IdClaims) from `contracts`. Construction takes `iss`, `sub`, and `aud` as `string`, `exp` and `iat` as `int`, and `nonce` and `name` as `string`.

The file uses [`OAuthError`](contracts.md#symbol-OAuthError) from `contracts`. Construction takes `error` and `error_description` as `string`. The file uses [`TokenForm`](contracts.md#symbol-TokenForm) from `contracts`. `client_id` is a read-only field of type `string`. `code` is a read-only field of type `string`. `code_verifier` is a read-only field of type `string`. `grant_type` is a read-only field of type `string`. `redirect_uri` is a read-only field of type `string`. The file uses [`TokenResponse`](contracts.md#symbol-TokenResponse) from `contracts`. Construction takes `token_type`, `access_token`, and `id_token` as `string`, `expires_in` as `int`, and `scope` as `string`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`Bytes.base64url`: Encode immutable bytes as unpadded RFC 4648 URL-safe base64. `HttpRequest.form`: Decode a form record inside a handler so protocol-specific error responses can be returned. `string.bytes`: Encode this string as immutable UTF-8 bytes. `string.isToken`: Require an ASCII RFC 3986 unreserved token with a bounded length.

::::

:::::
