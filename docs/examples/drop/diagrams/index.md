---
title: "Resource cleanup diagrams"
generated: true
source: "examples/drop/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Resource cleanup diagrams

[Resource cleanup](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It creates [`Resource`](../resource.md#symbol-Resource) and stores the result in owned `resource` ([`Resource`](../resource.md#symbol-Resource)). It prints `"using resource"`. [source](../main.md#source-L3-L4)
:::

## Data flow

```mermaid
flowchart TD
    n0["Startup"]
    n1["resource"]
    n0 -->|"Resource → Resource"| n1
```

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | resource | 1 | [Inputs, results and call sites](index.md#boundary-9f88528d62a1) |

#### Data crossing these boundaries (1 contracts)

#### Startup → resource {#boundary-9f88528d62a1}

::: details 1 operation, 1 site

**[Resource](../resource.md#symbol-Resource)**

No caller-supplied inputs. Result: Resource.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L3) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |
| resource.aug | [Flow and sequences](../resource-diagrams.md) · [Explanation](../resource.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
