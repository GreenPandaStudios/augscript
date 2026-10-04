---
title: "common/keys.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/common/keys.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `common/keys.aug`

[OpenID Connect login application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`client/contracts.aug`](../client/contracts.md)
- [`client/endpoints.aug`](../client/endpoints.md)
- [`client/export.aug`](../client/export.md)
- [`client/login.aug`](../client/login.md)
- [`client/logout.aug`](../client/logout.md)
- [`client/protocol.aug`](../client/protocol.md)
- [`client/session.aug`](../client/session.md)
- [`client/views.aug`](../client/views.md)
- [`common/export.aug`](export.md)
- [`common/headers.aug`](headers.md)
- [`common/keys.aug`](keys.md)
- [`common/settings.aug`](settings.md)
- [`common/views.aug`](views.md)
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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNTYyODU0ZGE1Zjk0NmVlNGM4ZDQ0MGMyNTY4MmFhOWVkMmJkYzU1ZWI1ZGZiMjdiYTRjN2E5MjU5ZmVlYjM4ZCIsImZvcm1hdHRlZFNoYTI1NiI6IjI2NzlkMjQyYWEyZWJjYjAwZDk3MjZjMGVlODg5MDA0YzZiNGEyYmQ1ODg5MDQ5MjNhZGIyYzJhNDljZjc0ODAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6MywibGFzdCI6NCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtS2V5RXJyb3IiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo2LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1TaWduaW5nS2V5cyJdfSx7ImlkIjoic291cmNlLUw4IiwiZmlyc3QiOjcsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVNpZ25pbmdLZXlzLmNvbmZpZ3VyZSJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjgsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVNpZ25pbmdLZXlzLnByb3ZpZGVyIl19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjksImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3ltYm9sLVNpZ25pbmdLZXlzLnNlc3Npb24iXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MTAsImxhc3QiOjMxLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1NZW1vcnlTaWduaW5nS2V5cyJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoxMiwibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIjc3ltYm9sLU1lbW9yeVNpZ25pbmdLZXlzLmNvbmZpZ3VyZSJdfSx7ImlkIjoic291cmNlLUwxNS1MMTkiLCJmaXJzdCI6MTMsImxhc3QiOjE3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwyMCIsImZpcnN0IjoxOCwibGFzdCI6MjQsImJhY2tsaW5rcyI6WyIjc3ltYm9sLU1lbW9yeVNpZ25pbmdLZXlzLnByb3ZpZGVyIl19LHsiaWQiOiJzb3VyY2UtTDIxLUwyNiIsImZpcnN0IjoxOSwibGFzdCI6MjQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDI3IiwiZmlyc3QiOjI1LCJsYXN0IjozMSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtTWVtb3J5U2lnbmluZ0tleXMuc2Vzc2lvbiJdfSx7ImlkIjoic291cmNlLUwyOC1MMzMiLCJmaXJzdCI6MjYsImxhc3QiOjMxLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNiJdfSx7ImlkIjoic291cmNlLUwzNSIsImZpcnN0IjozMiwibGFzdCI6MzUsImJhY2tsaW5rcyI6WyIjc3ltYm9sLWluaXRpYWxpemVLZXlzIl19LHsiaWQiOiJzb3VyY2UtTDM2LUwzOCIsImZpcnN0IjozMywibGFzdCI6MzUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNyJdfV19
// aug-spec: "keys.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto from crypto
KeyError() implements Error:
    pass
/** Keys are initialized explicitly in main and expose distinct provider and session roles. */
capability SigningKeys:
    configure(RsaPrivateKey provider, RsaPrivateKey session) uses SigningKeys.configure unless KeyError
    provider() returns RsaPrivateKey uses SigningKeys.provider unless KeyError
    session() returns RsaPrivateKey uses SigningKeys.session unless KeyError
MemorySigningKeys() implements SigningKeys:
    Shared<Map<string,RsaPrivateKey>> _keys = Shared(value=Map<string, RsaPrivateKey>())
    configure(RsaPrivateKey provider, RsaPrivateKey session):
        lock _keys as keys:
            if keys.length() != 0:
                throw KeyError()
            keys.set(key="provider", value=provider)
            keys.set(key="session", value=session)
    provider():
        lock _keys as keys:
            match keys.get(key="provider"):
                when null:
                    throw KeyError()
                when some key:
                    return key
    session():
        lock _keys as keys:
            match keys.get(key="session"):
                when null:
                    throw KeyError()
                when some key:
                    return key
