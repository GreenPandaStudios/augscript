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

```aug [Indentation]
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

```aug [Braces]
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

### `KeyError` · class · [source](keys.md#code) {#symbol-KeyError}

It implements `Error`.

### `SigningKeys` · capability interface · [source](keys.md#code) {#symbol-SigningKeys}

Keys are initialized explicitly in main and expose distinct provider and session roles.

#### `SigningKeys.configure` · [source](keys.md#code) {#symbol-SigningKeys.configure}

It takes `provider` and `session` as `RsaPrivateKey`. It can call [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure). Failures can raise [`KeyError`](keys.md#symbol-KeyError).

#### `SigningKeys.provider` · [source](keys.md#code) {#symbol-SigningKeys.provider}

It returns `RsaPrivateKey`. It can call [`SigningKeys.provider`](keys.md#symbol-SigningKeys.provider). Failures can raise [`KeyError`](keys.md#symbol-KeyError).

#### `SigningKeys.session` · [source](keys.md#code) {#symbol-SigningKeys.session}

It returns `RsaPrivateKey`. It can call [`SigningKeys.session`](keys.md#symbol-SigningKeys.session). Failures can raise [`KeyError`](keys.md#symbol-KeyError).

### `MemorySigningKeys` · class · [source](keys.md#code) {#symbol-MemorySigningKeys}

It implements [`SigningKeys`](keys.md#symbol-SigningKeys). The read-only, private field `_keys` has type `Shared<Map<string,RsaPrivateKey>>` and starts as a `Shared` with `value` from an empty map from `string` to `RsaPrivateKey`.

#### `MemorySigningKeys.configure` · [source](keys.md#code) {#symbol-MemorySigningKeys.configure}

It takes `provider` and `session` as `RsaPrivateKey`.

While holding the lock on `_keys` as mutable `keys`, it checks that the number of elements in `keys` equals `0`. It raises a [`KeyError`](keys.md#symbol-KeyError) at the first failed check. It stores `provider` in `keys` under `"provider"`. It stores `session` in `keys` under `"session"`. [source](keys.md#code)

Release this lock when the block exits, including on return or failure. [source](keys.md#code)

::: details Checked interface

```text
configure(RsaPrivateKey provider, RsaPrivateKey session) returns void unless KeyError uses SigningKeys.configure
```

It takes `provider` and `session` as `RsaPrivateKey`. Failures can raise [`KeyError`](keys.md#symbol-KeyError).

:::

#### `MemorySigningKeys.provider` · [source](keys.md#code) {#symbol-MemorySigningKeys.provider}

While holding the lock on `_keys` as mutable `keys`, it obtains the value under `"provider"` in `keys`. If no value is found, it raises a [`KeyError`](keys.md#symbol-KeyError). The non-null result becomes `key`. It returns `key`. [source](keys.md#code)

Release this lock when the block exits, including on return or failure. [source](keys.md#code)

::: details Checked interface

```text
provider() returns RsaPrivateKey unless KeyError uses SigningKeys.provider
```

Failures can raise [`KeyError`](keys.md#symbol-KeyError).

:::

#### `MemorySigningKeys.session` · [source](keys.md#code) {#symbol-MemorySigningKeys.session}

While holding the lock on `_keys` as mutable `keys`, it obtains the value under `"session"` in `keys`. If no value is found, it raises a [`KeyError`](keys.md#symbol-KeyError). The non-null result becomes `key`. It returns `key`. [source](keys.md#code)

Release this lock when the block exits, including on return or failure. [source](keys.md#code)

::: details Checked interface

```text
session() returns RsaPrivateKey unless KeyError uses SigningKeys.session
```

Failures can raise [`KeyError`](keys.md#symbol-KeyError).

:::

### `initializeKeys` · [source](keys.md#code) {#symbol-initializeKeys}

It gets `crypto` ([`Crypto`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto)) and `keys` ([`SigningKeys`](keys.md#symbol-SigningKeys)) from dependency injection. It sets `provider` and `session` separately, each to [`crypto.generateRsa`](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.md#symbol-Crypto.generateRsa). It calls [`keys.configure`](keys.md#symbol-SigningKeys.configure) with `provider` and `session`. [source](keys.md#code)

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
