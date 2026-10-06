---
title: "main.aug diagrams"
generated: true
source: "examples/errors/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Checked failures](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as errors
    participant p2 as August runtime
    opt Try body； stops on a checked failure
    p0->>p1: load(fail=true)
    p1-->>p0: load result: string
    p0->>p2: print(value=load result)
    end
    opt Catch FileError
    p0->>p2: print(value=”caught FileError”)
    end
```

## Called contracts

- [load](errors-diagrams.md#sequence-load) — errors.aug
