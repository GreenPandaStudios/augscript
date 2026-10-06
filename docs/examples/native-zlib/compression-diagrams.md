---
title: "compression.aug diagrams"
generated: true
source: "examples/native-zlib/compression.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# compression.aug diagrams

[Compression with zlib](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](compression.md)


::: details Call relationships

```mermaid
flowchart TD
    n0["roundTrip"]
    n1["compression.aug"]
    n2["compress"]
    n3["decompress"]
    n0 -->|"calls"| n2
    n0 -->|"calls"| n3
    n1 -->|"calls"| n0
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### roundTrip {#sequence-roundTrip}

::: spec-paragraph specification-paragraph-1
[Source](compression.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as roundTrip
    participant p1 as ”The world runs on language”.bytes
    participant p2 as compress
    participant p3 as decompress
    p0->>p1: ”The world runs on language”.bytes()
    p0->>p2: compress(input=input)
    p2-->>p0: compressed: Bytes
    p0->>p3: decompress(input=compressed, maximumOutput=4096)
    p3-->>p0: Bytes
    Note over p0: Return decompress(input=compressed, maximumOutput=4096)； required cleanup runs before exit
    Note over p0: May leave with checked errors: CompressionError
```

## Called contracts

- [roundTrip](compression-diagrams.md#sequence-roundTrip) — compression.aug
- [compress](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api-diagrams.md#sequence-compress) — package/@greenpandastudios/aug-zlib@0.1.5/api.aug
- [decompress](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api-diagrams.md#sequence-decompress) — package/@greenpandastudios/aug-zlib@0.1.5/api.aug
