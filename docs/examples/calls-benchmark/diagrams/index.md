---
title: "Function-call benchmark diagrams"
generated: true
source: "benchmarks/calls/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Function-call benchmark diagrams

[Function-call benchmark](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `200000`. It sets `state` to `123`. It sets `index` to `0`. While `index` is less than `iterations`, it sets `state` to [`step`](../operations.md#symbol-step) with `value` from `state`; then it increases `index` by `1`. [source](../main.md#source-L3-L8)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it prints `state`. [source](../main.md#source-L9)
:::

## Data flow

```mermaid
flowchart TD
    n0["Startup"]
    n1["operations"]
    n0 -->|"step(value) → int"| n1
```

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | operations | 1 | [Inputs, results and call sites](index.md#boundary-94c63ff1f839) |

#### Data crossing these boundaries (1 contracts)

#### Startup → operations {#boundary-94c63ff1f839}

::: details 1 operation, 1 site

**[step](../operations.md#symbol-step)**

Inputs: value: int. Result: int.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L7) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |
| operations.aug | [Flow and sequences](../operations-diagrams.md) · [Explanation](../operations.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