initializeKeys(resolve Crypto crypto, resolve SigningKeys keys):
    provider = crypto.generateRsa()
    session = crypto.generateRsa()
    keys.configure(provider, session)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNTYyODU0ZGE1Zjk0NmVlNGM4ZDQ0MGMyNTY4MmFhOWVkMmJkYzU1ZWI1ZGZiMjdiYTRjN2E5MjU5ZmVlYjM4ZCIsImZvcm1hdHRlZFNoYTI1NiI6Ijg5ODIwNGNlZTU2MmRhNTI2ZmM5MWYyMjcwNjEwMWRiZjBiZDA4YTdlMzAwOWFiOWRlNWU5M2U4NmE5ZmMzZjUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6MywibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtS2V5RXJyb3IiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo3LCJsYXN0IjoxMSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtU2lnbmluZ0tleXMiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0Ijo4LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1TaWduaW5nS2V5cy5jb25maWd1cmUiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo5LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1TaWduaW5nS2V5cy5wcm92aWRlciJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0IjoxMCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVNpZ25pbmdLZXlzLnNlc3Npb24iXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MTIsImxhc3QiOjQ3LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1NZW1vcnlTaWduaW5nS2V5cyJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoxNCwibGFzdCI6MjIsImJhY2tsaW5rcyI6WyIjc3ltYm9sLU1lbW9yeVNpZ25pbmdLZXlzLmNvbmZpZ3VyZSJdfSx7ImlkIjoic291cmNlLUwxNS1MMTkiLCJmaXJzdCI6MTUsImxhc3QiOjIxLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwyMCIsImZpcnN0IjoyMywibGFzdCI6MzQsImJhY2tsaW5rcyI6WyIjc3ltYm9sLU1lbW9yeVNpZ25pbmdLZXlzLnByb3ZpZGVyIl19LHsiaWQiOiJzb3VyY2UtTDIxLUwyNiIsImZpcnN0IjoyNCwibGFzdCI6MzMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDI3IiwiZmlyc3QiOjM1LCJsYXN0Ijo0NiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtTWVtb3J5U2lnbmluZ0tleXMuc2Vzc2lvbiJdfSx7ImlkIjoic291cmNlLUwyOC1MMzMiLCJmaXJzdCI6MzYsImxhc3QiOjQ1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNiJdfSx7ImlkIjoic291cmNlLUwzNSIsImZpcnN0Ijo0OCwibGFzdCI6NTIsImJhY2tsaW5rcyI6WyIjc3ltYm9sLWluaXRpYWxpemVLZXlzIl19LHsiaWQiOiJzb3VyY2UtTDM2LUwzOCIsImZpcnN0Ijo0OSwibGFzdCI6NTEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNyJdfV19
