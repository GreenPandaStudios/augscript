---
title: "client/logout.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/logout.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Available from `august.crypto`.

Interface. Follow the linked specification for its full explanation.

**[`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url)**

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Bytes`.

Capabilities: [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal)**

**Inputs and dependencies**

- `left`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `right`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal).

**[`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa)**

**Inputs and dependencies**

- `key`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: `RsaPublicKey`.

Capabilities: [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

**[`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa)**

**Inputs and dependencies**

- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `input`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.
- `signature`: `Bytes`. The caller supplies this labeled input. Read reference values without copying them.

Result: `bool`.

Capabilities: [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

#### [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)

Available from `august.memory`.

Interface. Follow the linked specification for its full explanation.

**[`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get)**

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `optional T`.

Capabilities: [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

**[`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take)**

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `optional T`.

Capabilities: [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take).

#### [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)

Available from `august.time`.

Interface. Follow the linked specification for its full explanation.

**[`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now)**

Result: `int`.

Capabilities: [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now).

Possible failures: `TimeError`. The caller must catch or propagate them.

#### [`LogoutForm`](contracts.md#symbol-LogoutForm)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

Field `csrf`: `string`. Read-only after initialization.

#### [`SessionClaims`](contracts.md#symbol-SessionClaims)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

Field `csrf`: `string`. Read-only after initialization.

Field `jti`: `string`. Read-only after initialization.

#### [`SessionError`](contracts.md#symbol-SessionError)

Available from `contracts`.

Class. Follow the linked specification for its full explanation.

**Construction**

Result: [`SessionError`](contracts.md#symbol-SessionError).

#### [`authenticate`](session.md#symbol-authenticate)

Available from `session`.

**Inputs and dependencies**

- `token`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](../common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `sessions`: [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`SessionClaims`](contracts.md#symbol-SessionClaims).

Capabilities: [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

Possible failures: `SessionError`, `KeyError`, `TimeError`. The caller must catch or propagate them.

#### [`securityHeaders`](../common/headers.md#symbol-securityHeaders)

Available from `common`.

Result: `Headers`.

Possible failures: `HttpError`. The caller must catch or propagate them.

#### [`withCookie`](../common/headers.md#symbol-withCookie)

Available from `common`.

**Inputs and dependencies**

- `headers`: `Headers`. The caller supplies this labeled input. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `value`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `path`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `maxAge`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `secure`: `bool`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Headers`.

Possible failures: `HttpError`. The caller must catch or propagate them.

#### [`KeyError`](../common/keys.md#symbol-KeyError)

Available from `common`.

Class. Follow the linked specification for its full explanation.

#### [`SigningKeys`](../common/keys.md#symbol-SigningKeys)

Available from `common`.

Interface. Follow the linked specification for its full explanation.

**[`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session)**

Result: `RsaPrivateKey`.

Capabilities: [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session).

Possible failures: `KeyError`. The caller must catch or propagate them.

#### [`Settings`](../common/settings.md#symbol-Settings)

Immutable record. Follow the linked specification for its full explanation.

Field `baseUrl`: `string`. Read-only after initialization.

Field `secureCookies`: `bool`. Read-only after initialization.

#### [`settings`](../common/settings.md#symbol-settings)

Available from `common`.

Result: [`Settings`](../common/settings.md#symbol-Settings).

### Built-in operations used by this file

#### `Headers.with`

Return new headers with one additional validated field. Header names ignore case; duplicate values remain separate.

Inputs: `name`: `string`; `value`: `string`.

Result: `Headers`.

Possible failures: `HttpError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `string.bytes`

Encode this string as immutable UTF-8 bytes.

Result: `Bytes`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `logout` {#symbol-logout}

[source](logout.md#code)

**Inputs and dependencies**

- `input`: [`LogoutForm`](contracts.md#symbol-LogoutForm). The caller supplies this labeled input. Read reference values without copying them. Read it from the HTTP form.
- `token`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP cookie named `aug_session`.
- `origin`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them. Read it from the HTTP header.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](../common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `sessions`: [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `HttpResponse<Html>`.

Capabilities: [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get), [`sessions.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take).

Possible failures: `SessionError`, `KeyError`, `TimeError`, `CryptoError`, `HttpError`. The caller must catch or propagate them.

HTTP route: `POST` `/logout`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

Declared HTTP failures: [`SessionError`](contracts.md#symbol-SessionError) returns status 403.

**Author documentation**

POST logout checks the origin and session-bound CSRF value, then removes the live registry entry before clearing the cookie.

**Behavior when execution reaches this operation**

- Set `config` to the result of call [`settings`](../common/settings.md#symbol-settings).
- If (`origin` does not equal `baseUrl` of `config`) is true:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- Set `session` to the result of call [`authenticate`](session.md#symbol-authenticate) with `token` set to `token`; supply dependencies `crypto` from `crypto`, `clock` from `clock`, `keys` from `keys`, `sessions` from `sessions`.
- If not (the result of call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` set to the result of call `bytes` on `csrf` of `input`; `right` set to the result of call `bytes` on `csrf` of `session`) is true:
  - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
- Call [`ExpiringStore.take`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.take) on `sessions` with `key` set to `jti` of `session`; `now` set to the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
- Set `headers` to the result of call [`withCookie`](../common/headers.md#symbol-withCookie) with `headers` set to the result of call `with` on the result of call [`securityHeaders`](../common/headers.md#symbol-securityHeaders) with `name` set to `"location"`; `value` set to `"/"`; `name` set to `"aug_session"`; `value` set to `""`; `path` set to `"/"`; `maxAge` set to `0`; `secure` set to `secureCookies` of `config`.
- Return the result of call `HttpResponse` with `body` set to the HTML element `p`; children: `Signed out.`. Escape embedded text; render components on the server; `status` set to `303`; `headers` set to `headers` and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
