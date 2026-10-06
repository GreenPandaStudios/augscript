---
title: "package/@greenpandastudios/aug-zlib@0.1.5/api.aug diagrams"
generated: true
source: "examples/native-zlib/.aug-spec/packages/@greenpandastudios/aug-zlib/0.1.5/api.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@greenpandastudios/aug-zlib@0.1.5/api.aug diagrams

[Compression with zlib](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](api.md)

## Class interactions

No relationships at this level.

## API calls

```mermaid
flowchart TD
    n0["_compress · package/@greenpandastudios/aug-zlib@0.1.5/api.aug"]
    n1["_decompress · package/@greenpandastudios/aug-zlib@0.1.5/api.aug"]
    n2["compress · package/@greenpandastudios/aug-zlib@0.1.5/api.aug"]
    n3["decompress · package/@greenpandastudios/aug-zlib@0.1.5/api.aug"]
    n2 -->|"calls"| n0
    n3 -->|"calls"| n1
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_compress {#sequence-_compress}

::: spec-paragraph specification-paragraph-1
[Source](api.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as _compress

    Note over p0: May leave with checked errors: CompressionError
    Note over p0: Native implementation#59; only the declared contract is known
```

### \_decompress {#sequence-_decompress}

::: spec-paragraph specification-paragraph-2
[Source](api.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as _decompress

    Note over p0: May leave with checked errors: CompressionError
    Note over p0: Native implementation#59; only the declared contract is known
```

### compress {#sequence-compress}

::: spec-paragraph specification-paragraph-3
[Source](api.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as compress
    participant p1 as _compress
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _compress(input) · native boundary
    Note over p0: Return _compress(input)#59; required cleanup runs before exit
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
    participant p1 as _decompress
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _decompress(input, maximumOutput) · native boundary
    Note over p0: Return _decompress(input, maximumOutput)#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: CompressionError
```

## Called contracts

- [\_compress](api-diagrams.md#sequence-_compress) — package/@greenpandastudios/aug-zlib@0.1.5/api.aug
- [\_decompress](api-diagrams.md#sequence-_decompress) — package/@greenpandastudios/aug-zlib@0.1.5/api.aug
