---
title: "package/@greenpandastudios/aug-zlib@0.2.0/api.aug diagrams"
generated: true
source: "examples/native-zlib/.aug-spec/packages/@greenpandastudios/aug-zlib/0.2.0/api.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@greenpandastudios/aug-zlib@0.2.0/api.aug diagrams

[Compression with zlib](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](api.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_compress {#sequence-_compress}

::: spec-paragraph specification-paragraph-1
[Source](api.md#source-L4)
:::

May leave with checked errors: CompressionError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_decompress {#sequence-_decompress}

::: spec-paragraph specification-paragraph-2
[Source](api.md#source-L5)
:::

May leave with checked errors: CompressionError. Native implementation; only the declared contract is known. [Explanation](api.md).

### compress {#sequence-compress}

::: spec-paragraph specification-paragraph-3
[Source](api.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as compress

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _compress(input=input) · native boundary
    p0-->>p0: _compress result: Bytes
    Note over p0: Return _compress(input)； required cleanup runs before<br/>exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: CompressionError
```

### decompress {#sequence-decompress}

::: spec-paragraph specification-paragraph-4
[Source](api.md#source-L11)
:::

```mermaid
sequenceDiagram
    participant p0 as decompress

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _decompress(input=input, maximumOutput=maximumOutput) ·<br/>native boundary
    p0-->>p0: _decompress result: Bytes
    Note over p0: Return _decompress(input, maximumOutput)； required<br/>cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: CompressionError
```

## Called contracts

- [\_compress](api-diagrams.md#sequence-_compress) — package/@greenpandastudios/aug-zlib@0.2.0/api.aug
- [\_decompress](api-diagrams.md#sequence-_decompress) — package/@greenpandastudios/aug-zlib@0.2.0/api.aug
