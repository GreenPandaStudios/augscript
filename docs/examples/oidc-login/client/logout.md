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
// aug-spec: "logout.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError and LogoutForm from contracts
import authenticate from session
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from august.crypto
import Clock from august.time
import ExpiringStore from august.memory
/** POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie. */
endpoint POST "/logout" as logout(LogoutForm input from form, optional string token from cookie "aug_session", optional string origin from header, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) unless SessionError with status 403 and KeyError and TimeError and CryptoError and HttpError:
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
// aug-spec: "logout.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError and LogoutForm from contracts
import authenticate from session
import settings and SigningKeys and KeyError and securityHeaders and withCookie from common
import Crypto from august.crypto
import Clock from august.time
import ExpiringStore from august.memory
/** POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie. */
endpoint POST "/logout" as logout(LogoutForm input from form, optional string token from cookie "aug_session", optional string origin from header, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) unless SessionError with status 403 and KeyError and TimeError and CryptoError and HttpError {
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

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

### `logout` · [source](logout.md#code) {#symbol-logout}

`logout` handles `POST /logout`. POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie.

It takes `input` as [`LogoutForm`](contracts.md#symbol-LogoutForm) from the HTTP form, `token` as `optional string` from the HTTP cookie `aug_session`, and `origin` as `optional string` from the HTTP header. It gets `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. The handler responds with HTTP 403 for [`SessionError`](contracts.md#symbol-SessionError).

It can also raise `CryptoError`, `HttpError`, `KeyError`, and `TimeError`.

It gets `config` from [`settings`](../common/settings.md#symbol-settings). It checks that `origin` equals `config.baseUrl`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It sets `session` to [`authenticate`](session.md#symbol-authenticate) with `token` using injected `crypto`, `clock`, `keys`, and `sessions`.

It checks that the UTF-8 bytes of `input.csrf` and the UTF-8 bytes of `session.csrf` match when compared by `crypto`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It calls [`sessions.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) with `key` from `session.jti` and `now` from the current time from `clock`. It sets `headers` to [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with the header `"location"` set to `"/"`, `name` `"aug_session"`, `value` `""`, `path` `"/"`, `maxAge` `0`, and `secure` from `config.secureCookies`.

It returns HTTP 303 with a paragraph containing `Signed out.` with escaped text and `headers` headers.

### Dependencies

It uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), and [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa)) from `august.crypto`. It uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) ([`get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) and [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take)) from `august.memory`. It uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) ([`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now)) from `august.time`. It uses [`LogoutForm`](contracts.md#symbol-LogoutForm) (`csrf`), [`SessionClaims`](contracts.md#symbol-SessionClaims) (`csrf` and `jti`), and [`SessionError`](contracts.md#symbol-SessionError) from `contracts`.

It uses [`authenticate`](session.md#symbol-authenticate) from `session`. It uses [`securityHeaders`](../common/headers.md#symbol-securityHeaders), [`withCookie`](../common/headers.md#symbol-withCookie), [`KeyError`](../common/keys.md#symbol-KeyError), [`SigningKeys`](../common/keys.md#symbol-SigningKeys) ([`session`](../common/keys.md#symbol-SigningKeys.session)), and [`settings`](../common/settings.md#symbol-settings) from `common`. It uses [`Settings`](../common/settings.md#symbol-Settings) (`baseUrl` and `secureCookies`). These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
