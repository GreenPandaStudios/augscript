---
title: "Diagrams · Hashing with Rust BLAKE3"
generated: true
source: "examples/native-blake3/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Hashing with Rust BLAKE3 diagrams

[Hashing with Rust BLAKE3](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["hashText · hashing.aug"]
    n1["main.aug"]
    n1 -->|"calls"| n0
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as hashText
    participant p2 as print
    opt Try body#59; stops on a checked failure
    p0->>p1: hashText(value)
    p0->>p2: print(value)
    end
    opt Catch HashError
    p0->>p2: print(value)
    end
```

### Called contracts

- [hashText](hashing-diagrams.md#sequence-hashText) — hashing.aug
