---
title: "Map deletion benchmark diagrams"
generated: true
source: "benchmarks/map-churn/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Map deletion benchmark diagrams

[Map deletion benchmark](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 1 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `4000`. It stores a context-typed empty collection with no items in owned `entries` (`Map<int,int>`). It sets `index` to `0`. While `index` is less than `iterations`, it stores `index` times `3` in `entries` under `index`; then it increases `index` by `1`. [source](../main.md#source-L2-L7)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it sets `index` to `0`. While `index` is less than `iterations`, it removes the key `index` from `entries`; then it increases `index` by `2`. After the loop, it sets `index` to `0`. While `index` is less than `iterations`, it stores `index` times `7` in `entries` under `index`; then it increases `index` by `1`. [source](../main.md#source-L8-L15)
:::

::: spec-paragraph specification-paragraph-3
After the loop, it sets `checksum` to `0`. It sets `position` to `1`. For each `key` and `value` in a snapshot of `entries`, it sets `checksum` to (`checksum` plus (`key` times `position`)) plus `value`; then it increases `position` by `1`. After the loop, it prints `checksum`. [source](../main.md#source-L16-L21)
:::

::: spec-paragraph specification-paragraph-4
It prints the number of elements in `entries`. [source](../main.md#source-L22)
:::

## Data flow

No calls cross the source files in this view. Follow local operations in the file sequences below.


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
