---
title: "operations.aug diagrams"
generated: true
source: "benchmarks/tasks/operations.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# operations.aug diagrams

[Task scheduling benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](operations.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### compute {#sequence-compute}

::: spec-paragraph specification-paragraph-1
[Source](operations.md#source-L2)
:::

It takes `value` as an integer.

Return value \* 3 + 1; required cleanup runs before exit. [Explanation](operations.md).
