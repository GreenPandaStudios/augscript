---
title: "client/endpoints.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/endpoints.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `client/endpoints.aug`

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
import SessionClaims and SessionError from contracts
import authenticate from session
import LoginPage and Welcome from views
import UserInfo from provider
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from august.crypto
import Clock from august.time
import ExpiringStore from august.memory
/** The app renders a verified session or offers its OIDC login flow. No token claims are displayed before verification. */
endpoint GET "/" as home(optional string token from cookie "aug_session", resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<Html> uses crypto.publicRsa and crypto.decodeBase64url and crypto.verifyRsa and crypto.equal and clock.now and keys.session and sessions.get unless KeyError and TimeError and HttpError:
    try:
        session = authenticate(token)
        return HttpResponse(body=Welcome(session), headers=securityHeaders())
    catch SessionError error:
        return HttpResponse(body=LoginPage(), headers=securityHeaders())
/** A protected JSON resource accepts only a live, verified application session. */
endpoint GET "/me" as me(optional string token from cookie "aug_session", resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<UserInfo> uses crypto.publicRsa and crypto.decodeBase64url and crypto.verifyRsa and crypto.equal and clock.now and keys.session and sessions.get unless SessionError with status 401 and KeyError and TimeError and HttpError:
    session = authenticate(token)
    return HttpResponse(body=UserInfo(sub=session.sub, name=session.name), headers=securityHeaders())
```

```aug [Braces]
import SessionClaims and SessionError from contracts
import authenticate from session
import LoginPage and Welcome from views
import UserInfo from provider
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from august.crypto
import Clock from august.time
import ExpiringStore from august.memory
/** The app renders a verified session or offers its OIDC login flow. No token claims are displayed before verification. */
endpoint GET "/" as home(optional string token from cookie "aug_session", resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<Html> uses crypto.publicRsa and crypto.decodeBase64url and crypto.verifyRsa and crypto.equal and clock.now and keys.session and sessions.get unless KeyError and TimeError and HttpError {
    try {
        session = authenticate(token)
        return HttpResponse(body=Welcome(session), headers=securityHeaders())
    }
    catch SessionError error {
        return HttpResponse(body=LoginPage(), headers=securityHeaders())
    }
}
/** A protected JSON resource accepts only a live, verified application session. */
endpoint GET "/me" as me(optional string token from cookie "aug_session", resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns HttpResponse<UserInfo> uses crypto.publicRsa and crypto.decodeBase64url and crypto.verifyRsa and crypto.equal and clock.now and keys.session and sessions.get unless SessionError with status 401 and KeyError and TimeError and HttpError {
    session = authenticate(token)
    return HttpResponse(body=UserInfo(sub=session.sub, name=session.name), headers=securityHeaders())
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-home"></a>
### `home` · [source](endpoints.md#code)

The app renders a verified session or offers its OIDC login flow. No token claims are displayed before verification.

**Inputs:** Take `token` (`optional string`) from HTTP cookie `aug_session`; omitted means null. Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`. Resolve [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) as `clock`. Resolve [`SigningKeys`](../common/keys.md#symbol-SigningKeys) as `keys`. Resolve [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `sessions`.

Returns `HttpResponse<Html>`. Uses [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). Can fail with `KeyError`, `TimeError`, `HttpError`.

HTTP route: `GET` `/`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

- Try:
  - Set `session` to the result of [`authenticate`](session.md#symbol-authenticate) with `token` using `crypto`, `clock`, `keys`, `sessions`.
  - Return a new `HttpResponse` with `body` as the result of [`Welcome`](views.md#symbol-Welcome) with `session`, `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
- Catch [`SessionError`](contracts.md#symbol-SessionError) as `error`:
  - Return a new `HttpResponse` with `body` as the result of [`LoginPage`](views.md#symbol-LoginPage), `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).

<a id="symbol-me"></a>
### `me` · [source](endpoints.md#code)

A protected JSON resource accepts only a live, verified application session.

**Inputs:** Take `token` (`optional string`) from HTTP cookie `aug_session`; omitted means null. Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`. Resolve [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) as `clock`. Resolve [`SigningKeys`](../common/keys.md#symbol-SigningKeys) as `keys`. Resolve [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `sessions`.

Returns `HttpResponse<UserInfo>`. Uses [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). Can fail with `SessionError`, `KeyError`, `TimeError`, `HttpError`.

HTTP route: `GET` `/me`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`SessionError`](contracts.md#symbol-SessionError) returns status 401.

- Set `session` to the result of [`authenticate`](session.md#symbol-authenticate) with `token` using `crypto`, `clock`, `keys`, `sessions`.
- Return a new `HttpResponse` with `body` as a new [`UserInfo`](../provider/contracts.md#symbol-UserInfo) with `sub` as `sub` of `session`, `name` as `name` of `session`, `headers` as the result of [`securityHeaders`](../common/headers.md#symbol-securityHeaders).

### Dependencies

- [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`: [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`; [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`; [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) (`key`: `RsaPrivateKey`) → `RsaPublicKey`; can fail with `CryptoError`; [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) (`publicKey`: `RsaPublicKey`, `input`: `Bytes`, `signature`: `Bytes`) → `bool`; can fail with `CryptoError`.
- [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`: [`get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) (`key`: `string`, `now`: `int`) → `optional T`.
- [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`: [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.
- [`SessionClaims`](contracts.md#symbol-SessionClaims) from `contracts`: read `name` (`string`); read `sub` (`string`).
- [`SessionError`](contracts.md#symbol-SessionError) from `contracts`.
- [`authenticate`](session.md#symbol-authenticate) (`token`: `optional string`) → [`SessionClaims`](contracts.md#symbol-SessionClaims); can fail with `SessionError`, `KeyError`, `TimeError` from `session`.
- [`LoginPage`](views.md#symbol-LoginPage) (no caller inputs) → `Html` from `views`.
- [`Welcome`](views.md#symbol-Welcome) (`session`: [`SessionClaims`](contracts.md#symbol-SessionClaims)) → `Html`; can fail with `HttpError` from `views`.
- [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (no caller inputs) → `Headers`; can fail with `HttpError` from `common`.
- [`KeyError`](../common/keys.md#symbol-KeyError) from `common`.
- [`SigningKeys`](../common/keys.md#symbol-SigningKeys) from `common`: [`session`](../common/keys.md#symbol-SigningKeys.session) (no caller inputs) → `RsaPrivateKey`; can fail with `KeyError`.
- [`UserInfo`](../provider/contracts.md#symbol-UserInfo) from `provider`: construct with `sub`: `string`, `name`: `string`.

::::

:::::
