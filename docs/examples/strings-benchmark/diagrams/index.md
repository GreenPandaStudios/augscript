---
title: "String processing benchmark diagrams"
generated: true
source: "benchmarks/strings/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# String processing benchmark diagrams

[String processing benchmark](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 1 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `20000`. It sets `index` and `checksum` separately, each to `0`. While `index` is less than `iterations`, it sets `parts` to `split` on `"August,clear,local,checked"` with `separator` `","`. For each `part` in a snapshot of `parts`, it increases `checksum` by the byte length of `part`. [source](../main.md#source-L2-L9)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it increases `index` by `1`. After the loop, it prints `checksum`. [source](../main.md#source-L9-L10)
:::

## Data flow

No calls cross the source files in this view. Follow local operations in the file sequences below.


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
