---
title: "Use a package diagrams"
generated: true
source: "examples/packages/app/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Use a package diagrams

[Use a package](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 1 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It prints [`add`](../dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) with `left` `20` and `right` `22`. [source](../main.md#source-L3)
:::

## Data flow

No calls cross the source files in this view. Follow local operations in the file sequences below.

### Package boundaries

```mermaid
flowchart LR
    n0["Startup"]
    n1["math"]
    n0 -->|"add(left, right) → int"| n1
```

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | math | 1 | [Inputs, results and call sites](index.md#boundary-cd445652d3a0) |

#### Data crossing these boundaries (1 contracts)

#### Startup → math {#boundary-cd445652d3a0}

::: details 1 operation, 1 site

**[add](../dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add)**

Inputs: left: int, right: int. Result: int.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L3) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
