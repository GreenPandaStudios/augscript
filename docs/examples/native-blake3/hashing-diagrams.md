---
title: "hashing.aug diagrams"
generated: true
source: "examples/native-blake3/hashing.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# hashing.aug diagrams

[Hashing with Rust BLAKE3](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](hashing.md)


::: details Call relationships

```mermaid
flowchart TD
    n0["hashText"]
    n1["hashing.aug"]
    n2["hash"]
    n0 -->|"calls"| n2
    n1 -->|"calls"| n0
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### hashText {#sequence-hashText}

::: spec-paragraph specification-paragraph-1
[Source](hashing.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as hashText
    participant p1 as value.bytes
    participant p2 as hash
    p0->>p1: value.bytes()
    p0->>p2: hash(input=value.bytes())
    p2-->>p0: string
    Note over p0: Return hash(input=value.bytes())； required cleanup runs before exit
    Note over p0: May leave with checked errors: HashError
```

## Called contracts

- [hashText](hashing-diagrams.md#sequence-hashText) — hashing.aug
- [hash](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.5/api-diagrams.md#sequence-hash) — package/@greenpandastudios/aug-blake3@0.1.5/api.aug
