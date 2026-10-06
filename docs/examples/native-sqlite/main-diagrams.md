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


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as database
    participant p2 as August runtime
    opt Try body； stops on a checked failure
    p0->>p1: storedName()
    p1-->>p0: storedName result: string
    p0->>p2: print(value=storedName result)
    end
    opt Catch SqliteError
    p0->>p2: print(value=error.message)
    end
```

## Called contracts

- [storedName](database-diagrams.md#sequence-storedName) — database.aug
