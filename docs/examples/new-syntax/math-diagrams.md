---
title: "math.aug diagrams"
generated: true
source: "examples/new-syntax/math.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# math.aug diagrams

[Labeled calls and injection](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](math.md)

## Class interactions

No relationships at this level.

## API calls

```mermaid
flowchart TD
    n0["increment · math.aug"]

```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### increment {#sequence-increment}

::: spec-paragraph specification-paragraph-1
[Source](math.md#source-L2)
:::

```mermaid
sequenceDiagram
    participant p0 as increment

    Note over p0: Return value + 1#59; required cleanup runs before exit
```

