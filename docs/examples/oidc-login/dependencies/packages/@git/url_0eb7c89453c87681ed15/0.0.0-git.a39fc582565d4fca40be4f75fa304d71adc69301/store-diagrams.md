---
title: "Diagrams · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/packages/@git/url_0eb7c89453c87681ed15/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# OpenID Connect login application diagrams

[OpenID Connect login application](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](store.md)

### Class interactions

```mermaid
flowchart TD
    n0["ExpiringStore · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n1["MemoryStore · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n2["StoreFull · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n3["_Entry · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n1 -->|"implements"| n0
    n1 -->|"calls"| n2
    n1 -->|"calls"| n3
```

### API calls

```mermaid
flowchart TD
    n0["ExpiringStore.get · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n1["ExpiringStore.put · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n2["ExpiringStore.take · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n3["MemoryStore.get · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n4["MemoryStore.put · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n5["MemoryStore.take · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n6["StoreFull · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n7["_Entry · package/@git/url_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug"]
    n4 -->|"calls"| n6
    n4 -->|"calls"| n7
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### StoreFull constructor {#sequence-StoreFull-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](store.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as StoreFull constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### \_Entry constructor {#sequence-_Entry-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](store.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as _Entry constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### ExpiringStore.put {#sequence-ExpiringStore.put}

::: spec-paragraph specification-paragraph-3
[Source](store.md#source-L10)
:::

```mermaid
sequenceDiagram
    participant p0 as ExpiringStore.put

    Note over p0: May leave with checked errors: StoreFull
    Note over p0: Interface contract#59; implementation selected at runtime
```

#### ExpiringStore.take {#sequence-ExpiringStore.take}

::: spec-paragraph specification-paragraph-4
[Source](store.md#source-L12)
:::

```mermaid
sequenceDiagram
    participant p0 as ExpiringStore.take

    Note over p0: Interface contract#59; implementation selected at runtime
```

#### ExpiringStore.get {#sequence-ExpiringStore.get}

::: spec-paragraph specification-paragraph-5
[Source](store.md#source-L14)
:::

```mermaid
sequenceDiagram
    participant p0 as ExpiringStore.get

    Note over p0: Interface contract#59; implementation selected at runtime
```

#### MemoryStore constructor {#sequence-MemoryStore-20-constructor}

::: spec-paragraph specification-paragraph-6
[Source](store.md#source-L17)
:::

```mermaid
sequenceDiagram
    participant p0 as MemoryStore constructor
    participant p1 as Map
    participant p2 as Shared
    p0->>p1: Map()
    p0->>p2: Shared(value)
```

#### MemoryStore.put {#sequence-MemoryStore.put}

::: spec-paragraph specification-paragraph-7
[Source](store.md#source-L19)
:::

```mermaid
sequenceDiagram
    participant p0 as MemoryStore.put
    participant p1 as _Entry
    participant p2 as entries.take
    participant p3 as entries.length
    participant p4 as entries.contains
    participant p5 as StoreFull
    participant p6 as entries.set
    p0->>p1: _Entry(value, expires)
    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    loop For each item in entries
    alt saved.expires #60;= now
    p0->>p2: entries.take(key)
    end
    end
    p0->>p3: entries.length()
    opt Left is true
    p0->>p4: entries.contains(key)
    end
    alt entries.length() #62;= 512 and not entries.contains(key=key)
    p0->>p5: StoreFull()
    Note over p0: Raise checked failure StoreFull()#59; required cleanup runs before exit
    end
    p0->>p6: entries.set(key, value)
    Note over p0: Leave lock scope
    end
    Note over p0: May leave with checked errors: StoreFull
```

#### MemoryStore.take {#sequence-MemoryStore.take}

::: spec-paragraph specification-paragraph-8
[Source](store.md#source-L28)
:::

```mermaid
sequenceDiagram
    participant p0 as MemoryStore.take
    participant p1 as entries.take
    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    p0->>p1: entries.take(key)
    alt Match when null:
    Note over p0: Return null#59; required cleanup runs before exit
    else Match when some saved:
    alt saved.expires #60;= now
    Note over p0: Return null#59; required cleanup runs before exit
    end
    Note over p0: Return saved.value#59; required cleanup runs before exit
    end
    Note over p0: Leave lock scope
    end
```

#### MemoryStore.get {#sequence-MemoryStore.get}

::: spec-paragraph specification-paragraph-9
[Source](store.md#source-L37)
:::

```mermaid
sequenceDiagram
    participant p0 as MemoryStore.get
    participant p1 as entries.get
    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    p0->>p1: entries.get(key)
    alt Match when null:
    Note over p0: Return null#59; required cleanup runs before exit
    else Match when some saved:
    alt saved.expires #60;= now
    Note over p0: Return null#59; required cleanup runs before exit
    end
    Note over p0: Return saved.value#59; required cleanup runs before exit
    end
    Note over p0: Leave lock scope
    end
```

### Called contracts

- [ExpiringStore](store-diagrams.md) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [StoreFull](store-diagrams.md#sequence-StoreFull-20-constructor) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
- [\_Entry](store-diagrams.md#sequence-_Entry-20-constructor) — package/@git/url\_0eb7c89453c87681ed15@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/store.aug
