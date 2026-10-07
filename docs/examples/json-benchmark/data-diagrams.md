---
title: "data.aug diagrams"
generated: true
source: "benchmarks/json/data.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# data.aug diagrams

[JSON benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](data.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Payload constructor {#sequence-Payload-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](data.md#source-L2)
:::

It takes `id` as an integer, kept read-only, `message` as a string, kept read-only, and `values` as `List<int>`, kept read-only.

Receive fields: id, message, values. [Explanation](data.md).
