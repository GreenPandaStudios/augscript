---
title: "package/@git/url\\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug diagrams"
generated: true
source: "examples/oidc-login/.aug-spec/packages/@git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug diagrams

[OpenID Connect login application](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](store.md)

## Class interactions

```mermaid
flowchart TD
    n0["ExpiringStore"]
    n1["MemoryStore"]
    n1 -->|"implements"| n0
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### StoreFull constructor {#sequence-StoreFull-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](store.md#source-L3)
:::

[Explanation](store.md).

### \_Entry constructor {#sequence-_Entry-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](store.md#source-L5)
:::

Receive fields: value, expires. [Explanation](store.md).

### ExpiringStore.put {#sequence-ExpiringStore.put}

::: spec-paragraph specification-paragraph-3
[Source](store.md#source-L10)
:::

May leave with checked errors: StoreFull. Interface contract; implementation selected at runtime. [Explanation](store.md).

### ExpiringStore.take {#sequence-ExpiringStore.take}

::: spec-paragraph specification-paragraph-4
[Source](store.md#source-L12)
:::

Interface contract; implementation selected at runtime. [Explanation](store.md).

### ExpiringStore.get {#sequence-ExpiringStore.get}

::: spec-paragraph specification-paragraph-5
[Source](store.md#source-L14)
:::

Interface contract; implementation selected at runtime. [Explanation](store.md).

### MemoryStore constructor {#sequence-MemoryStore-20-constructor}

::: spec-paragraph specification-paragraph-6
[Source](store.md#source-L17)
:::

```mermaid
sequenceDiagram
    participant p0 as MemoryStore constructor
    participant p1 as Shared
    p0->>p0: Map‹string, _Entry‹T››()
    p0-->>p0: Map result: Map‹string, _Entry‹T››
    p0->>p1: Shared(value=Map result)
    p1-->>p0: _entries: Shared‹Map‹string, _Entry‹T›››
```

### MemoryStore.put {#sequence-MemoryStore.put}

::: spec-paragraph specification-paragraph-7
[Source](store.md#source-L19)
:::

```mermaid
sequenceDiagram
    participant p0 as MemoryStore.put

    p0->>p0: _Entry‹T›(value=value, expires=expires) · construct<br/>value
    p0-->>p0: entry: _Entry‹T›
    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    loop For each item in entries
    alt saved.expires ‹= now
    p0->>p0: entries.take(key=name)
    p0-->>p0: take result: optional _Entry‹T›
    end
    end
    p0->>p0: entries.length()
    p0-->>p0: length result: int
    opt Left is true
    p0->>p0: entries.contains(key=key)
    p0-->>p0: contains result: bool
    end
    alt entries.length() ›= 512 and not entries.contains(key=key)
    p0->>p0: StoreFull() · construct value
    p0-->>p0: StoreFull result: StoreFull
    Note over p0: Raise checked failure StoreFull()； required cleanup runs<br/>before exit
    end
    p0->>p0: entries.set(key=key, value=entry)
    Note over p0: Leave lock scope
    end
    Note over p0: May leave with checked errors: StoreFull
```

### MemoryStore.take {#sequence-MemoryStore.take}

::: spec-paragraph specification-paragraph-8
[Source](store.md#source-L28)
:::

```mermaid
sequenceDiagram
    participant p0 as MemoryStore.take

    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    p0->>p0: entries.take(key=key)
    p0-->>p0: take result: optional _Entry‹T›
    alt Match when null:
    Note over p0: Return null； required cleanup runs before exit
    else Match when some saved:
    alt saved.expires ‹= now
    Note over p0: Return null； required cleanup runs before exit
    end
    Note over p0: Return saved.value； required cleanup runs before exit
    end
    Note over p0: Leave lock scope
    end
```

### MemoryStore.get {#sequence-MemoryStore.get}

::: spec-paragraph specification-paragraph-9
[Source](store.md#source-L37)
:::

```mermaid
sequenceDiagram
    participant p0 as MemoryStore.get

    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    p0->>p0: entries.get(key=key)
    p0-->>p0: get result: optional _Entry‹T›
    alt Match when null:
    Note over p0: Return null； required cleanup runs before exit
    else Match when some saved:
    alt saved.expires ‹= now
    Note over p0: Return null； required cleanup runs before exit
    end
    Note over p0: Return saved.value； required cleanup runs before exit
    end
    Note over p0: Leave lock scope
    end
```

## Called contracts

- [ExpiringStore](store-diagrams.md) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [StoreFull](store-diagrams.md#sequence-StoreFull-20-constructor) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [\_Entry](store-diagrams.md#sequence-_Entry-20-constructor) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
