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

<a id="symbol-home"></a>
### `home` · [source](endpoints.md#code)

The app renders a verified session or offers its OIDC login flow. No token claims are displayed before verification. The caller supplies `token` as `optional string` from HTTP cookie `aug_session` (omitted means null). Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys` as [`SigningKeys`](../common/keys.md#symbol-SigningKeys), and `sessions` as [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). The result is `HttpResponse<Html>`. It can use [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), and [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). It can fail with `KeyError`, `TimeError`, and `HttpError`.

This handles `GET` requests at `/`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

It tries to set `session` to the value from [`authenticate`](session.md#symbol-authenticate) (`token`) using `crypto`, `clock`, `keys`, `sessions`, then return a new `HttpResponse` (`body` set to the value from [`Welcome`](views.md#symbol-Welcome) (`session`) and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)). If this attempt raises [`SessionError`](contracts.md#symbol-SessionError), it catches it as `error` and returns a new `HttpResponse` (`body` set to the value from [`LoginPage`](views.md#symbol-LoginPage) and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)).

<a id="symbol-me"></a>
### `me` · [source](endpoints.md#code)

A protected JSON resource accepts only a live, verified application session. The caller supplies `token` as `optional string` from HTTP cookie `aug_session` (omitted means null). Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys` as [`SigningKeys`](../common/keys.md#symbol-SigningKeys), and `sessions` as [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). The result is `HttpResponse<UserInfo>`. It can use [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), and [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). It can fail with `SessionError`, `KeyError`, `TimeError`, and `HttpError`.

This handles `GET` requests at `/me`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks. For declared failures, [`SessionError`](contracts.md#symbol-SessionError) returns status 401. It sets `session` to the value from [`authenticate`](session.md#symbol-authenticate) (`token`) using `crypto`, `clock`, `keys`, `sessions`. It returns a new `HttpResponse` (`body` set to a new [`UserInfo`](../provider/contracts.md#symbol-UserInfo) (`sub` set to `session.sub` and `name` set to `session.name`) and `headers` set to the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders)).

### Dependencies

The file uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`. [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) takes `input` as `string`. It returns `Bytes`. It can use [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url). It can fail with `CryptoError`. [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) takes `left` and `right` as `Bytes`. It returns `bool`. It can use [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) takes `key` as `RsaPrivateKey`. It returns `RsaPublicKey`. It can use [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa). It can fail with `CryptoError`. [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`. It returns `bool`. It can use [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa). It can fail with `CryptoError`.

The file uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`. The type parameters are `T` which must satisfy `Data`. [`get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) takes `key` as `string` and `now` as `int`. It returns `optional T`. It can use [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). The file uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`. [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) takes no caller inputs. It returns `int`. It can use [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now). It can fail with `TimeError`. The file uses [`SessionClaims`](contracts.md#symbol-SessionClaims) from `contracts`. `name` is a read-only field of type `string`. `sub` is a read-only field of type `string`. The file uses [`SessionError`](contracts.md#symbol-SessionError) from `contracts`.

[`authenticate`](session.md#symbol-authenticate) from `session` takes `token` as `optional string` (omitted means null). It returns [`SessionClaims`](contracts.md#symbol-SessionClaims). Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys` as [`SigningKeys`](../common/keys.md#symbol-SigningKeys), and `sessions` as [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), and [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). It can fail with `SessionError`, `KeyError`, and `TimeError`. [`LoginPage`](views.md#symbol-LoginPage) from `views` takes no caller inputs. It returns `Html`. [`Welcome`](views.md#symbol-Welcome) from `views` takes `session` as [`SessionClaims`](contracts.md#symbol-SessionClaims). It returns `Html`. It can fail with `HttpError`.

[`securityHeaders`](../common/headers.md#symbol-securityHeaders) from `common` takes no caller inputs. It returns `Headers`. It can fail with `HttpError`. The file uses [`KeyError`](../common/keys.md#symbol-KeyError) from `common`. The file uses [`SigningKeys`](../common/keys.md#symbol-SigningKeys) from `common`. [`session`](../common/keys.md#symbol-SigningKeys.session) takes no caller inputs. It returns `RsaPrivateKey`. It can use [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session). It can fail with `KeyError`. The file uses [`UserInfo`](../provider/contracts.md#symbol-UserInfo) from `provider`. Construction takes `sub` and `name` as `string`.

::::

:::::
