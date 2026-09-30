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
import Crypto from august.crypto
KeyError() implements Error:
    pass
/** Keys are initialized explicitly in main and expose distinct provider and session roles. */
capability SigningKeys:
    configure(RsaPrivateKey provider, RsaPrivateKey session) uses SigningKeys.configure unless KeyError
    provider() returns RsaPrivateKey uses SigningKeys.provider unless KeyError
    session() returns RsaPrivateKey uses SigningKeys.session unless KeyError
MemorySigningKeys() implements SigningKeys:
    Shared<Map<string,RsaPrivateKey>> _keys = Shared(value=Map<string, RsaPrivateKey>())
    configure(RsaPrivateKey provider, RsaPrivateKey session) uses SigningKeys.configure unless KeyError:
        lock _keys as keys:
            if keys.length() != 0:
                throw KeyError()
            keys.set(key="provider", value=provider)
            keys.set(key="session", value=session)
    provider() returns RsaPrivateKey uses SigningKeys.provider unless KeyError:
        lock _keys as keys:
            match keys.get(key="provider"):
                when null:
                    throw KeyError()
                when some key:
                    return key
    session() returns RsaPrivateKey uses SigningKeys.session unless KeyError:
        lock _keys as keys:
            match keys.get(key="session"):
                when null:
                    throw KeyError()
                when some key:
                    return key
initializeKeys(resolve Crypto crypto, resolve SigningKeys keys) uses crypto.generateRsa and keys.configure unless CryptoError and KeyError:
    provider = crypto.generateRsa()
    session = crypto.generateRsa()
    keys.configure(provider, session)
```

```aug [Braces]
// aug-spec: "keys.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Crypto from august.crypto
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
    configure(RsaPrivateKey provider, RsaPrivateKey session) uses SigningKeys.configure unless KeyError {
        lock _keys as keys {
            if keys.length() != 0 {
                throw KeyError()
            }
            keys.set(key="provider", value=provider)
            keys.set(key="session", value=session)
        }
    }
    provider() returns RsaPrivateKey uses SigningKeys.provider unless KeyError {
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
    session() returns RsaPrivateKey uses SigningKeys.session unless KeyError {
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
initializeKeys(resolve Crypto crypto, resolve SigningKeys keys) uses crypto.generateRsa and keys.configure unless CryptoError and KeyError {
    provider = crypto.generateRsa()
    session = crypto.generateRsa()
    keys.configure(provider, session)
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-KeyError"></a>
### `KeyError` · class · [source](keys.md#code)

Implements `Error`.

<a id="symbol-SigningKeys"></a>
### `SigningKeys` · capability interface · [source](keys.md#code)

Keys are initialized explicitly in main and expose distinct provider and session roles.

<a id="symbol-SigningKeys.configure"></a>
#### `SigningKeys.configure` · [source](keys.md#code)

The caller supplies `provider` and `session` as `RsaPrivateKey`. It can use [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure). It can fail with `KeyError`.

<a id="symbol-SigningKeys.provider"></a>
#### `SigningKeys.provider` · [source](keys.md#code)

The result is `RsaPrivateKey`. It can use [`SigningKeys.provider`](keys.md#symbol-SigningKeys.provider). It can fail with `KeyError`.

<a id="symbol-SigningKeys.session"></a>
#### `SigningKeys.session` · [source](keys.md#code)

The result is `RsaPrivateKey`. It can use [`SigningKeys.session`](keys.md#symbol-SigningKeys.session). It can fail with `KeyError`.

<a id="symbol-MemorySigningKeys"></a>
### `MemorySigningKeys` · class · [source](keys.md#code)

Implements [`SigningKeys`](keys.md#symbol-SigningKeys). The read-only, private field `_keys` has type `Shared<Map<string,RsaPrivateKey>>` and starts as a new `Shared` (`value` set to an empty map from `string` to `RsaPrivateKey`).

<a id="symbol-MemorySigningKeys.configure"></a>
#### `MemorySigningKeys.configure` · [source](keys.md#code)

The caller supplies `provider` and `session` as `RsaPrivateKey`. It can use [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure). It can fail with `KeyError`. While holding the lock on `_keys` as mutable `keys`, it follows these steps. If the number of elements in `keys` does not equal `0`, it fails with a new [`KeyError`](keys.md#symbol-KeyError). It calls `set` on `keys` (`key` set to `"provider"` and `value` set to `provider`). It calls `set` on `keys` (`key` set to `"session"` and `value` set to `session`).

This ends the block.

Release this lock when the block exits, including on return or failure.

<a id="symbol-MemorySigningKeys.provider"></a>
#### `MemorySigningKeys.provider` · [source](keys.md#code)

The result is `RsaPrivateKey`. It can use [`SigningKeys.provider`](keys.md#symbol-SigningKeys.provider). It can fail with `KeyError`. While holding the lock on `_keys` as mutable `keys`, it follows these steps.

Select the first matching case for the value from `get` on `keys` (`key` set to `"provider"`). If the selected value is null, it fails with a new [`KeyError`](keys.md#symbol-KeyError). If the selected value is not null, it names it `key` and returns `key`.

This ends the block.

Release this lock when the block exits, including on return or failure.

<a id="symbol-MemorySigningKeys.session"></a>
#### `MemorySigningKeys.session` · [source](keys.md#code)

The result is `RsaPrivateKey`. It can use [`SigningKeys.session`](keys.md#symbol-SigningKeys.session). It can fail with `KeyError`. While holding the lock on `_keys` as mutable `keys`, it follows these steps.

Select the first matching case for the value from `get` on `keys` (`key` set to `"session"`). If the selected value is null, it fails with a new [`KeyError`](keys.md#symbol-KeyError). If the selected value is not null, it names it `key` and returns `key`.

This ends the block.

Release this lock when the block exits, including on return or failure.

<a id="symbol-initializeKeys"></a>
### `initializeKeys` · [source](keys.md#code)

Dependency injection supplies `crypto` as [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) and `keys` as [`SigningKeys`](keys.md#symbol-SigningKeys). It can use [`crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) and [`keys.configure`](keys.md#symbol-SigningKeys.configure). It can fail with `CryptoError` and `KeyError`. It sets `provider` to the value from [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`. It sets `session` to the value from [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`. It calls [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure) on `keys` (`provider` and `session`).

### Dependencies

The file uses [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`. [`generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) takes no caller inputs. It returns `RsaPrivateKey`. It can use [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa). It can fail with `CryptoError`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`Map<string, RsaPrivateKey>.get`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null. `Map<string, RsaPrivateKey>.length`: Read the number of elements. `Map<string, RsaPrivateKey>.set`: Insert or replace an entry with exclusive mutable access.

::::

:::::
