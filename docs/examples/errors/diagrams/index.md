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

Start here to see what moves between the application’s folders. Each arrow names an operation’s inputs and the result it returns to its caller. Open a folder for the next level of detail. Expand the contract list for complete types and dependency links.

## Data flow

```mermaid
flowchart TD
    n0["errors"]
    n1["Startup"]
    n1 -->|"load(fail) → string"| n0
```

::: details Data crossing these boundaries (1 contracts)

| From | To | Operation and inputs | Result |
| --- | --- | --- | --- |
| Startup | errors | [load](../errors.md#symbol-load) · fail: bool | string |

:::

## Open a module

| Module | Read |
| --- | --- |
| errors.aug | [Flow and sequences](../errors-diagrams.md) · [Explanation](../errors.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
