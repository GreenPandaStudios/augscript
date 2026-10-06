---
title: "Diagrams · Hashing with Rust BLAKE3"
generated: true
source: "examples/native-blake3/.aug-spec/packages/@greenpandastudios/aug-blake3/0.1.5/api.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Hashing with Rust BLAKE3 diagrams

[Hashing with Rust BLAKE3](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](api.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["_hash · package/@greenpandastudios/aug-blake3@0.1.5/api.aug"]
    n1["hash · package/@greenpandastudios/aug-blake3@0.1.5/api.aug"]
    n1 -->|"calls"| n0
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### \_hash {#sequence-_hash}

::: spec-paragraph specification-paragraph-1
[Source](api.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as _hash

    Note over p0: May leave with checked errors: HashError
    Note over p0: Native implementation#59; only the declared contract is known
```

#### hash {#sequence-hash}

::: spec-paragraph specification-paragraph-2
[Source](api.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as hash
    participant p1 as _hash
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _hash(input) · native boundary
    Note over p0: Return _hash(input)#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: HashError
```

### Called contracts

- [\_hash](api-diagrams.md#sequence-_hash) — package/@greenpandastudios/aug-blake3@0.1.5/api.aug
