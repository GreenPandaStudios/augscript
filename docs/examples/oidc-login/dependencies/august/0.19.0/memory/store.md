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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`StoreFull`](store.md#symbol-StoreFull) is a class implementing `Error`.
- [`_Entry`](store.md#symbol-_Entry) is an immutable record.
- [`ExpiringStore`](store.md#symbol-ExpiringStore) is a capability interface.
- [`MemoryStore`](store.md#symbol-MemoryStore) is a class implementing `ExpiringStore<T>`.

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

**Inputs**

- `key` (`string`) — required labeled input.
- `value` (`T`) — required labeled input.
- `expires` (`int`) — required labeled input.
- `now` (`int`) — required labeled input.

Returns: no value.

Capabilities: [`ExpiringStore.put`](store.md#symbol-ExpiringStore.put).

Can fail with `StoreFull`. Callers must catch or propagate these errors.

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller.

#### `ExpiringStore.take` {#symbol-ExpiringStore.take}

[source](store.md#code)

**Inputs**

- `key` (`string`) — required labeled input.
- `now` (`int`) — required labeled input.

Returns: `optional T`.

Capabilities: [`ExpiringStore.take`](store.md#symbol-ExpiringStore.take).

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Atomically remove a value. Expired or absent entries return null.

#### `ExpiringStore.get` {#symbol-ExpiringStore.get}

[source](store.md#code)

**Inputs**

- `key` (`string`) — required labeled input.
- `now` (`int`) — required labeled input.

Returns: `optional T`.

Capabilities: [`ExpiringStore.get`](store.md#symbol-ExpiringStore.get).

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Read a live value without consuming it.

### `MemoryStore` {#symbol-MemoryStore}

[source](store.md#code)

Behavioral class.

Type parameters: `T` must satisfy `Data`.

Satisfies [`ExpiringStore`](store.md#symbol-ExpiringStore).

**Author documentation**

A synchronized table with short critical sections and no I/O while locked.

**Field initialization**

- Initialize `_entries` of type `Shared<Map<string,_Entry<T>>>` to call `Shared` with `value` = an empty map from `string` to [`_Entry<T>`](store.md#symbol-_Entry). Read-only storage, private to this class.

#### `MemoryStore.put` {#symbol-MemoryStore.put}

[source](store.md#code)

**Inputs**

- `key` (`string`) — required labeled input.
- `value` (`T`) — required labeled input.
- `expires` (`int`) — required labeled input.
- `now` (`int`) — required labeled input.

Returns: no value.

Capabilities: [`ExpiringStore<T>.put`](store.md#symbol-ExpiringStore.put).

Can fail with `StoreFull`. Callers must catch or propagate these errors.

**What it does**

- Set `entry` to call [`_Entry`](store.md#symbol-_Entry) with type arguments `T` with `value` = `value`; `expires` = `expires`.
- Lock `_entries`, expose its mutable value as `entries`, and release the lock on every exit:
  - For each `name` and `saved` in a snapshot of `entries`, in iteration order:
    - If `expires` of `saved` is at most `now`:
      - Call `take` on `entries` with `key` = `name`.
  - If (call `length` on `entries` is at least `512`) and not (call `contains` on `entries` with `key` = `key`):
    - Fail with call [`StoreFull`](store.md#symbol-StoreFull). Transfer control to a matching catch or propagate the failure.
  - Call `set` on `entries` with `key` = `key`; `value` = `entry`.

**Author documentation**

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller.

#### `MemoryStore.take` {#symbol-MemoryStore.take}

[source](store.md#code)

**Inputs**

- `key` (`string`) — required labeled input.
- `now` (`int`) — required labeled input.

Returns: `optional T`.

Capabilities: [`ExpiringStore<T>.take`](store.md#symbol-ExpiringStore.take).

**What it does**

- Lock `_entries`, expose its mutable value as `entries`, and release the lock on every exit:
  - Select the matching case for call `take` on `entries` with `key` = `key`:
    - A null value, including omitted optional input:
      - Return null.
    - A present, non-null value, named `saved`:
      - If `expires` of `saved` is at most `now`:
        - Return null.
      - Return `value` of `saved`.

**Author documentation**

Atomically remove a value. Expired or absent entries return null.

#### `MemoryStore.get` {#symbol-MemoryStore.get}

[source](store.md#code)

**Inputs**

- `key` (`string`) — required labeled input.
- `now` (`int`) — required labeled input.

Returns: `optional T`.

Capabilities: [`ExpiringStore<T>.get`](store.md#symbol-ExpiringStore.get).

**What it does**

- Lock `_entries`, expose its mutable value as `entries`, and release the lock on every exit:
  - Select the matching case for call `get` on `entries` with `key` = `key`:
    - A null value, including omitted optional input:
      - Return null.
    - A present, non-null value, named `saved`:
      - If `expires` of `saved` is at most `now`:
        - Return null.
      - Return `value` of `saved`.

**Author documentation**

Read a live value without consuming it.

### `_Entry` {#symbol-_Entry}

[source](store.md#code)

Immutable record, private to this file.

Type parameters: `T` must satisfy `Data`.

**Inputs**

- `value` (`T`) — required labeled input — stored as `value` and read-only after initialization.
- `expires` (`int`) — required labeled input — stored as `expires` and read-only after initialization.

### Built-in operations used by this file

- `Map<string, _Entry<T>>.contains` (`key`: `string`) → `bool`: Check for a key, including entries whose value is null.
- `Map<string, _Entry<T>>.get` (`key`: `string`) → `optional _Entry<T>`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.
- `Map<string, _Entry<T>>.length` (no inputs) → `int`: Read the number of elements.
- `Map<string, _Entry<T>>.set` (`key`: `string`, `value`: `_Entry<T>`) → `void`: Insert or replace an entry with exclusive mutable access. Changes the receiver.
- `Map<string, _Entry<T>>.take` (`key`: `string`) → `optional _Entry<T>`: Remove and return an entry under exclusive access. An absent key returns null. Changes the receiver.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
