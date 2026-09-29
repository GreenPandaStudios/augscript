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

**Inputs:** Take `provider` (`RsaPrivateKey`). Take `session` (`RsaPrivateKey`).

Uses [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure). Can fail with `KeyError`.

<a id="symbol-SigningKeys.provider"></a>
#### `SigningKeys.provider` · [source](keys.md#code)

Returns `RsaPrivateKey`. Uses [`SigningKeys.provider`](keys.md#symbol-SigningKeys.provider). Can fail with `KeyError`.

<a id="symbol-SigningKeys.session"></a>
#### `SigningKeys.session` · [source](keys.md#code)

Returns `RsaPrivateKey`. Uses [`SigningKeys.session`](keys.md#symbol-SigningKeys.session). Can fail with `KeyError`.

<a id="symbol-MemorySigningKeys"></a>
### `MemorySigningKeys` · class · [source](keys.md#code)

Implements [`SigningKeys`](keys.md#symbol-SigningKeys).

Initialize fields:

- `_keys` (`Shared<Map<string,RsaPrivateKey>>`) = a new `Shared` with `value` as an empty map from `string` to `RsaPrivateKey`; read-only, private.

<a id="symbol-MemorySigningKeys.configure"></a>
#### `MemorySigningKeys.configure` · [source](keys.md#code)

**Inputs:** Take `provider` (`RsaPrivateKey`). Take `session` (`RsaPrivateKey`).

Uses [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure). Can fail with `KeyError`.

- Lock `_keys` as mutable `keys` for this block:
  - If the result of `length` on `keys` does not equal `0`:
    - Fail with a new [`KeyError`](keys.md#symbol-KeyError).
  - Call `set` on `keys` with `key` as `"provider"`, `value` as `provider`.
  - Call `set` on `keys` with `key` as `"session"`, `value` as `session`.

<a id="symbol-MemorySigningKeys.provider"></a>
#### `MemorySigningKeys.provider` · [source](keys.md#code)

Returns `RsaPrivateKey`. Uses [`SigningKeys.provider`](keys.md#symbol-SigningKeys.provider). Can fail with `KeyError`.

- Lock `_keys` as mutable `keys` for this block:
  - Match the result of `get` on `keys` with `key` as `"provider"`:
    - A null value, including omitted optional input:
      - Fail with a new [`KeyError`](keys.md#symbol-KeyError).
    - A present, non-null value, named `key`:
      - Return `key`.

<a id="symbol-MemorySigningKeys.session"></a>
#### `MemorySigningKeys.session` · [source](keys.md#code)

Returns `RsaPrivateKey`. Uses [`SigningKeys.session`](keys.md#symbol-SigningKeys.session). Can fail with `KeyError`.

- Lock `_keys` as mutable `keys` for this block:
  - Match the result of `get` on `keys` with `key` as `"session"`:
    - A null value, including omitted optional input:
      - Fail with a new [`KeyError`](keys.md#symbol-KeyError).
    - A present, non-null value, named `key`:
      - Return `key`.

<a id="symbol-initializeKeys"></a>
### `initializeKeys` · [source](keys.md#code)

**Inputs:** Resolve [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) as `crypto`. Resolve [`SigningKeys`](keys.md#symbol-SigningKeys) as `keys`.

Uses [`crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa), [`keys.configure`](keys.md#symbol-SigningKeys.configure). Can fail with `CryptoError`, `KeyError`.

- Set `provider` to the result of [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`.
- Set `session` to the result of [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`.
- Call [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure) on `keys` with `provider`, `session`.

### Dependencies

- [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto) from `august.crypto`: [`generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) (no caller inputs) → `RsaPrivateKey`; can fail with `CryptoError`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Map<string, RsaPrivateKey>.get`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.
- `Map<string, RsaPrivateKey>.length`: Read the number of elements.
- `Map<string, RsaPrivateKey>.set`: Insert or replace an entry with exclusive mutable access.

::::

:::::
