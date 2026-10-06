---
title: "Diagrams · Compression with zlib"
generated: true
source: "examples/native-zlib/compression.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Compression with zlib diagrams

[Compression with zlib](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](compression.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["roundTrip · compression.aug"]
    n1["compression.aug"]
    n2["compress · package/@greenpandastudios/aug-zlib@0.1.5/api.aug"]
    n3["decompress · package/@greenpandastudios/aug-zlib@0.1.5/api.aug"]
    n0 -->|"calls"| n2
    n0 -->|"calls"| n3
    n1 -->|"calls"| n0
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### roundTrip {#sequence-roundTrip}

::: spec-paragraph specification-paragraph-1
[Source](compression.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as roundTrip
    participant p1 as #34;The world runs on language#34;.bytes
    participant p2 as compress
    participant p3 as decompress
    p0->>p1: #34;The world runs on language#34;.bytes()
    p0->>p2: compress(input)
    p0->>p3: decompress(input, maximumOutput)
    Note over p0: Return decompress(input=compressed, maximumOutput=4096)#59; required cleanup runs before exit
    Note over p0: May leave with checked errors: CompressionError
```

### Called contracts

- [roundTrip](compression-diagrams.md#sequence-roundTrip) — compression.aug
- [compress](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api-diagrams.md#sequence-compress) — package/@greenpandastudios/aug-zlib@0.1.5/api.aug
- [decompress](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api-diagrams.md#sequence-decompress) — package/@greenpandastudios/aug-zlib@0.1.5/api.aug
