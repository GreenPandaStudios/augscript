---
title: "client/logout.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/logout.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `client/logout.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](contracts.md)
- [`client/endpoints.aug`](endpoints.md)
- [`client/export.aug`](export.md)
- [`client/login.aug`](login.md)
- [`client/logout.aug`](logout.md)
- [`client/protocol.aug`](protocol.md)
- [`client/session.aug`](session.md)
- [`client/views.aug`](views.md)
- [`common/export.aug`](../common/export.md)
- [`common/headers.aug`](../common/headers.md)
- [`common/keys.aug`](../common/keys.md)
- [`common/settings.aug`](../common/settings.md)
- [`common/views.aug`](../common/views.md)
- [`provider/authorization.aug`](../provider/authorization.md)
- [`provider/contracts.aug`](../provider/contracts.md)
- [`provider/credentials.aug`](../provider/credentials.md)
- [`provider/discovery.aug`](../provider/discovery.md)
- [`provider/export.aug`](../provider/export.md)
- [`provider/token.aug`](../provider/token.md)
- [`provider/userinfo.aug`](../provider/userinfo.md)
- [`provider/views.aug`](../provider/views.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
import SessionClaims and SessionError and LogoutForm from contracts
import authenticate from session
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from august.crypto
import Clock from august.time
import ExpiringStore from august.memory
/** POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie. */
endpoint POST "/logout" as logout(LogoutForm input from form, optional string token from cookie "aug_session", optional string origin from header, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<Html> uses crypto.publicRsa and crypto.decodeBase64url and crypto.verifyRsa and crypto.equal and clock.now and keys.session and sessions.get and sessions.take unless SessionError with status 403 and KeyError and TimeError and CryptoError and HttpError:
    config = settings()
    if origin != config.baseUrl:
        throw SessionError()
    session = authenticate(token)
    if not crypto.equal(left=input.csrf.bytes(), right=session.csrf.bytes()):
        throw SessionError()
    sessions.take(key=session.jti, now=clock.now())
    headers = withCookie(headers=securityHeaders().with(name="location", value="/"), name="aug_session", value="", path="/", maxAge=0, secure=config.secureCookies)
    return HttpResponse(body=<p>Signed out.</p>, status=303, headers=headers)
```

```aug [Braces]
import SessionClaims and SessionError and LogoutForm from contracts
import authenticate from session
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from august.crypto
import Clock from august.time
import ExpiringStore from august.memory
/** POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie. */
endpoint POST "/logout" as logout(LogoutForm input from form, optional string token from cookie "aug_session", optional string origin from header, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<Html> uses crypto.publicRsa and crypto.decodeBase64url and crypto.verifyRsa and crypto.equal and clock.now and keys.session and sessions.get and sessions.take unless SessionError with status 403 and KeyError and TimeError and CryptoError and HttpError {
    config = settings()
    if origin != config.baseUrl {
        throw SessionError()
    }
    session = authenticate(token)
    if not crypto.equal(left=input.csrf.bytes(), right=session.csrf.bytes()) {
        throw SessionError()
    }
    sessions.take(key=session.jti, now=clock.now())
    headers = withCookie(headers=securityHeaders().with(name="location", value="/"), name="aug_session", value="", path="/", maxAge=0, secure=config.secureCookies)
    return HttpResponse(body=<p>Signed out.</p>, status=303, headers=headers)
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-logout"></a>
### `logout` · [source](logout.md#code)

POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie.

**Inputs:** Take `input` ([`LogoutForm`](contracts.md#symbol-LogoutForm)) from HTTP form. Take `token` (`optional string`) from HTTP cookie `aug_session`; omitted means null. Take `origin` (`optional string`) from HTTP header; omitted means null. Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`. Resolve [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) as `clock`. Resolve [`SigningKeys`](../common/keys.md#symbol-SigningKeys) as `keys`. Resolve [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `sessions`.

Returns `HttpResponse<Html>`. Uses [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get), [`sessions.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take). Can fail with `SessionError`, `KeyError`, `TimeError`, `CryptoError`, `HttpError`.

HTTP route: `POST` `/logout`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`SessionError`](contracts.md#symbol-SessionError) returns status 403.

- Set `config` to the result of [`settings`](../common/settings.md#symbol-settings).
- If `origin` does not equal `baseUrl` of `config`:
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
- Set `session` to the result of [`authenticate`](session.md#symbol-authenticate) with `token` using `crypto`, `clock`, `keys`, `sessions`.
- If not (the result of [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` as the result of `bytes` on `csrf` of `input`, `right` as the result of `bytes` on `csrf` of `session`):
  - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
- Call [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `sessions` with `key` as `jti` of `session`, `now` as the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
- Set `headers` to the result of [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` as the result of `with` on the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` as `"location"`, `value` as `"/"`, `name` as `"aug_session"`, `value` as `""`, `path` as `"/"`, `maxAge` as `0`, `secure` as `secureCookies` of `config`.
- Return a new `HttpResponse` with `body` as the HTML element `p` containing `Signed out.` (server-rendered; text escaped), `status` as `303`, `headers`.

### Dependencies

- [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`: [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`; [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`; [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) (`key`: `RsaPrivateKey`) → `RsaPublicKey`; can fail with `CryptoError`; [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) (`publicKey`: `RsaPublicKey`, `input`: `Bytes`, `signature`: `Bytes`) → `bool`; can fail with `CryptoError`.
- [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`: [`get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) (`key`: `string`, `now`: `int`) → `optional T`; [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) (`key`: `string`, `now`: `int`) → `optional T`.
- [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`: [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.
- [`LogoutForm`](contracts.md#symbol-LogoutForm) from `contracts`: read `csrf` (`string`).
- [`SessionClaims`](contracts.md#symbol-SessionClaims) from `contracts`: read `csrf` (`string`); read `jti` (`string`).
- [`SessionError`](contracts.md#symbol-SessionError) from `contracts`: construct with no caller inputs.
- [`authenticate`](session.md#symbol-authenticate) (`token`: `optional string`) → [`SessionClaims`](contracts.md#symbol-SessionClaims); can fail with `SessionError`, `KeyError`, `TimeError` from `session`.
- [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (no caller inputs) → `Headers`; can fail with `HttpError` from `common`.
- [`withCookie`](../common/headers.md#symbol-withCookie) (`headers`: `Headers`, `name`: `string`, `value`: `string`, `path`: `string`, `maxAge`: `int`, `secure`: `bool`) → `Headers`; can fail with `HttpError` from `common`.
- [`KeyError`](../common/keys.md#symbol-KeyError) from `common`.
- [`SigningKeys`](../common/keys.md#symbol-SigningKeys) from `common`: [`session`](../common/keys.md#symbol-SigningKeys.session) (no caller inputs) → `RsaPrivateKey`; can fail with `KeyError`.
- [`Settings`](../common/settings.md#symbol-Settings): read `baseUrl` (`string`); read `secureCookies` (`bool`).
- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings) from `common`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Headers.with`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.
- `string.bytes`: Encode this string as immutable UTF-8 bytes.

::::

:::::
