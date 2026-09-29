---
title: "client/endpoints.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/endpoints.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`home`](endpoints.md#symbol-home) handles `GET` `/` returning `HttpResponse<Html>`.
- [`me`](endpoints.md#symbol-me) handles `GET` `/me` returning `HttpResponse<UserInfo>`.

### `home` {#symbol-home}

[source](endpoints.md#code)

**Inputs**

- `token` (`optional string`) — read from the HTTP cookie named `aug_session`; absent value becomes null.
- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.
- `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)) — injected; callers omit it.
- `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)) — injected; callers omit it.
- `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.

Returns: `HttpResponse<Html>`.

Capabilities: [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

Can fail with `KeyError`, `TimeError`, `HttpError`. Callers must catch or propagate these errors.

HTTP route: `GET` `/`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

**What it does**

- Try these operations:
  - Set `session` to call [`authenticate`](session.md#symbol-authenticate) with `token` = `token`; inject `crypto` from `crypto`, `clock` from `clock`, `keys` from `keys`, `sessions` from `sessions`.
  - Return call `HttpResponse` with `body` = call [`Welcome`](views.md#symbol-Welcome) with `session` = `session`; `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).
- If they fail with [`SessionError`](contracts.md#symbol-SessionError), name the failure `error` and recover:
  - Return call `HttpResponse` with `body` = call [`LoginPage`](views.md#symbol-LoginPage); `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).

**Author documentation**

The app renders a verified session or offers its OIDC login flow. No token claims are displayed before verification.

### `me` {#symbol-me}

[source](endpoints.md#code)

**Inputs**

- `token` (`optional string`) — read from the HTTP cookie named `aug_session`; absent value becomes null.
- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.
- `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)) — injected; callers omit it.
- `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)) — injected; callers omit it.
- `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.

Returns: `HttpResponse<UserInfo>`.

Capabilities: [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

Can fail with `SessionError`, `KeyError`, `TimeError`, `HttpError`. Callers must catch or propagate these errors.

HTTP route: `GET` `/me`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`SessionError`](contracts.md#symbol-SessionError) returns status 401.

**What it does**

- Set `session` to call [`authenticate`](session.md#symbol-authenticate) with `token` = `token`; inject `crypto` from `crypto`, `clock` from `clock`, `keys` from `keys`, `sessions` from `sessions`.
- Return call `HttpResponse` with `body` = call [`UserInfo`](../provider/contracts.md#symbol-UserInfo) with `sub` = `sub` of `session`; `name` = `name` of `session`; `headers` = call [`securityHeaders`](../common/headers.md#symbol-securityHeaders).

**Author documentation**

A protected JSON resource accepts only a live, verified application session.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Capability interface from `august.crypto`.

- [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`.
- [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) (`key`: `RsaPrivateKey`) → `RsaPublicKey`; can fail with `CryptoError`.
- [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) (`publicKey`: `RsaPublicKey`, `input`: `Bytes`, `signature`: `Bytes`) → `bool`; can fail with `CryptoError`.

#### [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)

Capability interface from `august.memory`.

- [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) (`key`: `string`, `now`: `int`) → `optional T`.

#### [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)

Capability interface from `august.time`.

- [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.

#### [`SessionClaims`](contracts.md#symbol-SessionClaims)

Record from `contracts`.

- Read `name` (`string`).
- Read `sub` (`string`).

#### [`SessionError`](contracts.md#symbol-SessionError)

Class from `contracts`.

Used as a type or provider.

#### [`authenticate`](session.md#symbol-authenticate)

Function from `session`.

- [`authenticate`](session.md#symbol-authenticate) (`token`: `optional string`) → [`SessionClaims`](contracts.md#symbol-SessionClaims); inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys`: [`SigningKeys`](../common/keys.md#symbol-SigningKeys), `sessions`: [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore); uses [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get); can fail with `SessionError`, `KeyError`, `TimeError`.

#### [`LoginPage`](views.md#symbol-LoginPage)

Function from `views`.

- [`LoginPage`](views.md#symbol-LoginPage) (no caller inputs) → `Html`.

#### [`Welcome`](views.md#symbol-Welcome)

Function from `views`.

- [`Welcome`](views.md#symbol-Welcome) (`session`: [`SessionClaims`](contracts.md#symbol-SessionClaims)) → `Html`; can fail with `HttpError`.

#### [`securityHeaders`](../common/headers.md#symbol-securityHeaders)

Function from `common`.

- [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (no caller inputs) → `Headers`; can fail with `HttpError`.

#### [`KeyError`](../common/keys.md#symbol-KeyError)

Class from `common`.

Used as a type or provider.

#### [`SigningKeys`](../common/keys.md#symbol-SigningKeys)

Capability interface from `common`.

- [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session) (no caller inputs) → `RsaPrivateKey`; can fail with `KeyError`.

#### [`UserInfo`](../provider/contracts.md#symbol-UserInfo)

Record from `provider`.

- Construct with `sub`: `string`, `name`: `string` → [`UserInfo`](../provider/contracts.md#symbol-UserInfo).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
