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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`KeyError`](keys.md#symbol-KeyError) is a class implementing `Error`.
- [`SigningKeys`](keys.md#symbol-SigningKeys) is a capability interface.
- [`MemorySigningKeys`](keys.md#symbol-MemorySigningKeys) is a class implementing `SigningKeys`.
- [`initializeKeys`](keys.md#symbol-initializeKeys) is a function.

### `KeyError` {#symbol-KeyError}

[source](keys.md#code)

Behavioral class.

Satisfies `Error`.

### `SigningKeys` {#symbol-SigningKeys}

[source](keys.md#code)

Capability interface.

**Author documentation**

Keys are initialized explicitly in main and expose distinct provider and session roles.

#### `SigningKeys.configure` {#symbol-SigningKeys.configure}

[source](keys.md#code)

**Inputs**

- `provider` (`RsaPrivateKey`) — required labeled input.
- `session` (`RsaPrivateKey`) — required labeled input.

Returns: no value.

Capabilities: [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure).

Can fail with `KeyError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

#### `SigningKeys.provider` {#symbol-SigningKeys.provider}

[source](keys.md#code)

Returns: `RsaPrivateKey`.

Capabilities: [`SigningKeys.provider`](keys.md#symbol-SigningKeys.provider).

Can fail with `KeyError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

#### `SigningKeys.session` {#symbol-SigningKeys.session}

[source](keys.md#code)

Returns: `RsaPrivateKey`.

Capabilities: [`SigningKeys.session`](keys.md#symbol-SigningKeys.session).

Can fail with `KeyError`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

### `MemorySigningKeys` {#symbol-MemorySigningKeys}

[source](keys.md#code)

Behavioral class.

Satisfies [`SigningKeys`](keys.md#symbol-SigningKeys).

**Field initialization**

- Initialize `_keys` of type `Shared<Map<string,RsaPrivateKey>>` to call `Shared` with `value` = an empty map from `string` to `RsaPrivateKey`. Read-only storage, private to this class.

#### `MemorySigningKeys.configure` {#symbol-MemorySigningKeys.configure}

[source](keys.md#code)

**Inputs**

- `provider` (`RsaPrivateKey`) — required labeled input.
- `session` (`RsaPrivateKey`) — required labeled input.

Returns: no value.

Capabilities: [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure).

Can fail with `KeyError`. Callers must catch or propagate these errors.

**What it does**

- Lock `_keys`, expose its mutable value as `keys`, and release the lock on every exit:
  - If call `length` on `keys` does not equal `0`:
    - Fail with call [`KeyError`](keys.md#symbol-KeyError). Transfer control to a matching catch or propagate the failure.
  - Call `set` on `keys` with `key` = `"provider"`; `value` = `provider`.
  - Call `set` on `keys` with `key` = `"session"`; `value` = `session`.

#### `MemorySigningKeys.provider` {#symbol-MemorySigningKeys.provider}

[source](keys.md#code)

Returns: `RsaPrivateKey`.

Capabilities: [`SigningKeys.provider`](keys.md#symbol-SigningKeys.provider).

Can fail with `KeyError`. Callers must catch or propagate these errors.

**What it does**

- Lock `_keys`, expose its mutable value as `keys`, and release the lock on every exit:
  - Select the matching case for call `get` on `keys` with `key` = `"provider"`:
    - A null value, including omitted optional input:
      - Fail with call [`KeyError`](keys.md#symbol-KeyError). Transfer control to a matching catch or propagate the failure.
    - A present, non-null value, named `key`:
      - Return `key`.

#### `MemorySigningKeys.session` {#symbol-MemorySigningKeys.session}

[source](keys.md#code)

Returns: `RsaPrivateKey`.

Capabilities: [`SigningKeys.session`](keys.md#symbol-SigningKeys.session).

Can fail with `KeyError`. Callers must catch or propagate these errors.

**What it does**

- Lock `_keys`, expose its mutable value as `keys`, and release the lock on every exit:
  - Select the matching case for call `get` on `keys` with `key` = `"session"`:
    - A null value, including omitted optional input:
      - Fail with call [`KeyError`](keys.md#symbol-KeyError). Transfer control to a matching catch or propagate the failure.
    - A present, non-null value, named `key`:
      - Return `key`.

### `initializeKeys` {#symbol-initializeKeys}

[source](keys.md#code)

**Inputs**

- `crypto` ([`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)) — injected; callers omit it.
- `keys` ([`SigningKeys`](keys.md#symbol-SigningKeys)) — injected; callers omit it.

Returns: no value.

Capabilities: [`crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa), [`keys.configure`](keys.md#symbol-SigningKeys.configure).

Can fail with `CryptoError`, `KeyError`. Callers must catch or propagate these errors.

**What it does**

- Set `provider` to call [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`.
- Set `session` to call [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`.
- Call [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure) on `keys` with `provider` = `provider`; `session` = `session`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Capability interface from `august.crypto`.

- [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) (no caller inputs) → `RsaPrivateKey`; can fail with `CryptoError`.

### Built-in operations used by this file

- `Map<string, RsaPrivateKey>.get` (`key`: `string`) → `optional RsaPrivateKey`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.
- `Map<string, RsaPrivateKey>.length` (no inputs) → `int`: Read the number of elements.
- `Map<string, RsaPrivateKey>.set` (`key`: `string`, `value`: `RsaPrivateKey`) → `void`: Insert or replace an entry with exclusive mutable access. Changes the receiver.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
