---
generated: true
source: src/stdlib/memory
editLink: false
---

# august.memory

Public declarations exported by this module. Import names explicitly from `august.memory`. Built-in wire/value types are described in [language constructs](../language-constructs.md).

- [StoreFull](#api-StoreFull)
- [ExpiringStore](#api-ExpiringStore)
- [MemoryStore](#api-MemoryStore)

## StoreFull {#api-StoreFull}

```text
StoreFull() implements Error
```

The bounded store could not accept another live entry.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L2)

## ExpiringStore {#api-ExpiringStore}

```text
capability ExpiringStore<T implements Data>
```

A bounded, expiring capability for immutable values. Each generic DI binding has its own table.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L7)

### ExpiringStore.put

```text
put(string key, T value, int expires, int now) uses ExpiringStore.put unless StoreFull
```

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L9)

### ExpiringStore.take

```text
take(string key, int now) returns T? uses ExpiringStore.take
```

Atomically remove a value. Expired or absent entries return null.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L11)

### ExpiringStore.get

```text
get(string key, int now) returns T? uses ExpiringStore.get
```

Read a live value without consuming it.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L13)

## MemoryStore {#api-MemoryStore}

```text
MemoryStore<T implements Data>() implements ExpiringStore<T>
```

A synchronized table with short critical sections and no I/O while locked.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L16)

### MemoryStore.put

```text
put(string key, T value, int expires, int now) unless StoreFull
```

Remove expired entries, then store at most 512 live entries. Time is supplied by the caller.

Inferred capabilities: `ExpiringStore<T>.put`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L18)

### MemoryStore.take

```text
take(string key, int now) returns T?
```

Atomically remove a value. Expired or absent entries return null.

Inferred capabilities: `ExpiringStore<T>.take`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L27)

### MemoryStore.get

```text
get(string key, int now) returns T?
```

Read a live value without consuming it.

Inferred capabilities: `ExpiringStore<T>.get`.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/memory/store.aug#L36)
