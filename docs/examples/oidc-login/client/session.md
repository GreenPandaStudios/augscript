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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYjYzZDI2Njk2NmI5ZmY1NDFhNjM3YTJhZmZkM2Y1ODgxOTg4N2E5MjA1YjgyNWVhMGE2MzQzMmY2YmIxNDQ1YiIsImZvcm1hdHRlZFNoYTI1NiI6ImQzYjRkOGFiNWQ3NjhhZDY2OWEzYTQzMTkyYmMzMzNhM2NiYWY3MDM4YjY4NWY2Nzk5YzlkMmIxNzg5YjZlYzciLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OCwibGFzdCI6NDIsImJhY2tsaW5rcyI6WyJzZXNzaW9uLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLWF1dGhlbnRpY2F0ZSJdfSx7ImlkIjoic291cmNlLUwxMC1MMzUiLCJmaXJzdCI6OSwibGFzdCI6NDIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDE3LUwyMCIsImZpcnN0IjoyMSwibGFzdCI6MjQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwyMS1MMjkiLCJmaXJzdCI6MjUsImxhc3QiOjM2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MMzEtTDM1IiwiZmlyc3QiOjM4LCJsYXN0Ijo0MiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01Il19XX0
// aug-spec: "session.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError from contracts
import settings and SigningKeys and KeyError from common
import Crypto and verifyJwt and JwtError from crypto
import Clock from time
import ExpiringStore from memory
/** An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately. */
authenticate(optional string token, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions):
    match token:
        when null:
            throw SessionError()
        when some value:
            try:
                publicKey = crypto.publicRsa(key=keys.session())
                claims = verifyJwt(
                    token=value,
                    publicKey,
                    kid="session-1",
                    tokenType="august-session+jwt"
                ).decode<SessionClaims>()
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
                        if saved.sub != claims.sub or saved.exp != claims.exp or not crypto.equal(
                            left=saved.csrf.bytes(),
                            right=claims.csrf.bytes()
                        ):
                            throw SessionError()
                        return claims
            catch CryptoError error:
                throw SessionError()
            catch JwtError error:
                throw SessionError()
            catch JsonError error:
                throw SessionError()
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYjYzZDI2Njk2NmI5ZmY1NDFhNjM3YTJhZmZkM2Y1ODgxOTg4N2E5MjA1YjgyNWVhMGE2MzQzMmY2YmIxNDQ1YiIsImZvcm1hdHRlZFNoYTI1NiI6IjI1MDMxNmJhNGMxMjMwZDNhOTQ1MjkzYjJlZDdmMWRmZmI0ODg1ZmNlY2M0ZWZmOTQ5ZTYxODI4OTk1ZTI4OTciLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OCwibGFzdCI6NTYsImJhY2tsaW5rcyI6WyJzZXNzaW9uLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLWF1dGhlbnRpY2F0ZSJdfSx7ImlkIjoic291cmNlLUwxMC1MMzUiLCJmaXJzdCI6OSwibGFzdCI6NTUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDE3LUwyMCIsImZpcnN0IjoyMiwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwyMS1MMjkiLCJmaXJzdCI6MjcsImxhc3QiOjQzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MMzEtTDM1IiwiZmlyc3QiOjQ2LCJsYXN0Ijo1MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01Il19XX0
// aug-spec: "session.aug.md" explains this file. Read it before changes; refresh with aug spec.
import SessionClaims and SessionError from contracts
import settings and SigningKeys and KeyError from common
import Crypto and verifyJwt and JwtError from crypto
import Clock from time
import ExpiringStore from memory
/** An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately. */
authenticate(optional string token, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) {
    match token {
        when null {
            throw SessionError()
        }
        when some value {
            try {
                publicKey = crypto.publicRsa(key=keys.session())
                claims = verifyJwt(
                    token=value,
                    publicKey,
                    kid="session-1",
                    tokenType="august-session+jwt"
                ).decode<SessionClaims>()
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
                        if saved.sub != claims.sub or saved.exp != claims.exp or not crypto.equal(
                            left=saved.csrf.bytes(),
                            right=claims.csrf.bytes()
                        ) {
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

[Interactions and sequences](session-diagrams.md)

### `authenticate` · [source](session.md#source-L9) {#symbol-authenticate}

An app session has its own key, issuer, audience and token type. A live registry entry is required so logout revokes a signed token immediately. It takes labeled inputs `token`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection.

::: spec-paragraph specification-paragraph-1
If `token` is null, it raises a [`SessionError`](contracts.md#symbol-SessionError). The non-null `token` becomes `value`. It sets `publicKey` to [`crypto.publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa) with `key` from [`keys.session`](../common/keys.md#symbol-SigningKeys.session). It sets `claims` to `decode` on [`verifyJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-verifyJwt) with `token` from `value`, `publicKey`, `kid` `"session-1"`, and `tokenType` `"august-session+jwt"` using injected `crypto` for [`SessionClaims`](contracts.md#symbol-SessionClaims). [source](session.md#source-L10-L35)
:::

::: spec-paragraph specification-paragraph-2
It gets `config` from [`settings`](../common/settings.md#symbol-settings). It sets `now` to [`clock.now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now). It checks that `claims.iss` equals the text `{config.baseUrl}/app` and `claims.aud` equals `"august-app"` and the byte length of `claims.sub` does not equal `0` and `claims.exp` is greater than `now` and `claims.iat` is at most (`now` plus `30`) and `claims.iat` is at least (`now` minus `config.sessionSeconds`) and `claims.exp` is greater than `claims.iat` and `claims.exp` is at most ((`now` plus `config.sessionSeconds`) plus `30`). It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. [source](session.md#source-L17-L20)
:::

::: spec-paragraph specification-paragraph-3
It checks that `claims.jti` is a URL-safe ASCII token with `43` to `43` characters and `claims.csrf` is a URL-safe ASCII token with `43` to `43` characters. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It obtains [`sessions.get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get) with `key` from `claims.jti` and `now`. If no value is found, it raises a [`SessionError`](contracts.md#symbol-SessionError). [source](session.md#source-L21-L29)
:::

::: spec-paragraph specification-paragraph-4
The non-null result becomes `saved`. It checks that `saved.sub` equals `claims.sub` and `saved.exp` equals `claims.exp` and [`crypto.equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal) with `left` from the UTF-8 bytes of `saved.csrf` and `right` from the UTF-8 bytes of `claims.csrf` returns true. It raises a [`SessionError`](contracts.md#symbol-SessionError) at the first failed check. It returns `claims`. [source](session.md#source-L10-L35)
:::

::: spec-paragraph specification-paragraph-5
If this work raises `CryptoError`, it raises a [`SessionError`](contracts.md#symbol-SessionError). If this work raises [`JwtError`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-JwtError), it raises a [`SessionError`](contracts.md#symbol-SessionError). If this work raises `JsonError`, it raises a [`SessionError`](contracts.md#symbol-SessionError). [source](session.md#source-L31-L35)
:::

::: details Checked interface

```text
authenticate(optional string token, resolve Crypto crypto, resolve Clock clock, resolve SigningKeys keys, resolve ExpiringStore<SessionClaims> sessions) returns SessionClaims unless KeyError and SessionError and TimeError uses SigningKeys.session, Crypto.publicRsa, Clock.now, ExpiringStore<SessionClaims>.get, Crypto.equal, Crypto.decodeBase64url, Crypto.verifyRsa
```

It takes `token` as `optional string`. It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)), `clock` ([`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock)), `keys` ([`SigningKeys`](../common/keys.md#symbol-SigningKeys)), and `sessions` ([`ExpiringStore<SessionClaims>`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore)) from dependency injection. Omitted optional inputs are null. Failures can raise [`KeyError`](../common/keys.md#symbol-KeyError), [`SessionError`](contracts.md#symbol-SessionError), and `TimeError`.

:::

### Dependencies

It uses [`ExpiringStore`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore) ([`get`](../dependencies/packages/%40git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.md#symbol-ExpiringStore.get)) from `memory`. It uses [`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto) ([`decodeBase64url`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.decodeBase64url), [`equal`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.equal), [`publicRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.publicRsa), and [`verifyRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.verifyRsa)), [`JwtError`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-JwtError), and [`verifyJwt`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/jose.md#symbol-verifyJwt) from `crypto`. It uses [`Clock`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock) ([`now`](../dependencies/packages/%40git/url_c092cd151499c4e1d8a1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-Clock.now)) from `time`. It uses [`SessionClaims`](contracts.md#symbol-SessionClaims) (`aud`, `csrf`, `exp`, `iat`, `iss`, `jti`, and `sub`) and [`SessionError`](contracts.md#symbol-SessionError) from `contracts`.

It uses [`KeyError`](../common/keys.md#symbol-KeyError), [`SigningKeys`](../common/keys.md#symbol-SigningKeys) ([`session`](../common/keys.md#symbol-SigningKeys.session)), and [`settings`](../common/settings.md#symbol-settings) from `common`. It uses [`Settings`](../common/settings.md#symbol-Settings) (`baseUrl` and `sessionSeconds`).

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
