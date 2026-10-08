---
title: "operations.aug diagrams"
generated: true
source: "benchmarks/errors/operations.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# operations.aug diagrams

[Checked-error benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](operations.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### validate {#sequence-validate}

::: spec-paragraph specification-paragraph-1
[Source](operations.md#source-L2)
:::

It takes `value` as an integer.

Failures can raise `FileError`.

```mermaid
sequenceDiagram
    participant p0 as validate

    alt (value minus ((value divided by 16) times 16)) equals 0
    p0->>p0: FileError()
    p0-->>p0: FileError result: FileError
    Note over p0: Raise checked failure FileError()； required cleanup runs<br/>before exit
    end
    Note over p0: Return value； required cleanup runs before exit
    Note over p0: May leave with checked errors: FileError
```
