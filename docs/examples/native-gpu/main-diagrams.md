---
title: "main.aug diagrams"
generated: true
source: "examples/native-gpu/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[GPU workers](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

```mermaid
flowchart TD
    n0["main.aug"]
    n1["GpuError"]
    n0 -->|"calls"| n1
```

::: details Call relationships

```mermaid
flowchart TD
    n0["calculate"]
    n1["main.aug"]
    n2["GpuError.explain"]
    n1 -->|"calls"| n0
    n1 -->|"calls"| n2
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
    participant p1 as calculate
    participant p2 as print
    participant p3 as error: GpuError
    participant p4 as exit
    opt Try body； stops on a checked failure
    rect rgb(245, 240, 241)
    Note over p0: Enter task scope
    p0-)p1: calculate(left=［1.0, 2.0, 3.0］, right=［4.0, 5.0, 6.0］) · start asynchronously
    Note over p0: Worker starts with an isolated heap and copied data
    p0-)p1: calculate(left=［10.0, 20.0］, right=［1.0, 2.0］) · start asynchronously
    Note over p0: Worker starts with an isolated heap and copied data
    Note over p0: Wait for first and second； failure cancels siblings and cleanup joins
    loop For each item in firstResult
    p0->>p2: print(input 1=value)
    end
    loop For each item in secondResult
    p0->>p2: print(input 1=value)
    end
    Note over p0: Join tasks and release scoped resources
    end
    end
    opt Catch GpuError
    p0->>p3: explain()
    p3-->>p0: string
    p0->>p2: print(value=error.explain())
    p0->>p4: exit(status=1)
    end
    opt Catch ConcurrencyError
    p0->>p2: print(value=”Worker capacity is exhausted”)
    end
```

## Called contracts

- [calculate](compute-diagrams.md#sequence-calculate) — compute.aug
- [GpuError.explain](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/contracts-diagrams.md#sequence-GpuError.explain) — package/@greenpandastudios/aug-gpu@0.1.1/contracts.aug
