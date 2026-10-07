---
title: "List traversal benchmark diagrams"
generated: true
source: "benchmarks/list/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# List traversal benchmark diagrams

[List traversal benchmark](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 1 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `100000`. It stores a list with no items in owned `values` (`List<int>`). It sets `index` to `0`. While `index` is less than `iterations`, it appends `index` times `3` to `values`; then it increases `index` by `1`. [source](../main.md#source-L2-L7)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it sets `checksum` to `0`. For each `value` in a snapshot of `values`, it increases `checksum` by `value`. After the loop, it prints `checksum`. [source](../main.md#source-L8-L11)
:::

## Data flow

No calls cross the source files in this view. Follow local operations in the file sequences below.


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
