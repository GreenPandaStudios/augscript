---
title: "Checked-error benchmark diagrams"
generated: true
source: "benchmarks/errors/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Checked-error benchmark diagrams

[Checked-error benchmark](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `20000`. It sets `index`, `checksum`, and `failures` separately, each to `0`. [source](../main.md#source-L3-L6)
:::

::: spec-paragraph specification-paragraph-2
While `index` is less than `iterations`, it tries to increase `checksum` by [`validate`](../operations.md#symbol-validate) with `value` from `index`. If this work raises `FileError`, it increases `failures` by `1`. It increases `index` by `1`. After the loop, it prints `checksum`. [source](../main.md#source-L7-L13)
:::

::: spec-paragraph specification-paragraph-3
It prints `failures`. [source](../main.md#source-L14)
:::

## Data flow

```mermaid
flowchart TD
    n0["Startup"]
    n1["operations"]
    n0 -->|"validate(value) → int"| n1
```

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | operations | 1 | [Inputs, results and call sites](index.md#boundary-94c63ff1f839) |

#### Data crossing these boundaries (1 contracts)

#### Startup → operations {#boundary-94c63ff1f839}

::: details 1 operation, 1 site

**[validate](../operations.md#symbol-validate)**

Inputs: value: int. Result: int.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L9) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |
| operations.aug | [Flow and sequences](../operations-diagrams.md) · [Explanation](../operations.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
