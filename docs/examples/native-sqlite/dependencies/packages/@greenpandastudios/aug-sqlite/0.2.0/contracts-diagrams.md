---
title: "package/@greenpandastudios/aug-sqlite@0.2.0/contracts.aug diagrams"
generated: true
source: "examples/native-sqlite/.aug-spec/packages/@greenpandastudios/aug-sqlite/0.2.0/contracts.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@greenpandastudios/aug-sqlite@0.2.0/contracts.aug diagrams

[A database with SQLite](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](contracts.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### SqliteError constructor {#sequence-SqliteError-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L4)
:::

Receive fields: code, message. [Explanation](contracts.md).

### DatabaseStorage.open {#sequence-DatabaseStorage.open}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L8)
:::

May leave with checked errors: SqliteError. Interface contract; implementation selected at runtime. [Explanation](contracts.md).
