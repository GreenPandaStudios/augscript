---
title: "main.aug diagrams"
generated: true
source: "examples/native-sqlite/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[A database with SQLite](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

No relationships at this level.

## API calls

```mermaid
flowchart TD
    n0["storedName · database.aug"]
    n1["main.aug"]
    n1 -->|"calls"| n0
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as storedName
    participant p2 as print
    opt Try body#59; stops on a checked failure
    p0->>p1: storedName()
    p0->>p2: print(value)
    end
    opt Catch SqliteError
    p0->>p2: print(value)
    end
```

## Called contracts

- [storedName](database-diagrams.md#sequence-storedName) — database.aug
