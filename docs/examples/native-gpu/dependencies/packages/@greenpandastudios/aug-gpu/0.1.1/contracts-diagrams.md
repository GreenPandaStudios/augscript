---
title: "package/@greenpandastudios/aug-gpu@0.1.1/contracts.aug diagrams"
generated: true
source: "examples/native-gpu/.aug-spec/packages/@greenpandastudios/aug-gpu/0.1.1/contracts.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@greenpandastudios/aug-gpu@0.1.1/contracts.aug diagrams

[GPU workers](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](contracts.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### GpuError constructor {#sequence-GpuError-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L3)
:::

Receive fields: code, message. [Explanation](contracts.md).

### GpuError.explain {#sequence-GpuError.explain}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L4)
:::

Return message; required cleanup runs before exit. [Explanation](contracts.md).
