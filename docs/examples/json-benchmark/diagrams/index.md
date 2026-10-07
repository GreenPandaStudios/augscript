---
title: "JSON benchmark diagrams"
generated: true
source: "benchmarks/json/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# JSON benchmark diagrams

[JSON benchmark](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `checksum` and `index` separately, each to `0`. While `index` is less than `5000`, it sets `document` to [`parse`](../dependencies/packages/%40git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-parse) with `input` `"{\"id\":7,\"message\":\"hello\",\"values\":[1,2,3]}"`. It sets `payload` to `document.decode` for [`Payload`](../data.md#symbol-Payload). It sets `encoded` to `stringify` on a `Json` with `value` from `payload`. [source](../main.md#source-L4-L15)
:::

::: spec-paragraph specification-paragraph-2
It sets `checksum` to (`checksum` plus `payload.id`) plus the byte length of `encoded`. It increases `index` by `1`. After the loop, it prints `checksum`. If this work raises `JsonError`, it calls `exit` with `status` `1`. [source](../main.md#source-L11-L15)
:::

## Data flow

No calls cross the source files in this view. Follow local operations in the file sequences below.

### Package boundaries

```mermaid
flowchart LR
    n0["Startup"]
    n1["json"]
    n0 -->|"parse(input) → Json"| n1
```

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | json | 1 | [Inputs, results and call sites](index.md#boundary-61534c742ca4) |

#### Data crossing these boundaries (1 contracts)

#### Startup → json {#boundary-61534c742ca4}

::: details 1 operation, 1 site

**[parse](../dependencies/packages/%40git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-parse)**

Inputs: input: string. Result: Json.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L8) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| data.aug | [Flow and sequences](../data-diagrams.md) · [Explanation](../data.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
