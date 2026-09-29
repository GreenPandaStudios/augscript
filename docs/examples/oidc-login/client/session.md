---
title: "client/session.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/client/session.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-authenticate"></a>
### `authenticate` · [source](session.md#code)

An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately.

**Inputs:** Take `token` (`optional string`); omitted means null. Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`. Resolve [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) as `clock`. Resolve [`SigningKeys`](../common/keys.md#symbol-SigningKeys) as `keys`. Resolve [`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) as `sessions`.

Returns [`SessionClaims`](contracts.md#symbol-SessionClaims). Uses [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), [`crypto.decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`crypto.verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa), [`crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now), [`keys.session`](../common/keys.md#symbol-SigningKeys.session), [`sessions.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get). Can fail with `SessionError`, `KeyError`, `TimeError`.

- Match `token`:
  - A null value, including omitted optional input:
    - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
  - A present, non-null value, named `value`:
    - Try:
      - Set `publicKey` to the result of [`Crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) on `crypto` with `key` as the result of [`SigningKeys.session`](../common/keys.md#symbol-SigningKeys.session) on `keys`.
      - Set `claims` to the result of `decode` on the result of [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) with `token` as `value`, `publicKey`, `kid` as `"session-1"`, `tokenType` as `"august-session+jwt"` using `crypto` with type arguments [`SessionClaims`](contracts.md#symbol-SessionClaims).
      - Set `config` to the result of [`settings`](../common/settings.md#symbol-settings).
      - Set `now` to the result of [`Clock.now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) on `clock`.
      - If (((((((`iss` of `claims` does not equal (`baseUrl` of `config` plus `"/app"`)) or (`aud` of `claims` does not equal `"august-app"`)) or (the result of `length` on `sub` of `claims` equals `0`)) or (`exp` of `claims` is at most `now`)) or (`iat` of `claims` is greater than (`now` plus `30`))) or (`iat` of `claims` is less than (`now` minus `sessionSeconds` of `config`))) or (`exp` of `claims` is at most `iat` of `claims`)) or (`exp` of `claims` is greater than ((`now` plus `sessionSeconds` of `config`) plus `30`)):
        - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
      - If not (the result of `isToken` on `jti` of `claims` with `min` as `43`, `max` as `43`) or not (the result of `isToken` on `csrf` of `claims` with `min` as `43`, `max` as `43`):
        - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
      - Match the result of [`ExpiringStore.get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) on `sessions` with `key` as `jti` of `claims`, `now`:
        - A null value, including omitted optional input:
          - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
        - A present, non-null value, named `saved`:
          - If ((`sub` of `saved` does not equal `sub` of `claims`) or (`exp` of `saved` does not equal `exp` of `claims`)) or not (the result of [`Crypto.equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) on `crypto` with `left` as the result of `bytes` on `csrf` of `saved`, `right` as the result of `bytes` on `csrf` of `claims`):
            - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
          - Return `claims`.
    - Catch `CryptoError` as `error`:
      - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
    - Catch [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError) as `error`:
      - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).
    - Catch `JsonError` as `error`:
      - Fail with a new [`SessionError`](contracts.md#symbol-SessionError).

### Dependencies

- [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`: [`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url) (`input`: `string`) → `Bytes`; can fail with `CryptoError`; [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal) (`left`: `Bytes`, `right`: `Bytes`) → `bool`; [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) (`key`: `RsaPrivateKey`) → `RsaPublicKey`; can fail with `CryptoError`; [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa) (`publicKey`: `RsaPublicKey`, `input`: `Bytes`, `signature`: `Bytes`) → `bool`; can fail with `CryptoError`.
- [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError) from `august.crypto`.
- [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) (`token`: `string`, `publicKey`: `RsaPublicKey`, `kid`: `string`, `tokenType`: `string`) → `Json`; can fail with `JwtError` from `august.crypto`.
- [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) from `august.memory`: [`get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get) (`key`: `string`, `now`: `int`) → `optional T`.
- [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) from `august.time`: [`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now) (no caller inputs) → `int`; can fail with `TimeError`.
- [`SessionClaims`](contracts.md#symbol-SessionClaims) from `contracts`: read `aud` (`string`); read `csrf` (`string`); read `exp` (`int`); read `iat` (`int`); read `iss` (`string`); read `jti` (`string`); read `sub` (`string`).
- [`SessionError`](contracts.md#symbol-SessionError) from `contracts`: construct with no caller inputs.
- [`KeyError`](../common/keys.md#symbol-KeyError) from `common`.
- [`SigningKeys`](../common/keys.md#symbol-SigningKeys) from `common`: [`session`](../common/keys.md#symbol-SigningKeys.session) (no caller inputs) → `RsaPrivateKey`; can fail with `KeyError`.
- [`Settings`](../common/settings.md#symbol-Settings): read `baseUrl` (`string`); read `sessionSeconds` (`int`).
- [`settings`](../common/settings.md#symbol-settings) (no caller inputs) → [`Settings`](../common/settings.md#symbol-Settings) from `common`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Json.decode`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected.
- `string.bytes`: Encode this string as immutable UTF-8 bytes.
- `string.isToken`: Require an ASCII RFC 3986 unreserved token with a bounded length.
- `string.length`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

::::

:::::
