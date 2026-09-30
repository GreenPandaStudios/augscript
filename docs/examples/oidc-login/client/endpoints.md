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
// aug-spec: "endpoints.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "endpoints.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

### `home` · [source](endpoints.md#code) {#symbol-home}

`home` handles `GET /`. The app renders a verified session or offers its OIDC login flow. No token claims are displayed before verification.

It takes `token` as `optional string` from the HTTP cookie `aug_session`. It gets `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. It can also raise `KeyError`, `TimeError`, and `HttpError`.

It tries to set `session` to [`authenticate`](session.md#symbol-authenticate) with `token` using injected `crypto`, `clock`, `keys`, and `sessions`, then return HTTP 200 with [`Welcome`](views.md#symbol-Welcome) with `session` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers. If this work raises [`SessionError`](contracts.md#symbol-SessionError), it returns HTTP 200 with [`LoginPage`](views.md#symbol-LoginPage) and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers.

### `me` · [source](endpoints.md#code) {#symbol-me}

`me` handles `GET /me`. A protected JSON resource accepts only a live, verified application session.

It takes `token` as `optional string` from the HTTP cookie `aug_session`. It gets `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. The handler responds with HTTP 401 for [`SessionError`](contracts.md#symbol-SessionError).

It can also raise `KeyError`, `TimeError`, and `HttpError`. It sets `session` to [`authenticate`](session.md#symbol-authenticate) with `token` using injected `crypto`, `clock`, `keys`, and `sessions`. It returns HTTP 200 with an [`UserInfo`](../provider/contracts.md#symbol-UserInfo) with `session.sub` and `session.name` and [`securityHeaders`](../common/headers.md#symbol-securityHeaders) headers.

### Dependencies

It uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), and [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa)) from `august.crypto`. It uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) ([`get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get)) from `august.memory`. It uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) ([`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now)) from `august.time`. It uses [`SessionClaims`](contracts.md#symbol-SessionClaims) (`name` and `sub`) and [`SessionError`](contracts.md#symbol-SessionError) from `contracts`.

It uses [`authenticate`](session.md#symbol-authenticate) from `session`. It uses [`LoginPage`](views.md#symbol-LoginPage) and [`Welcome`](views.md#symbol-Welcome) from `views`. It uses [`securityHeaders`](../common/headers.md#symbol-securityHeaders), [`KeyError`](../common/keys.md#symbol-KeyError), and [`SigningKeys`](../common/keys.md#symbol-SigningKeys) ([`session`](../common/keys.md#symbol-SigningKeys.session)) from `common`. It uses [`UserInfo`](../provider/contracts.md#symbol-UserInfo) from `provider`.

These links explain the full dependency contracts.

::::

:::::
