---
title: "common/keys.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/common/keys.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto)

Available from `august.crypto`.

Interface. Follow the linked specification for its full explanation.

**[`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa)**

Result: `RsaPrivateKey`.

Capabilities: [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa).

Possible failures: `CryptoError`. The caller must catch or propagate them.

### Built-in operations used by this file

#### `Map<string, RsaPrivateKey>.get`

Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.

Inputs: `key`: `string`.

Result: `optional RsaPrivateKey`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<string, RsaPrivateKey>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<string, RsaPrivateKey>.set`

Insert or replace an entry with exclusive mutable access.

Inputs: `key`: `string`; `value`: `RsaPrivateKey`.

Result: `void`.

Changes the receiver under exclusive mutable access.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

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

**Inputs and dependencies**

- `provider`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.
- `session`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure).

Possible failures: `KeyError`. The caller must catch or propagate them.

Interface contract. A selected implementation supplies the behavior.

#### `SigningKeys.provider` {#symbol-SigningKeys.provider}

[source](keys.md#code)

Result: `RsaPrivateKey`.

Capabilities: [`SigningKeys.provider`](keys.md#symbol-SigningKeys.provider).

Possible failures: `KeyError`. The caller must catch or propagate them.

Interface contract. A selected implementation supplies the behavior.

#### `SigningKeys.session` {#symbol-SigningKeys.session}

[source](keys.md#code)

Result: `RsaPrivateKey`.

Capabilities: [`SigningKeys.session`](keys.md#symbol-SigningKeys.session).

Possible failures: `KeyError`. The caller must catch or propagate them.

Interface contract. A selected implementation supplies the behavior.

### `MemorySigningKeys` {#symbol-MemorySigningKeys}

[source](keys.md#code)

Behavioral class.

Satisfies [`SigningKeys`](keys.md#symbol-SigningKeys).

**Field initialization**

- Initialize `_keys` of type `Shared<Map<string,RsaPrivateKey>>` to the result of call `Shared` with `value` set to the result of call `Map` with type arguments `string`, `RsaPrivateKey`. Read-only storage, private to this class.

#### `MemorySigningKeys.configure` {#symbol-MemorySigningKeys.configure}

[source](keys.md#code)

**Inputs and dependencies**

- `provider`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.
- `session`: `RsaPrivateKey`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure).

Possible failures: `KeyError`. The caller must catch or propagate them.

**Behavior when execution reaches this operation**

- Lock `_keys`, expose its mutable value as `keys`, and release the lock on every exit:
  - If (the result of call `length` on `keys` does not equal `0`) is true:
    - Fail with the result of call [`KeyError`](keys.md#symbol-KeyError). Transfer control to a matching catch or propagate the failure.
  - Call `set` on `keys` with `key` set to `"provider"`; `value` set to `provider`.
  - Call `set` on `keys` with `key` set to `"session"`; `value` set to `session`.

#### `MemorySigningKeys.provider` {#symbol-MemorySigningKeys.provider}

[source](keys.md#code)

Result: `RsaPrivateKey`.

Capabilities: [`SigningKeys.provider`](keys.md#symbol-SigningKeys.provider).

Possible failures: `KeyError`. The caller must catch or propagate them.

**Behavior when execution reaches this operation**

- Lock `_keys`, expose its mutable value as `keys`, and release the lock on every exit:
  - Select the matching case for the result of call `get` on `keys` with `key` set to `"provider"`:
    - A null value, including omitted optional input:
      - Fail with the result of call [`KeyError`](keys.md#symbol-KeyError). Transfer control to a matching catch or propagate the failure.
    - A present, non-null value, named `key`:
      - Return `key` and finish this operation.

#### `MemorySigningKeys.session` {#symbol-MemorySigningKeys.session}

[source](keys.md#code)

Result: `RsaPrivateKey`.

Capabilities: [`SigningKeys.session`](keys.md#symbol-SigningKeys.session).

Possible failures: `KeyError`. The caller must catch or propagate them.

**Behavior when execution reaches this operation**

- Lock `_keys`, expose its mutable value as `keys`, and release the lock on every exit:
  - Select the matching case for the result of call `get` on `keys` with `key` set to `"session"`:
    - A null value, including omitted optional input:
      - Fail with the result of call [`KeyError`](keys.md#symbol-KeyError). Transfer control to a matching catch or propagate the failure.
    - A present, non-null value, named `key`:
      - Return `key` and finish this operation.

### `initializeKeys` {#symbol-initializeKeys}

[source](keys.md#code)

**Inputs and dependencies**

- `crypto`: [`Crypto`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `keys`: [`SigningKeys`](keys.md#symbol-SigningKeys). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa), [`keys.configure`](keys.md#symbol-SigningKeys.configure).

Possible failures: `CryptoError`, `KeyError`. The caller must catch or propagate them.

**Behavior when execution reaches this operation**

- Set `provider` to the result of call [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`.
- Set `session` to the result of call [`Crypto.generateRsa`](../dependencies/august/0.19.0/crypto/contracts.md#symbol-Crypto.generateRsa) on `crypto`.
- Call [`SigningKeys.configure`](keys.md#symbol-SigningKeys.configure) on `keys` with `provider` set to `provider`; `session` set to `session`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
