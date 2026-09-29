---
title: "august/0.19.0/memory/store.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/august/0.19.0/memory/store.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `august/0.19.0/memory/store.aug`

[OpenID Connect login application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-StoreFull"></a>
### `StoreFull` · class · [source](store.md#code)

The bounded store could not accept another live entry. Implements `Error`.

<a id="symbol-ExpiringStore"></a>
### `ExpiringStore` · capability interface · [source](store.md#code)

A bounded, expiring capability for immutable values. Each generic DI binding has its own table. Type parameters: `T` must satisfy `Data`.

<a id="symbol-ExpiringStore.put"></a>
#### `ExpiringStore.put` · [source](store.md#code)

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller.

**Inputs:** Take `key` (`string`). Take `value` (`T`). Take `expires` (`int`). Take `now` (`int`).

Uses [`ExpiringStore.put`](store.md#symbol-ExpiringStore.put). Can fail with `StoreFull`.

<a id="symbol-ExpiringStore.take"></a>
#### `ExpiringStore.take` · [source](store.md#code)

Atomically remove a value. Expired or absent entries return null.

**Inputs:** Take `key` (`string`). Take `now` (`int`).

Returns `optional T`. Uses [`ExpiringStore.take`](store.md#symbol-ExpiringStore.take).

<a id="symbol-ExpiringStore.get"></a>
#### `ExpiringStore.get` · [source](store.md#code)

Read a live value without consuming it.

**Inputs:** Take `key` (`string`). Take `now` (`int`).

Returns `optional T`. Uses [`ExpiringStore.get`](store.md#symbol-ExpiringStore.get).

<a id="symbol-MemoryStore"></a>
### `MemoryStore` · class · [source](store.md#code)

A synchronized table with short critical sections and no I/O while locked. Implements [`ExpiringStore`](store.md#symbol-ExpiringStore). Type parameters: `T` must satisfy `Data`.

Initialize fields:

- `_entries` (`Shared<Map<string,_Entry<T>>>`) = a new `Shared` with `value` as an empty map from `string` to [`_Entry<T>`](store.md#symbol-_Entry); read-only, private.

<a id="symbol-MemoryStore.put"></a>
#### `MemoryStore.put` · [source](store.md#code)

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller.

**Inputs:** Take `key` (`string`). Take `value` (`T`). Take `expires` (`int`). Take `now` (`int`).

Uses [`ExpiringStore<T>.put`](store.md#symbol-ExpiringStore.put). Can fail with `StoreFull`.

- Set `entry` to a new [`_Entry`](store.md#symbol-_Entry) with type arguments `T` with `value`, `expires`.
- Lock `_entries` as mutable `entries` for this block:
  - For each `name` and `saved` in a snapshot of `entries`:
    - If `expires` of `saved` is at most `now`:
      - Call `take` on `entries` with `key` as `name`.
  - If (the result of `length` on `entries` is at least `512`) and not (the result of `contains` on `entries` with `key`):
    - Fail with a new [`StoreFull`](store.md#symbol-StoreFull).
  - Call `set` on `entries` with `key`, `value` as `entry`.

<a id="symbol-MemoryStore.take"></a>
#### `MemoryStore.take` · [source](store.md#code)

Atomically remove a value. Expired or absent entries return null.

**Inputs:** Take `key` (`string`). Take `now` (`int`).

Returns `optional T`. Uses [`ExpiringStore<T>.take`](store.md#symbol-ExpiringStore.take).

- Lock `_entries` as mutable `entries` for this block:
  - Match the result of `take` on `entries` with `key`:
    - A null value, including omitted optional input:
      - Return null.
    - A present, non-null value, named `saved`:
      - If `expires` of `saved` is at most `now`:
        - Return null.
      - Return `value` of `saved`.

<a id="symbol-MemoryStore.get"></a>
#### `MemoryStore.get` · [source](store.md#code)

Read a live value without consuming it.

**Inputs:** Take `key` (`string`). Take `now` (`int`).

Returns `optional T`. Uses [`ExpiringStore<T>.get`](store.md#symbol-ExpiringStore.get).

- Lock `_entries` as mutable `entries` for this block:
  - Match the result of `get` on `entries` with `key`:
    - A null value, including omitted optional input:
      - Return null.
    - A present, non-null value, named `saved`:
      - If `expires` of `saved` is at most `now`:
        - Return null.
      - Return `value` of `saved`.

<a id="symbol-_Entry"></a>
### `_Entry` · immutable record · [source](store.md#code)

Private to this file. Type parameters: `T` must satisfy `Data`.

**Inputs:** Take `value` (`T`); store read-only. Take `expires` (`int`); store read-only.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Map<string, _Entry<T>>.contains`: Check for a key, including entries whose value is null.
- `Map<string, _Entry<T>>.get`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.
- `Map<string, _Entry<T>>.length`: Read the number of elements.
- `Map<string, _Entry<T>>.set`: Insert or replace an entry with exclusive mutable access.
- `Map<string, _Entry<T>>.take`: Remove and return an entry under exclusive access. An absent key returns null.

::::

:::::
