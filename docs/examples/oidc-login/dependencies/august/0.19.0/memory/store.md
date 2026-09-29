---
title: "august/0.19.0/memory/store.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/august/0.19.0/memory/store.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
---

# `august/0.19.0/memory/store.aug`

[OpenID Connect login application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

## Code {#code}

::: code-group

```aug [Indentation]
/** The bounded store could not accept another live entry. */
StoreFull() implements Error:
    pass
record _Entry<T implements Data>(T value, int expires)
/** A bounded, expiring capability for immutable values. Each generic DI binding has its own table. */
capability ExpiringStore<T implements Data>:
    /** Remove expired entries, then store at most 512 live entries. Time is supplied by the caller. */
    put(string key, T value, int expires, int now) uses ExpiringStore.put unless StoreFull
    /** Atomically remove a value. Expired or absent entries return null. */
    take(string key, int now) returns optional T uses ExpiringStore.take
    /** Read a live value without consuming it. */
    get(string key, int now) returns optional T uses ExpiringStore.get
/** A synchronized table with short critical sections and no I/O while locked. */
MemoryStore<T implements Data>() implements ExpiringStore<T>:
    Shared<Map<string,_Entry<T>>> _entries = Shared(value=Map<string, _Entry<T>>())
    put(string key, T value, int expires, int now) unless StoreFull:
        entry = _Entry<T>(value=value, expires=expires)
        lock _entries as entries:
            for (name, saved) in entries:
                if saved.expires <= now:
                    entries.take(key=name)
            if entries.length() >= 512 and (not entries.contains(key=key)):
                throw StoreFull()
            entries.set(key=key, value=entry)
    take(string key, int now) returns optional T:
        lock _entries as entries:
            match entries.take(key=key):
                when null:
                    return null
                when some saved:
                    if saved.expires <= now:
                        return null
                    return saved.value
    get(string key, int now) returns optional T:
        lock _entries as entries:
            match entries.get(key=key):
                when null:
                    return null
                when some saved:
                    if saved.expires <= now:
                        return null
                    return saved.value
```

```aug [Braces]
/** The bounded store could not accept another live entry. */
StoreFull() implements Error {
    pass
}
record _Entry<T implements Data>(T value, int expires)
/** A bounded, expiring capability for immutable values. Each generic DI binding has its own table. */
capability ExpiringStore<T implements Data> {
    /** Remove expired entries, then store at most 512 live entries. Time is supplied by the caller. */
    put(string key, T value, int expires, int now) uses ExpiringStore.put unless StoreFull
    /** Atomically remove a value. Expired or absent entries return null. */
    take(string key, int now) returns optional T uses ExpiringStore.take
    /** Read a live value without consuming it. */
    get(string key, int now) returns optional T uses ExpiringStore.get
}
/** A synchronized table with short critical sections and no I/O while locked. */
MemoryStore<T implements Data>() implements ExpiringStore<T> {
    Shared<Map<string,_Entry<T>>> _entries = Shared(value=Map<string, _Entry<T>>())
    put(string key, T value, int expires, int now) unless StoreFull {
        entry = _Entry<T>(value=value, expires=expires)
        lock _entries as entries {
            for (name, saved) in entries {
                if saved.expires <= now {
                    entries.take(key=name)
                }
            }
            if entries.length() >= 512 and (not entries.contains(key=key)) {
                throw StoreFull()
            }
            entries.set(key=key, value=entry)
        }
    }
    take(string key, int now) returns optional T {
        lock _entries as entries {
            match entries.take(key=key) {
                when null {
                    return null
                }
                when some saved {
                    if saved.expires <= now {
                        return null
                    }
                    return saved.value
                }
            }
        }
    }
    get(string key, int now) returns optional T {
        lock _entries as entries {
            match entries.get(key=key) {
                when null {
                    return null
                }
                when some saved {
                    if saved.expires <= now {
                        return null
                    }
                    return saved.value
                }
            }
        }
    }
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Built-in operations used by this file

#### `Map<string, _Entry<T>>.contains`

Check for a key, including entries whose value is null.

Inputs: `key`: `string`.

Result: `bool`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<string, _Entry<T>>.get`

Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.

Inputs: `key`: `string`.

Result: `optional _Entry<T>`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<string, _Entry<T>>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<string, _Entry<T>>.set`

Insert or replace an entry with exclusive mutable access.

Inputs: `key`: `string`; `value`: `_Entry<T>`.

Result: `void`.

Changes the receiver under exclusive mutable access.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<string, _Entry<T>>.take`

Remove and return an entry under exclusive access. An absent key returns null.

Inputs: `key`: `string`.

Result: `optional _Entry<T>`.

Changes the receiver under exclusive mutable access.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `StoreFull` {#symbol-StoreFull}

[source](store.md#code)

Behavioral class.

Satisfies `Error`.

**Author documentation**

The bounded store could not accept another live entry.

### `ExpiringStore` {#symbol-ExpiringStore}

[source](store.md#code)

Capability interface.

Type parameters: `T` must satisfy `Data`.

**Author documentation**

A bounded, expiring capability for immutable values. Each generic DI binding has its own table.

#### `ExpiringStore.put` {#symbol-ExpiringStore.put}

[source](store.md#code)

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`ExpiringStore.put`](store.md#symbol-ExpiringStore.put).

Possible failures: `StoreFull`. The caller must catch or propagate them.

**Author documentation**

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller.

Interface contract. A selected implementation supplies the behavior.

#### `ExpiringStore.take` {#symbol-ExpiringStore.take}

[source](store.md#code)

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `optional T`.

Capabilities: [`ExpiringStore.take`](store.md#symbol-ExpiringStore.take).

**Author documentation**

Atomically remove a value. Expired or absent entries return null.

Interface contract. A selected implementation supplies the behavior.

#### `ExpiringStore.get` {#symbol-ExpiringStore.get}

[source](store.md#code)

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `optional T`.

Capabilities: [`ExpiringStore.get`](store.md#symbol-ExpiringStore.get).

**Author documentation**

Read a live value without consuming it.

Interface contract. A selected implementation supplies the behavior.

### `MemoryStore` {#symbol-MemoryStore}

[source](store.md#code)

Behavioral class.

Type parameters: `T` must satisfy `Data`.

Satisfies [`ExpiringStore`](store.md#symbol-ExpiringStore).

**Author documentation**

A synchronized table with short critical sections and no I/O while locked.

**Field initialization**

- Initialize `_entries` of type `Shared<Map<string,_Entry<T>>>` to the result of call `Shared` with `value` set to the result of call `Map` with type arguments `string`, [`_Entry<T>`](store.md#symbol-_Entry). Read-only storage, private to this class.

#### `MemoryStore.put` {#symbol-MemoryStore.put}

[source](store.md#code)

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`ExpiringStore<T>.put`](store.md#symbol-ExpiringStore.put).

Possible failures: `StoreFull`. The caller must catch or propagate them.

**Author documentation**

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller.

**Behavior when execution reaches this operation**

- Set `entry` to the result of call [`_Entry`](store.md#symbol-_Entry) with type arguments `T` with `value` set to `value`; `expires` set to `expires`.
- Lock `_entries`, expose its mutable value as `entries`, and release the lock on every exit:
  - For each `name` and `saved` in a snapshot of `entries`, in iteration order:
    - If (`expires` of `saved` is at most `now`) is true:
      - Call `take` on `entries` with `key` set to `name`.
  - If ((the result of call `length` on `entries` is at least `512`) and not (the result of call `contains` on `entries` with `key` set to `key`)) is true:
    - Fail with the result of call [`StoreFull`](store.md#symbol-StoreFull). Transfer control to a matching catch or propagate the failure.
  - Call `set` on `entries` with `key` set to `key`; `value` set to `entry`.

#### `MemoryStore.take` {#symbol-MemoryStore.take}

[source](store.md#code)

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `optional T`.

Capabilities: [`ExpiringStore<T>.take`](store.md#symbol-ExpiringStore.take).

**Author documentation**

Atomically remove a value. Expired or absent entries return null.

**Behavior when execution reaches this operation**

- Lock `_entries`, expose its mutable value as `entries`, and release the lock on every exit:
  - Select the matching case for the result of call `take` on `entries` with `key` set to `key`:
    - A null value, including omitted optional input:
      - Return null and finish this operation.
    - A present, non-null value, named `saved`:
      - If (`expires` of `saved` is at most `now`) is true:
        - Return null and finish this operation.
      - Return `value` of `saved` and finish this operation.

#### `MemoryStore.get` {#symbol-MemoryStore.get}

[source](store.md#code)

**Inputs and dependencies**

- `key`: `string`. The caller supplies this labeled input. Read reference values without copying them.
- `now`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `optional T`.

Capabilities: [`ExpiringStore<T>.get`](store.md#symbol-ExpiringStore.get).

**Author documentation**

Read a live value without consuming it.

**Behavior when execution reaches this operation**

- Lock `_entries`, expose its mutable value as `entries`, and release the lock on every exit:
  - Select the matching case for the result of call `get` on `entries` with `key` set to `key`:
    - A null value, including omitted optional input:
      - Return null and finish this operation.
    - A present, non-null value, named `saved`:
      - If (`expires` of `saved` is at most `now`) is true:
        - Return null and finish this operation.
      - Return `value` of `saved` and finish this operation.

### `_Entry` {#symbol-_Entry}

[source](store.md#code)

Immutable record, private to this file.

Type parameters: `T` must satisfy `Data`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them. Store it as `value`. The field is read-only after initialization.
- `expires`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `expires`. The field is read-only after initialization.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
