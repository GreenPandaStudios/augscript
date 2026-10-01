---
title: "packages/@git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/packages/@git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug`

[OpenID Connect login application](../../../../../index.md) · Dependency source and specification

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

### `StoreFull` · class · [source](store.md#code) {#symbol-StoreFull}

The bounded store could not accept another live entry. It implements `Error`.

### `ExpiringStore` · capability interface · [source](store.md#code) {#symbol-ExpiringStore}

A bounded, expiring capability for immutable values. Each generic DI binding has its own table. The type parameters are `T` which must satisfy `Data`.

#### `ExpiringStore.put` · [source](store.md#code) {#symbol-ExpiringStore.put}

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller. It takes `key` as a string, `value` as `T`, and `expires` and `now` as integers.

It can call [`ExpiringStore.put`](store.md#symbol-ExpiringStore.put). Failures can raise [`StoreFull`](store.md#symbol-StoreFull).

#### `ExpiringStore.take` · [source](store.md#code) {#symbol-ExpiringStore.take}

Atomically remove a value. Expired or absent entries return null. It takes `key` as a string and `now` as an integer.

It returns `optional T`. It can call [`ExpiringStore.take`](store.md#symbol-ExpiringStore.take).

#### `ExpiringStore.get` · [source](store.md#code) {#symbol-ExpiringStore.get}

Read a live value without consuming it. It takes `key` as a string and `now` as an integer. It returns `optional T`. It can call [`ExpiringStore.get`](store.md#symbol-ExpiringStore.get).

### `MemoryStore` · class · [source](store.md#code) {#symbol-MemoryStore}

A synchronized table with short critical sections and no I/O while locked. It implements [`ExpiringStore<T>`](store.md#symbol-ExpiringStore). The type parameters are `T` which must satisfy `Data`. The read-only, private field `_entries` has type `Shared<Map<string,_Entry<T>>>` and starts as a `Shared` with `value` from an empty map from `string` to [`_Entry<T>`](store.md#symbol-_Entry).

#### `MemoryStore.put` · [source](store.md#code) {#symbol-MemoryStore.put}

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller. It takes `key` as a string, `value` as `T`, and `expires` and `now` as integers. Failures can raise [`StoreFull`](store.md#symbol-StoreFull).

It sets `entry` to a [`_Entry`](store.md#symbol-_Entry) for `T` with `value` and `expires`. While holding the lock on `_entries` as mutable `entries`, for each `name` and `saved` in a snapshot of `entries`, if `saved.expires` is at most `now`, it removes the key `name` from `entries`. After the loop, it checks that the number of elements in `entries` is less than `512` or whether `entries` contains the key `key` returns true. It raises a [`StoreFull`](store.md#symbol-StoreFull) at the first failed check.

It stores `entry` in `entries` under `key`. Release this lock when the block exits, including on return or failure.

#### `MemoryStore.take` · [source](store.md#code) {#symbol-MemoryStore.take}

Atomically remove a value. Expired or absent entries return null. It takes `key` as a string and `now` as an integer.

While holding the lock on `_entries` as mutable `entries`, it obtains `entries.take` with `key`. If no value is found, it returns null. The non-null result becomes `saved`. It returns null if `saved.expires` is at most `now`, or `saved.value` otherwise.

Release this lock when the block exits, including on return or failure.

#### `MemoryStore.get` · [source](store.md#code) {#symbol-MemoryStore.get}

Read a live value without consuming it. It takes `key` as a string and `now` as an integer.

While holding the lock on `_entries` as mutable `entries`, it obtains the value under `key` in `entries`. If no value is found, it returns null. The non-null result becomes `saved`. It returns null if `saved.expires` is at most `now`, or `saved.value` otherwise.

Release this lock when the block exits, including on return or failure.

### `_Entry` · immutable record · [source](store.md#code) {#symbol-_Entry}

It is private to this file. The type parameters are `T` which must satisfy `Data`. It takes `value` as `T`, kept read-only and `expires` as an integer, kept read-only.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
