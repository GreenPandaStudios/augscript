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
// aug-spec: "logout.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie. The caller supplies `input` as [`LogoutForm`](contracts.md#symbol-LogoutForm) from HTTP form, `token` as `optional string` from HTTP cookie `aug_session` (omitted means null), and `origin` as `optional string` from HTTP header (omitted means null). Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys` as [`SigningKeys`](../common/keys.md#symbol-SigningKeys), and `sessions` as [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore).

The result is `HttpResponse<Html>`. It can use [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get), and [`sessions.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take). It can fail with `SessionError`, `KeyError`, `TimeError`, `CryptoError`, and `HttpError`. This handles `POST` requests at `/logout`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks. For declared failures, [`SessionError`](contracts.md#symbol-SessionError) returns status 403.

It sets `config` to the value from [`settings`](../common/settings.md#symbol-settings). If `origin` does not equal `config.baseUrl`, it fails with a new [`SessionError`](contracts.md#symbol-SessionError). It sets `session` to the value from [`authenticate`](session.md#symbol-authenticate) (`token`) using `crypto`, `clock`, `keys`, `sessions`. If not (the value from [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` (`left` set to the UTF-8 bytes of `input.csrf` and `right` set to the UTF-8 bytes of `session.csrf`)), it fails with a new [`SessionError`](contracts.md#symbol-SessionError). It calls [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `sessions` (`key` set to `session.jti` and `now` set to the value from [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`).

It sets `headers` to the value from [`withCookie`](../common/headers.md#symbol-withCookie) (`headers` set to the value from `with` on the value from [`securityHeaders`](../common/headers.md#symbol-securityHeaders) (`name` set to `"location"` and `value` set to `"/"`), `name` set to `"aug_session"`, `value` set to `""`, `path` set to `"/"`, `maxAge` set to `0`, and `secure` set to `config.secureCookies`). It returns a new `HttpResponse` (`body` set to the HTML element `p` containing `Signed out.` (server-rendered; text escaped), `status` set to `303`, and `headers`).

### Dependencies

The file uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`. [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) takes `input` as `string`. It returns `Bytes`. It can use [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url). It can fail with `CryptoError`. [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) takes `left` and `right` as `Bytes`. It returns `bool`. It can use [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal). [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) takes `key` as `RsaPrivateKey`. It returns `RsaPublicKey`. It can use [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa). It can fail with `CryptoError`. [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) takes `publicKey` as `RsaPublicKey` and `input` and `signature` as `Bytes`. It returns `bool`. It can use [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa). It can fail with `CryptoError`.

The file uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`. The type parameters are `T` which must satisfy `Data`. [`get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) takes `key` as `string` and `now` as `int`. It returns `optional T`. It can use [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). [`take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) takes `key` as `string` and `now` as `int`. It returns `optional T`. It can use [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take). The file uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`. [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) takes no caller inputs. It returns `int`. It can use [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now). It can fail with `TimeError`.

The file uses [`LogoutForm`](contracts.md#symbol-LogoutForm) from `contracts`. `csrf` is a read-only field of type `string`. The file uses [`SessionClaims`](contracts.md#symbol-SessionClaims) from `contracts`. `csrf` is a read-only field of type `string`. `jti` is a read-only field of type `string`. The file uses [`SessionError`](contracts.md#symbol-SessionError) from `contracts`. Construction takes no caller inputs.

[`authenticate`](session.md#symbol-authenticate) from `session` takes `token` as `optional string` (omitted means null). It returns [`SessionClaims`](contracts.md#symbol-SessionClaims). Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto), `clock` as [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock), `keys` as [`SigningKeys`](../common/keys.md#symbol-SigningKeys), and `sessions` as [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). It can use [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), and [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). It can fail with `SessionError`, `KeyError`, and `TimeError`. [`securityHeaders`](../common/headers.md#symbol-securityHeaders) from `common` takes no caller inputs. It returns `Headers`. It can fail with `HttpError`.

[`withCookie`](../common/headers.md#symbol-withCookie) from `common` takes `headers` as `Headers`, `name`, `value`, and `path` as `string`, `maxAge` as `int`, and `secure` as `bool`. It returns `Headers`. It can fail with `HttpError`. The file uses [`KeyError`](../common/keys.md#symbol-KeyError) from `common`. The file uses [`SigningKeys`](../common/keys.md#symbol-SigningKeys) from `common`. [`session`](../common/keys.md#symbol-SigningKeys.session) takes no caller inputs. It returns `RsaPrivateKey`. It can use [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session). It can fail with `KeyError`. The file uses [`Settings`](../common/settings.md#symbol-Settings). `baseUrl` is a read-only field of type `string`. `secureCookies` is a read-only field of type `bool`.

[`settings`](../common/settings.md#symbol-settings) from `common` takes no caller inputs. It returns [`Settings`](../common/settings.md#symbol-Settings).

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`Headers.with`: Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate. `string.bytes`: Encode this string as immutable UTF-8 bytes.

::::

:::::
