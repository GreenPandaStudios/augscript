---
title: "errors.aug diagrams"
generated: true
source: "examples/errors/errors.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# errors.aug diagrams

[Checked failures](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](errors.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### load {#sequence-load}

::: spec-paragraph specification-paragraph-1
[Source](errors.md#source-L2)
:::

```mermaid
sequenceDiagram
    participant p0 as load

    alt fail
    p0->>p0: FileError()
    p0-->>p0: FileError result: FileError
    Note over p0: Raise checked failure FileError()； required cleanup runs<br/>before exit
    end
    Note over p0: Return ”loaded”； required cleanup runs before exit
    Note over p0: May leave with checked errors: FileError
```

