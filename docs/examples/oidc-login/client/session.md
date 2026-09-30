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
// aug-spec: "session.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError from contracts
import settings and SigningKeys and KeyError from common
import Crypto and verifyJwt and JwtError from august.crypto
import Clock from august.time
import ExpiringStore from august.memory
/** An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately. */
authenticate(optional string token, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions):
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
// aug-spec: "session.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError from contracts
import settings and SigningKeys and KeyError from common
import Crypto and verifyJwt and JwtError from august.crypto
import Clock from august.time
import ExpiringStore from august.memory
/** An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately. */
authenticate(optional string token, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) {
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

### `authenticate` · [source](session.md#code) {#symbol-authenticate}

An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately.

It takes `token` as `optional string`. It gets `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. Failures can raise [`KeyError`](../common/keys.md#symbol-KeyError), [`SessionError`](contracts.md#symbol-SessionError), and `TimeError`.

If `token` is null, it raises a [`SessionError`](contracts.md#symbol-SessionError). The non-null `token` becomes `value`. It sets `publicKey` to [`crypto.publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa) with `key` from [`keys.session`](../common/keys.md#symbol-SigningKeys.session). It sets `claims` to `decode` on [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) with `token` from `value`, `publicKey`, `kid` `"session-1"`, and `tokenType` `"august-session+jwt"` using injected `crypto` for [`SessionClaims`](contracts.md#symbol-SessionClaims).

It gets `config` from [`settings`](../common/settings.md#symbol-settings). It sets `now` to the current time from `clock`. It checks that `claims.iss` equals the text `{config.baseUrl}/app` and `claims.aud` equals `"august-app"` and the byte length of `claims.sub` does not equal `0` and `claims.exp` is greater than `now` and `claims.iat` is at most (`now` plus `30`) and `claims.iat` is at least (`now` minus `config.sessionSeconds`) and `claims.exp` is greater than `claims.iat` and `claims.exp` is at most ((`now` plus `config.sessionSeconds`) plus `30`). It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check.

It checks that `claims.jti` is a URL-safe ASCII token with `43` to `43` characters and `claims.csrf` is a URL-safe ASCII token with `43` to `43` characters. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It obtains the live value in `sessions` under `claims.jti`, using `now` as the current time. If no value is found, it raises a [`SessionError`](contracts.md#symbol-SessionError).

The non-null result becomes `saved`. It checks that `saved.sub` equals `claims.sub` and `saved.exp` equals `claims.exp` and the UTF-8 bytes of `saved.csrf` and the UTF-8 bytes of `claims.csrf` match when compared by `crypto`. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It returns `claims`.

If this work raises `CryptoError`, it raises a [`SessionError`](contracts.md#symbol-SessionError). If this work raises [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError), it raises a [`SessionError`](contracts.md#symbol-SessionError). If this work raises `JsonError`, it raises a [`SessionError`](contracts.md#symbol-SessionError).

### Dependencies

It uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.equal), [`publicRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.publicRsa), and [`verifyRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.verifyRsa)), [`JwtError`](../dependencies/august/0.19.0/crypto/jose.md#symbol-JwtError), and [`verifyJwt`](../dependencies/august/0.19.0/crypto/jose.md#symbol-verifyJwt) from `august.crypto`. It uses [`ExpiringStore`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore) ([`get`](../dependencies/august/0.19.0/memory/store.md#symbol-ExpiringStore.get)) from `august.memory`. It uses [`Clock`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock) ([`now`](../dependencies/august/0.19.0/time/contracts.md#symbol-Clock.now)) from `august.time`. It uses [`SessionClaims`](contracts.md#symbol-SessionClaims) (`aud`, `csrf`, `exp`, `iat`, `iss`, `jti`, and `sub`) and [`SessionError`](contracts.md#symbol-SessionError) from `contracts`.

It uses [`KeyError`](../common/keys.md#symbol-KeyError), [`SigningKeys`](../common/keys.md#symbol-SigningKeys) ([`session`](../common/keys.md#symbol-SigningKeys.session)), and [`settings`](../common/settings.md#symbol-settings) from `common`. It uses [`Settings`](../common/settings.md#symbol-Settings) (`baseUrl` and `sessionSeconds`). These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
