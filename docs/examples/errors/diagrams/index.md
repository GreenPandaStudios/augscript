---
title: "Checked failures diagrams"
generated: true
source: "examples/errors/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Checked failures diagrams

[Checked failures](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It prints [`load`](../errors.md#symbol-load) with `fail` `true`. If this work raises `FileError`, it prints `"caught FileError"`. [source](../main.md#source-L3-L8)
:::

## Data flow

```mermaid
flowchart TD
    n0["errors"]
    n1["Startup"]
    n1 -->|"load(fail) → string"| n0
```

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | errors | 1 | [Inputs, results and call sites](index.md#boundary-e09d56e352db) |

#### Data crossing these boundaries (1 contracts)

#### Startup → errors {#boundary-e09d56e352db}

::: details 1 operation, 1 site

**[load](../errors.md#symbol-load)**

Inputs: fail: bool. Result: string.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L4) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| errors.aug | [Flow and sequences](../errors-diagrams.md) · [Explanation](../errors.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
