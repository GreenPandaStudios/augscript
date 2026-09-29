---
title: "client/session.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/session.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `client/session.aug`

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
import settings and SigningKeys and KeyError from common
import Crypto and verifyJwt and JwtError from august.crypto
import Clock from august.time
import ExpiringStore from august.memory
/** An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately. */
authenticate(optional string token, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns SessionClaims uses crypto.publicRsa and crypto.decodeBase64url and crypto.verifyRsa and crypto.equal and clock.now and keys.session and sessions.get unless SessionError and KeyError and TimeError:
    match token:
        when null:
            throw SessionError()
        when some value:
            try:
                publicKey = crypto.publicRsa(key=keys.session())
                claims = verifyJwt(token=value, publicKey, kid="session-1", tokenType="august-session+jwt").decode<SessionClaims>()
                config = settings()
                now = clock.now()
                if claims.iss != config.baseUrl + "/app" or claims.aud != "august-app" or claims.sub.length() == 0 or claims.exp <= now or claims.iat > now + 30 or claims.iat < now - config.sessionSeconds or claims.exp <= claims.iat or claims.exp > now + config.sessionSeconds + 30:
                    throw SessionError()
                if not claims.jti.isToken(min=43, max=43) or not claims.csrf.isToken(min=43, max=43):
                    throw SessionError()
                match sessions.get(key=claims.jti, now=now):
                    when null:
                        throw SessionError()
                    when some saved:
                        if saved.sub != claims.sub or saved.exp != claims.exp or not crypto.equal(left=saved.csrf.bytes(), right=claims.csrf.bytes()):
                            throw SessionError()
                        return claims
            catch CryptoError error:
                throw SessionError()
            catch JwtError error:
                throw SessionError()
            catch JsonError error:
                throw SessionError()
```

```aug [Braces]
import SessionClaims and SessionError from contracts
import settings and SigningKeys and KeyError from common
import Crypto and verifyJwt and JwtError from august.crypto
import Clock from august.time
import ExpiringStore from august.memory
/** An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately. */
authenticate(optional string token, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns SessionClaims uses crypto.publicRsa and crypto.decodeBase64url and crypto.verifyRsa and crypto.equal and clock.now and keys.session and sessions.get unless SessionError and KeyError and TimeError {
    match token {
        when null {
            throw SessionError()
        }
        when some value {
            try {
                publicKey = crypto.publicRsa(key=keys.session())
                claims = verifyJwt(token=value, publicKey, kid="session-1", tokenType="august-session+jwt").decode<SessionClaims>()
                config = settings()
                now = clock.now()
                if claims.iss != config.baseUrl + "/app" or claims.aud != "august-app" or claims.sub.length() == 0 or claims.exp <= now or claims.iat > now + 30 or claims.iat < now - config.sessionSeconds or claims.exp <= claims.iat or claims.exp > now + config.sessionSeconds + 30 {
                    throw SessionError()
                }
                if not claims.jti.isToken(min=43, max=43) or not claims.csrf.isToken(min=43, max=43) {
                    throw SessionError()
                }
                match sessions.get(key=claims.jti, now=now) {
                    when null {
                        throw SessionError()
                    }
                    when some saved {
                        if saved.sub != claims.sub or saved.exp != claims.exp or not crypto.equal(left=saved.csrf.bytes(), right=claims.csrf.bytes()) {
                            throw SessionError()
                        }
                        return claims
                    }
                }
            }
            catch CryptoError error {
                throw SessionError()
            }
            catch JwtError error {
                throw SessionError()
            }
            catch JsonError error {
                throw SessionError()
            }
        }
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

#### [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError)

Available from `august.crypto`.

Class. Follow the linked specification for its full explanation.

#### [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt)

Available from `august.crypto`.

**Inputs and dependencies**

- `token`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `publicKey`: `RsaPublicKey`. The caller supplies this labeled input. Read reference values without copying them.
- `kid`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `tokenType`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `Json`.

Capabilities: [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa).

Possible failures: `JwtError`. The caller must catch or propagate them.

#### [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)

Available from `august.memory`.

Interface. Follow the linked specification for its full explanation.

**[`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get)**

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `optional T`.

Capabilities: [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

#### [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)

Available from `august.time`.

Interface. Follow the linked specification for its full explanation.

**[`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now)**

Result: `int`.

Capabilities: [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now).

Possible failures: `TimeError`. The caller must catch or propagate them.

#### [`SessionClaims`](contracts.md#symbol-SessionClaims)

Available from `contracts`.

Immutable record. Follow the linked specification for its full explanation.

Field `iss`: `string`. Read-only after initialization.

Field `aud`: `string`. Read-only after initialization.

Field `sub`: `string`. Read-only after initialization.

Field `exp`: `int`. Read-only after initialization.

Field `iat`: `int`. Read-only after initialization.

Field `jti`: `string`. Read-only after initialization.

Field `csrf`: `string`. Read-only after initialization.

#### [`SessionError`](contracts.md#symbol-SessionError)

Available from `contracts`.

Class. Follow the linked specification for its full explanation.

**Construction**

Result: [`SessionError`](contracts.md#symbol-SessionError).

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

Field `sessionSeconds`: `int`. Read-only after initialization.

#### [`settings`](../common/settings.md#symbol-settings)

Available from `common`.

Result: [`Settings`](../common/settings.md#symbol-Settings).

### Built-in operations used by this file

#### `Json.decode`

Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected.

Result: `SessionClaims`.

Possible failures: `JsonError`.

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

#### `string.length`

Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `authenticate` {#symbol-authenticate}

[source](session.md#code)

**Inputs and dependencies**

- `token`: `optional string`. The caller may supply this labeled input; omission becomes null. Read reference values without copying them.
- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `clock`: [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](../common/keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `sessions`: [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`SessionClaims`](contracts.md#symbol-SessionClaims).

Capabilities: [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

Possible failures: `SessionError`, `KeyError`, `TimeError`. The caller must catch or propagate them.

**Author documentation**

An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately.

**Behavior when execution reaches this operation**

- Select the matching case for `token`:
  - A null value, including omitted optional input:
    - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - A present, non-null value, named `value`:
    - Try these operations:
      - Set `publicKey` to the result of call [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) on `crypto` with `key` set to the result of call [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session) on `keys`.
      - Set `claims` to the result of call `decode` on the result of call [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) with `token` set to `value`; `publicKey` set to `publicKey`; `kid` set to `"session-1"`; `tokenType` set to `"august-session+jwt"`; supply dependencies `crypto` from `crypto` with type arguments [`SessionClaims`](contracts.md#symbol-SessionClaims).
      - Set `config` to the result of call [`settings`](../common/settings.md#symbol-settings).
      - Set `now` to the result of call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
      - If ((((((((`iss` of `claims` does not equal (`baseUrl` of `config` plus `"/app"`)) or (`aud` of `claims` does not equal `"august-app"`)) or (the result of call `length` on `sub` of `claims` equals `0`)) or (`exp` of `claims` is at most `now`)) or (`iat` of `claims` is greater than (`now` plus `30`))) or (`iat` of `claims` is less than (`now` minus `sessionSeconds` of `config`))) or (`exp` of `claims` is at most `iat` of `claims`)) or (`exp` of `claims` is greater than ((`now` plus `sessionSeconds` of `config`) plus `30`))) is true:
        - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
      - If (not (the result of call `isToken` on `jti` of `claims` with `min` set to `43`; `max` set to `43`) or not (the result of call `isToken` on `csrf` of `claims` with `min` set to `43`; `max` set to `43`)) is true:
        - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
      - Select the matching case for the result of call [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) on `sessions` with `key` set to `jti` of `claims`; `now` set to `now`:
        - A null value, including omitted optional input:
          - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
        - A present, non-null value, named `saved`:
          - If (((`sub` of `saved` does not equal `sub` of `claims`) or (`exp` of `saved` does not equal `exp` of `claims`)) or not (the result of call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` set to the result of call `bytes` on `csrf` of `saved`; `right` set to the result of call `bytes` on `csrf` of `claims`)) is true:
            - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
          - Return `claims` and finish this operation.
    - If they fail with `CryptoError`, name the failure `error` and recover:
      - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
    - If they fail with [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError), name the failure `error` and recover:
      - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
    - If they fail with `JsonError`, name the failure `error` and recover:
      - Fail with the result of call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
