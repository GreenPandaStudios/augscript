---
title: "domain/models.aug diagrams"
generated: true
source: "examples/approved-design/domain/models.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# domain/models.aug diagrams

[Modules and composition](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](models.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Fruit constructor {#sequence-Fruit-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](models.md#source-L3)
:::

Immutable fruit data, with public construction labels and structural equality.

It takes `code` as an integer, kept read-only and `name` as a string, kept read-only.

Receive fields: code, name. [Explanation](models.md).
