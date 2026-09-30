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
// aug-spec: "store.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "store.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

A bounded, expiring capability for immutable values. Each generic DI binding has its own table. The type parameters are `T` which must satisfy `Data`.

<a id="symbol-ExpiringStore.put"></a>
#### `ExpiringStore.put` · [source](store.md#code)

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller. The caller supplies `key` as `string`, `value` as `T`, and `expires` and `now` as `int`. It can use [`ExpiringStore.put`](store.md#symbol-ExpiringStore.put). It can fail with `StoreFull`.

<a id="symbol-ExpiringStore.take"></a>
#### `ExpiringStore.take` · [source](store.md#code)

Atomically remove a value. Expired or absent entries return null. The caller supplies `key` as `string` and `now` as `int`. The result is `optional T`. It can use [`ExpiringStore.take`](store.md#symbol-ExpiringStore.take).

<a id="symbol-ExpiringStore.get"></a>
#### `ExpiringStore.get` · [source](store.md#code)

Read a live value without consuming it. The caller supplies `key` as `string` and `now` as `int`. The result is `optional T`. It can use [`ExpiringStore.get`](store.md#symbol-ExpiringStore.get).

<a id="symbol-MemoryStore"></a>
### `MemoryStore` · class · [source](store.md#code)

A synchronized table with short critical sections and no I/O while locked. Implements [`ExpiringStore<T>`](store.md#symbol-ExpiringStore). The type parameters are `T` which must satisfy `Data`. The read-only, private field `_entries` has type `Shared<Map<string,_Entry<T>>>` and starts as a new `Shared` (`value` set to an empty map from `string` to [`_Entry<T>`](store.md#symbol-_Entry)).

<a id="symbol-MemoryStore.put"></a>
#### `MemoryStore.put` · [source](store.md#code)

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller. The caller supplies `key` as `string`, `value` as `T`, and `expires` and `now` as `int`. It can use [`ExpiringStore<T>.put`](store.md#symbol-ExpiringStore.put). It can fail with `StoreFull`. It sets `entry` to a new [`_Entry`](store.md#symbol-_Entry) with type arguments `T` (`value` and `expires`).

While holding the lock on `_entries` as mutable `entries`, it follows these steps.

For each `name` and `saved` in a snapshot of `entries`, it follows these steps. If `saved.expires` is at most `now`, it calls `take` on `entries` (`key` set to `name`).

Repeat these steps for each remaining item in the snapshot. If the number of elements in `entries` is at least `512` and not (the value from `contains` on `entries` (`key`)), it fails with a new [`StoreFull`](store.md#symbol-StoreFull). It calls `set` on `entries` (`key` and `value` set to `entry`).

This ends the block.

Release this lock when the block exits, including on return or failure.

<a id="symbol-MemoryStore.take"></a>
#### `MemoryStore.take` · [source](store.md#code)

Atomically remove a value. Expired or absent entries return null. The caller supplies `key` as `string` and `now` as `int`. The result is `optional T`. It can use [`ExpiringStore<T>.take`](store.md#symbol-ExpiringStore.take). While holding the lock on `_entries` as mutable `entries`, it follows these steps.

Select the first matching case for the value from `take` on `entries` (`key`). If the selected value is null, it returns null.

If the selected value is not null, it names it `saved` and follows these steps. If `saved.expires` is at most `now`, it returns null. Otherwise, it returns `saved.value`.

This ends the block.

Release this lock when the block exits, including on return or failure.

<a id="symbol-MemoryStore.get"></a>
#### `MemoryStore.get` · [source](store.md#code)

Read a live value without consuming it. The caller supplies `key` as `string` and `now` as `int`. The result is `optional T`. It can use [`ExpiringStore<T>.get`](store.md#symbol-ExpiringStore.get). While holding the lock on `_entries` as mutable `entries`, it follows these steps.

Select the first matching case for the value from `get` on `entries` (`key`). If the selected value is null, it returns null.

If the selected value is not null, it names it `saved` and follows these steps. If `saved.expires` is at most `now`, it returns null. Otherwise, it returns `saved.value`.

This ends the block.

Release this lock when the block exits, including on return or failure.

<a id="symbol-_Entry"></a>
### `_Entry` · immutable record · [source](store.md#code)

Private to this file. The type parameters are `T` which must satisfy `Data`. The caller supplies `value` as `T`, stored read-only and `expires` as `int`, stored read-only.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`Map<string, _Entry<T>>.contains`: Check for a key, including entries whose value is null. `Map<string, _Entry<T>>.get`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null. `Map<string, _Entry<T>>.length`: Read the number of elements. `Map<string, _Entry<T>>.set`: Insert or replace an entry with exclusive mutable access. `Map<string, _Entry<T>>.take`: Remove and return an entry under exclusive access. An absent key returns null.

::::

:::::
