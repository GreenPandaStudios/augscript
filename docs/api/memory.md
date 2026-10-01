---
generated: true
source: src/stdlib/memory
editLink: false
---

# august.memory

Install this source library with `aug add https://github.com/GreenPandaStudios/augscript/src/stdlib/memory --as memory`, then import its public names from `memory`.

The signatures below include checked results and failures, including those inferred from a body. See [packages](../packages.md) for revision pinning and [language constructs](../language-constructs.md) for built-in value types.

## StoreFull {#api-StoreFull}

```text
StoreFull() implements Error
```

The bounded store could not accept another live entry.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L3)

## ExpiringStore {#api-ExpiringStore}

```text
capability ExpiringStore<T implements Data>
```

A bounded, expiring capability for immutable values. Each generic DI binding has its own table.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L8)

### ExpiringStore.put

```text
put(string key, T value, int expires, int now) unless StoreFull
```

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller.

Requires `ExpiringStore.put`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L10)

### ExpiringStore.take

```text
take(string key, int now) returns optional T
```

Atomically remove a value. Expired or absent entries return null.

Requires `ExpiringStore.take`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L12)

### ExpiringStore.get

```text
get(string key, int now) returns optional T
```

Read a live value without consuming it.

Requires `ExpiringStore.get`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L14)

## MemoryStore {#api-MemoryStore}

```text
MemoryStore<T implements Data>() implements ExpiringStore<T>
```

A synchronized table with short critical sections and no I/O while locked.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L17)

### MemoryStore.put

```text
put(string key, T value, int expires, int now) unless StoreFull
```

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller.

Requires `ExpiringStore<T>.put`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L19)

### MemoryStore.take

```text
take(string key, int now) returns optional T
```

Atomically remove a value. Expired or absent entries return null.

Requires `ExpiringStore<T>.take`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L28)

### MemoryStore.get

```text
get(string key, int now) returns optional T
```

Read a live value without consuming it.

Requires `ExpiringStore<T>.get`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L37)
