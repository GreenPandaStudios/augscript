---
title: "Diagrams · Use a package"
generated: true
source: "examples/packages/app/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Use a package diagrams

[Use a package](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["main.aug"]
    n1["add · package/@example/aug-math@0.1.0/arithmetic.aug"]
    n0 -->|"calls"| n1
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as add
    participant p2 as print
    p0->>p1: add(left, right)
    p0->>p2: print(value)
```

### Called contracts

- [add](dependencies/packages/%40example/aug-math/0.1.0/arithmetic-diagrams.md#sequence-add) — package/@example/aug-math@0.1.0/arithmetic.aug
