---
title: "main.aug diagrams"
generated: true
source: "examples/ownership-transfer/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Move ownership](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as resource
    participant p2 as August runtime
    p0->>p1: make()
    p1-->>p0: first: Resource
    Note over p0: Own first； release on scope exits
    p0->>p1: consume(value=first)
    p0->>p1: make()
    p1-->>p0: second: Resource
    Note over p0: Own second； release on scope exits
    p0->>p2: print(value=”end of main”)
```

## Called contracts

- [consume](resource-diagrams.md#sequence-consume) — resource.aug
- [make](resource-diagrams.md#sequence-make) — resource.aug