// aug-spec: "keys.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto from crypto
KeyError() implements Error {
    pass
}
/** Keys are initialized explicitly in main and expose distinct provider and session roles. */
capability SigningKeys {
    configure(RsaPrivateKey provider, RsaPrivateKey session) uses SigningKeys.configure unless KeyError
    provider() returns RsaPrivateKey uses SigningKeys.provider unless KeyError
    session() returns RsaPrivateKey uses SigningKeys.session unless KeyError
}
MemorySigningKeys() implements SigningKeys {
    Shared<Map<string,RsaPrivateKey>> _keys = Shared(value=Map<string, RsaPrivateKey>())
    configure(RsaPrivateKey provider, RsaPrivateKey session) {
        lock _keys as keys {
            if keys.length() != 0 {
                throw KeyError()
            }
            keys.set(key="provider", value=provider)
            keys.set(key="session", value=session)
        }
    }
    provider() {
        lock _keys as keys {
            match keys.get(key="provider") {
                when null {
                    throw KeyError()
                }
                when some key {
                    return key
                }
            }
        }
    }
    session() {
        lock _keys as keys {
            match keys.get(key="session") {
                when null {
                    throw KeyError()
                }
                when some key {
                    return key
                }
            }
        }
    }
}
initializeKeys(resolve Crypto crypto, resolve SigningKeys keys) {
    provider = crypto.generateRsa()
    session = crypto.generateRsa()
    keys.configure(provider, session)
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `KeyError` · class · [source](keys.md#source-L4) {#symbol-KeyError}

It implements `Error`.

### `SigningKeys` · capability interface · [source](keys.md#source-L7) {#symbol-SigningKeys}

Keys are initialized explicitly in main and expose distinct provider and session roles.

#### `SigningKeys.configure` · [source](keys.md#source-L8) {#symbol-SigningKeys.configure}

It takes `provider` and `session` as `RsaPrivateKey`. It can call [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure). Failures can raise [`KeyError`](keys.md#symbol-KeyError).

#### `SigningKeys.provider` · [source](keys.md#source-L9) {#symbol-SigningKeys.provider}

It returns `RsaPrivateKey`. It can call [`SigningKeys.provider`](keys.md#symbol-SigningKeys.provider). Failures can raise [`KeyError`](keys.md#symbol-KeyError).

#### `SigningKeys.session` · [source](keys.md#source-L10) {#symbol-SigningKeys.session}

It returns `RsaPrivateKey`. It can call [`SigningKeys.session`](keys.md#symbol-SigningKeys.session). Failures can raise [`KeyError`](keys.md#symbol-KeyError).

### `MemorySigningKeys` · class · [source](keys.md#source-L12) {#symbol-MemorySigningKeys}

It implements [`SigningKeys`](keys.md#symbol-SigningKeys). The read-only, private field `_keys` has type `Shared<Map<string,RsaPrivateKey>>` and starts as a `Shared` with `value` from an empty map from `string` to `RsaPrivateKey`.

#### `MemorySigningKeys.configure` · [source](keys.md#source-L14) {#symbol-MemorySigningKeys.configure}

It takes `provider` and `session` as `RsaPrivateKey`.

::: spec-paragraph specification-paragraph-1
While holding the lock on `_keys` as mutable `keys`, it checks that the number of elements in `keys` equals `0`. It raises a [`KeyError`](keys.md#symbol-KeyError) at the first failed check. It stores `provider` in `keys` under `"provider"`. It stores `session` in `keys` under `"session"`. [source](keys.md#source-L15-L19)
:::

::: spec-paragraph specification-paragraph-2
Release this lock when the block exits, including on return or failure. [source](keys.md#source-L15-L19)
:::

::: details Checked interface

```text
configure(RsaPrivateKey provider, RsaPrivateKey session) returns void unless KeyError uses SigningKeys.configure
```

It takes `provider` and `session` as `RsaPrivateKey`. Failures can raise [`KeyError`](keys.md#symbol-KeyError).

:::

#### `MemorySigningKeys.provider` · [source](keys.md#source-L20) {#symbol-MemorySigningKeys.provider}

::: spec-paragraph specification-paragraph-3
While holding the lock on `_keys` as mutable `keys`, it obtains the value under `"provider"` in `keys`. If no value is found, it raises a [`KeyError`](keys.md#symbol-KeyError). The non-null result becomes `key`. It returns `key`. [source](keys.md#source-L21-L26)
:::

::: spec-paragraph specification-paragraph-4
Release this lock when the block exits, including on return or failure. [source](keys.md#source-L21-L26)
:::

::: details Checked interface

```text
provider() returns RsaPrivateKey unless KeyError uses SigningKeys.provider
```

Failures can raise [`KeyError`](keys.md#symbol-KeyError).

:::

#### `MemorySigningKeys.session` · [source](keys.md#source-L27) {#symbol-MemorySigningKeys.session}

::: spec-paragraph specification-paragraph-5
While holding the lock on `_keys` as mutable `keys`, it obtains the value under `"session"` in `keys`. If no value is found, it raises a [`KeyError`](keys.md#symbol-KeyError). The non-null result becomes `key`. It returns `key`. [source](keys.md#source-L28-L33)
:::

::: spec-paragraph specification-paragraph-6
Release this lock when the block exits, including on return or failure. [source](keys.md#source-L28-L33)
:::

::: details Checked interface

```text
session() returns RsaPrivateKey unless KeyError uses SigningKeys.session
```

Failures can raise [`KeyError`](keys.md#symbol-KeyError).

:::

### `initializeKeys` · [source](keys.md#source-L35) {#symbol-initializeKeys}

::: spec-paragraph specification-paragraph-7
It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) and `keys` ([`SigningKeys`](keys.md#symbol-SigningKeys)) from dependency injection. It sets `provider` and `session` separately, each to [`crypto.generateRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.generateRsa). It calls [`keys.configure`](keys.md#symbol-SigningKeys.configure) with `provider` and `session`. [source](keys.md#source-L36-L38)
:::

::: details Checked interface

```text
initializeKeys(resolve Crypto crypto, resolve SigningKeys keys) returns void unless CryptoError and KeyError uses Crypto.generateRsa, SigningKeys.configure
```

It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) and `keys` ([`SigningKeys`](keys.md#symbol-SigningKeys)) from dependency injection. Failures can raise `CryptoError` and [`KeyError`](keys.md#symbol-KeyError).

:::

### Dependencies

It uses [`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto) ([`generateRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.generateRsa)) from `crypto`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
