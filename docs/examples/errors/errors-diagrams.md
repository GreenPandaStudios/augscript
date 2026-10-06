---
title: "Diagrams · Checked failures"
generated: true
source: "examples/errors/errors.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Checked failures diagrams

[Checked failures](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](errors.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["load · errors.aug"]

```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### load {#sequence-load}

::: spec-paragraph specification-paragraph-1
[Source](errors.md#source-L2)
:::

```mermaid
sequenceDiagram
    participant p0 as load
    participant p1 as FileError
    alt fail
    p0->>p1: FileError()
    Note over p0: Raise checked failure FileError()#59; required cleanup runs before exit
    end
    Note over p0: Return #34;loaded#34;#59; required cleanup runs before exit
    Note over p0: May leave with checked errors: FileError
```

