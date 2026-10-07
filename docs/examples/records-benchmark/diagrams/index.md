---
title: "Record allocation benchmark diagrams"
generated: true
source: "benchmarks/records/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Record allocation benchmark diagrams

[Record allocation benchmark](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `50000`. It stores a list with no items in owned `values` (`List<Item>`). It sets `index` to `0`. While `index` is less than `iterations`, it appends an [`Item`](../data.md#symbol-Item) with `id` from `index` and `name` `"August"` to `values`; then it increases `index` by `1`. [source](../main.md#source-L3-L8)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it sets `checksum` to `0`. For each `item` in a snapshot of `values`, it increases `checksum` by `item.id`. After the loop, it prints `checksum`. [source](../main.md#source-L9-L12)
:::

## Data flow

No calls cross the source files in this view. Follow local operations in the file sequences below.

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | data | 1 | [Inputs, results and call sites](index.md#boundary-40804e85a313) |

#### Data crossing these boundaries (1 contracts)

#### Startup → data {#boundary-40804e85a313}

::: details 1 operation, 1 site

**[Item](../data.md#symbol-Item)** · value construction

Inputs: id: int, name: string. Result: Item.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L7) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| data.aug | [Flow and sequences](../data-diagrams.md) · [Explanation](../data.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
