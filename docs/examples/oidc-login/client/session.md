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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`authenticate`](session.md#symbol-authenticate) is a function returning `SessionClaims`.

### `authenticate` {#symbol-authenticate}

[source](session.md#code)

**Inputs**

- `token` (`optional string`) — optional labeled input; omission becomes null.
- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.
- `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)) — injected; callers omit it.
- `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)) — injected; callers omit it.
- `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) — injected; callers omit it.

Returns: [`SessionClaims`](contracts.md#symbol-SessionClaims).

Capabilities: [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get).

Can fail with `SessionError`, `KeyError`, `TimeError`. Callers must catch or propagate these errors.

**What it does**

- Select the matching case for `token`:
  - A null value, including omitted optional input:
    - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
  - A present, non-null value, named `value`:
    - Try these operations:
      - Set `publicKey` to call [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) on `crypto` with `key` = call [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session) on `keys`.
      - Set `claims` to call `decode` on call [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) with `token` = `value`; `publicKey` = `publicKey`; `kid` = `"session-1"`; `tokenType` = `"august-session+jwt"`; inject `crypto` from `crypto` with type arguments [`SessionClaims`](contracts.md#symbol-SessionClaims).
      - Set `config` to call [`settings`](../common/settings.md#symbol-settings).
      - Set `now` to call [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
      - If (((((((`iss` of `claims` does not equal (`baseUrl` of `config` plus `"/app"`)) or (`aud` of `claims` does not equal `"august-app"`)) or (call `length` on `sub` of `claims` equals `0`)) or (`exp` of `claims` is at most `now`)) or (`iat` of `claims` is greater than (`now` plus `30`))) or (`iat` of `claims` is less than (`now` minus `sessionSeconds` of `config`))) or (`exp` of `claims` is at most `iat` of `claims`)) or (`exp` of `claims` is greater than ((`now` plus `sessionSeconds` of `config`) plus `30`)):
        - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
      - If not (call `isToken` on `jti` of `claims` with `min` = `43`; `max` = `43`) or not (call `isToken` on `csrf` of `claims` with `min` = `43`; `max` = `43`):
        - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
      - Select the matching case for call [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) on `sessions` with `key` = `jti` of `claims`; `now` = `now`:
        - A null value, including omitted optional input:
          - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
        - A present, non-null value, named `saved`:
          - If ((`sub` of `saved` does not equal `sub` of `claims`) or (`exp` of `saved` does not equal `exp` of `claims`)) or not (call [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` = call `bytes` on `csrf` of `saved`; `right` = call `bytes` on `csrf` of `claims`):
            - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
          - Return `claims`.
    - If they fail with `CryptoError`, name the failure `error` and recover:
      - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
    - If they fail with [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError), name the failure `error` and recover:
      - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.
    - If they fail with `JsonError`, name the failure `error` and recover:
      - Fail with call [`SessionError`](contracts.md#symbol-SessionError). Transfer control to a matching catch or propagate the failure.

**Author documentation**

An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Capability interface from `august.crypto`.

- [`Crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`.
- [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`.
- [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) (`key`: `RsaPrivateKey`) → `RsaPublicKey`; can fail with `CryptoError`.
- [`Crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) (`publicKey`: `RsaPublicKey`, `input`: `Bytes`, `signature`: `Bytes`) → `bool`; can fail with `CryptoError`.

#### [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError)

Class from `august.crypto`.

Used as a type or provider.

#### [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt)

Function from `august.crypto`.

- [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) (`token`: `string`, `publicKey`: `RsaPublicKey`, `kid`: `string`, `tokenType`: `string`) → `Json`; inject `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto); uses [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa); can fail with `JwtError`.

#### [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)

Capability interface from `august.memory`.

- [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) (`key`: `string`, `now`: `int`) → `optional T`.

#### [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)

Capability interface from `august.time`.

- [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.

#### [`SessionClaims`](contracts.md#symbol-SessionClaims)

Record from `contracts`.

- Read `aud` (`string`).
- Read `csrf` (`string`).
- Read `exp` (`int`).
- Read `iat` (`int`).
- Read `iss` (`string`).
- Read `jti` (`string`).
- Read `sub` (`string`).

#### [`SessionError`](contracts.md#symbol-SessionError)

Class from `contracts`.

- Construct with no caller inputs → [`SessionError`](contracts.md#symbol-SessionError).

#### [`KeyError`](../common/keys.md#symbol-KeyError)

Class from `common`.

Used as a type or provider.

#### [`SigningKeys`](../common/keys.md#symbol-SigningKeys)

Capability interface from `common`.

- [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session) (no caller inputs) → `RsaPrivateKey`; can fail with `KeyError`.

#### [`Settings`](../common/settings.md#symbol-Settings)

Record.

- Read `baseUrl` (`string`).
- Read `sessionSeconds` (`int`).

#### [`settings`](../common/settings.md#symbol-settings)

Function from `common`.

- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings).

### Built-in operations used by this file

- `Json.decode` (no inputs) → `SessionClaims`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected. Can fail with `JsonError`.
- `string.bytes` (no inputs) → `Bytes`: Encode this string as immutable UTF-8 bytes.
- `string.isToken` (`min`: `int`, `max`: `int`) → `bool`: Require an ASCII RFC 3986 unreserved token with a bounded length.
- `string.length` (no inputs) → `int`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
