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
    n0["MemorySigningKeys"]
    n1["SigningKeys"]
    n2["initializeKeys"]
    n3["Crypto"]
    n0 -->|"implements"| n1
    n2 -->|"calls configure； depends on"| n1
    n2 -->|"calls generateRsa； depends on"| n3
```

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
    participant p1 as Shared
    p0->>p0: Map‹string, RsaPrivateKey›()
    p0-->>p0: Map result: Map‹string, RsaPrivateKey›
    p0->>p1: Shared(value=Map result)
    p1-->>p0: _keys: Shared‹Map‹string, RsaPrivateKey››
```

### MemorySigningKeys.configure {#sequence-MemorySigningKeys.configure}

::: spec-paragraph specification-paragraph-6
[Source](keys.md#source-L14)
:::

```mermaid
sequenceDiagram
    participant p0 as MemorySigningKeys.configure

    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    p0->>p0: keys.length()
    p0-->>p0: length result: int
    alt keys.length() != 0
    p0->>p0: KeyError() · construct value
    p0-->>p0: KeyError result: KeyError
    Note over p0: Raise checked failure KeyError()； required cleanup runs<br/>before exit
    end
    p0->>p0: keys.set(key=”provider”, value=provider)
    p0->>p0: keys.set(key=”session”, value=session)
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

    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    p0->>p0: keys.get(key=”provider”)
    p0-->>p0: get result: optional RsaPrivateKey
    alt Match when null:
    p0->>p0: KeyError() · construct value
    p0-->>p0: KeyError result: KeyError
    Note over p0: Raise checked failure KeyError()； required cleanup runs<br/>before exit
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

    rect rgb(245, 240, 241)
    Note over p0: Enter lock scope
    p0->>p0: keys.get(key=”session”)
    p0-->>p0: get result: optional RsaPrivateKey
    alt Match when null:
    p0->>p0: KeyError() · construct value
    p0-->>p0: KeyError result: KeyError
    Note over p0: Raise checked failure KeyError()； required cleanup runs<br/>before exit
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
    p0->>p2: configure(provider=provider, session=session) ·<br/>interface dispatch
    Note over p0: May leave with checked errors: CryptoError, KeyError
```

## Called contracts

- [KeyError](keys-diagrams.md#sequence-KeyError-20-constructor) — common/keys.aug
- [SigningKeys](keys-diagrams.md) — common/keys.aug
- [SigningKeys.configure](keys-diagrams.md#sequence-SigningKeys.configure) — common/keys.aug
- [Crypto](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
- [Crypto.generateRsa](../dependencies/packages/%40git/url_9ef654c66d34ab8f5527/0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts-diagrams.md#sequence-Crypto.generateRsa) — package/@git/url\_9ef654c66d34ab8f5527@0.0.0-git.b14a0f9aa41f1ce58bd51133bcdc424033e40d40/contracts.aug
