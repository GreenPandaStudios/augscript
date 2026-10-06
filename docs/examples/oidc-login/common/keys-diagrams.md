---
title: "common/keys.aug diagrams"
generated: true
source: "examples/oidc-login/common/keys.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# common/keys.aug diagrams

[OpenID Connect login application](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](keys.md)

## Class interactions

```mermaid
flowchart TD
    n0["KeyError"]
    n1["MemorySigningKeys"]
    n2["SigningKeys"]
    n3["initializeKeys"]
    n4["Crypto"]
    n1 -->|"implements"| n2
    n3 -->|"calls"| n2
    n3 -->|"depends on"| n2
    n3 -->|"calls"| n4
    n3 -->|"depends on"| n4
```

::: details Call relationships

```mermaid
flowchart TD
    n0["KeyError"]
    n1["MemorySigningKeys.configure"]
    n2["MemorySigningKeys.provider"]
    n3["MemorySigningKeys.session"]
    n4["SigningKeys.configure"]
    n5["initializeKeys"]
    n6["Crypto.generateRsa"]
    n1 -->|"calls"| n0
    n2 -->|"calls"| n0
    n3 -->|"calls"| n0
    n5 -->|"calls"| n4
    n5 -->|"calls"| n6
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### KeyError constructor {#sequence-KeyError-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](keys.md#source-L4)
:::

[Explanation](keys.md).

### SigningKeys.configure {#sequence-SigningKeys.configure}

::: spec-paragraph specification-paragraph-2
[Source](keys.md#source-L8)
:::

May leave with checked errors: KeyError. Interface contract; implementation selected at runtime. [Explanation](keys.md).

### SigningKeys.provider {#sequence-SigningKeys.provider}

::: spec-paragraph specification-paragraph-3
[Source](keys.md#source-L9)
:::

May leave with checked errors: KeyError. Interface contract; implementation selected at runtime. [Explanation](keys.md).

### SigningKeys.session {#sequence-SigningKeys.session}

::: spec-paragraph specification-paragraph-4
[Source](keys.md#source-L10)
:::

May leave with checked errors: KeyError. Interface contract; implementation selected at runtime. [Explanation](keys.md).

### MemorySigningKeys constructor {#sequence-MemorySigningKeys-20-constructor}

::: spec-paragraph specification-paragraph-5
[Source](keys.md#source-L12)
:::

```mermaid
sequenceDiagram
    participant p0 as MemorySigningKeys constructor
    participant p1 as Map
    participant p2 as Shared
    p0->>p1: Map()
    p0->>p2: Shared(value=Map‹string, RsaPrivateKey›())
    Note over p0: Set _keys to Shared(value=Map‹string, RsaPrivateKey›())
```

### MemorySigningKeys.configure {#sequence-MemorySigningKeys.configure}

::: spec-paragraph specification-paragraph-6
[Source](keys.md#source-L14)
:::

```mermaid
sequenceDiagram
    participant p0 as MemorySigningKeys.configure
    participant p1 as keys.length
    participant p2 as KeyError
    participant p3 as keys.set
    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    p0->>p1: keys.length()
    alt keys.length() != 0
    p0->>p2: KeyError()
    p2-->>p0: KeyError
    Note over p0: Raise checked failure KeyError()； required cleanup runs before exit
    end
    p0->>p3: keys.set(key=”provider”, value=provider)
    p0->>p3: keys.set(key=”session”, value=session)
    Note over p0: Leave lock scope
    end
    Note over p0: May leave with checked errors: KeyError
```

### MemorySigningKeys.provider {#sequence-MemorySigningKeys.provider}

::: spec-paragraph specification-paragraph-7
[Source](keys.md#source-L20)
:::

```mermaid
sequenceDiagram
    participant p0 as MemorySigningKeys.provider
    participant p1 as keys.get
    participant p2 as KeyError
    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    p0->>p1: keys.get(key=”provider”)
    alt Match when null:
    p0->>p2: KeyError()
    p2-->>p0: KeyError
    Note over p0: Raise checked failure KeyError()； required cleanup runs before exit
    else Match when some key:
    Note over p0: Return key； required cleanup runs before exit
    end
    Note over p0: Leave lock scope
    end
    Note over p0: May leave with checked errors: KeyError
```

### MemorySigningKeys.session {#sequence-MemorySigningKeys.session}

::: spec-paragraph specification-paragraph-8
[Source](keys.md#source-L27)
:::

```mermaid
sequenceDiagram
    participant p0 as MemorySigningKeys.session
    participant p1 as keys.get
    participant p2 as KeyError
    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    p0->>p1: keys.get(key=”session”)
    alt Match when null:
    p0->>p2: KeyError()
    p2-->>p0: KeyError
    Note over p0: Raise checked failure KeyError()； required cleanup runs before exit
    else Match when some key:
    Note over p0: Return key； required cleanup runs before exit
    end
    Note over p0: Leave lock scope
    end
    Note over p0: May leave with checked errors: KeyError
```

### initializeKeys {#sequence-initializeKeys}

::: spec-paragraph specification-paragraph-9
[Source](keys.md#source-L35)
:::

```mermaid
sequenceDiagram
    participant p0 as initializeKeys
    participant p1 as crypto: Crypto
    participant p2 as keys: SigningKeys
    p0->>p1: generateRsa() · interface dispatch
    p1-->>p0: provider: RsaPrivateKey
    p0->>p1: generateRsa() · interface dispatch
    p1-->>p0: session: RsaPrivateKey
    p0->>p2: configure(provider=provider, session=session) · interface dispatch
    Note over p0: May leave with checked errors: CryptoError, KeyError
```

## Called contracts

- [KeyError](keys-diagrams.md#sequence-KeyError-20-constructor) — common/keys.aug
- [SigningKeys](keys-diagrams.md) — common/keys.aug
- [SigningKeys.configure](keys-diagrams.md#sequence-SigningKeys.configure) — common/keys.aug
- [Crypto](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.generateRsa](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.generateRsa) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
