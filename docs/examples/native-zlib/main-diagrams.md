---
title: "main.aug diagrams"
generated: true
source: "examples/native-zlib/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Compression with zlib](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)


::: details Call relationships

```mermaid
flowchart TD
    n0["roundTrip"]
    n1["main.aug"]
    n1 -->|"calls"| n0
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as roundTrip
    participant p2 as roundTrip().text
    participant p3 as print
    opt Try body； stops on a checked failure
    p0->>p1: roundTrip()
    p1-->>p0: Bytes
    p0->>p2: roundTrip().text()
    p0->>p3: print(value=roundTrip().text())
    end
    opt Catch CompressionError
    p0->>p3: print(value=error.message)
    end
    opt Catch ConversionError
    p0->>p3: print(value=”Invalid UTF-8”)
    end
```

## Called contracts

- [roundTrip](compression-diagrams.md#sequence-roundTrip) — compression.aug
