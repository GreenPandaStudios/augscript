---
title: "Generic types and functions diagrams"
generated: true
source: "examples/generics/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Generic types and functions diagrams

[Generic types and functions](../index.md)

Start here to see what moves between the application’s folders. Each arrow names an operation’s inputs and the result it returns to its caller. Open a folder for the next level of detail. Expand the contract list for complete types and dependency links.

## Data flow

```mermaid
flowchart TD
    n0["Startup"]
    n1["types"]
    n0 -->|"Box(value) / Box.get + 2 more → Box‹string› / string"| n1
```

::: details Data crossing these boundaries (4 contracts)

| From | To | Operation and inputs | Result |
| --- | --- | --- | --- |
| Startup | types | [Box](../types.md#symbol-Box) · value: string | Box\<string\> |
| Startup | types | [Box.get](../types.md#symbol-Box.get) | string |
| Startup | types | [Formatter.format](../types.md#symbol-Formatter.format) · value: int · interface dispatch | string |
| Startup | types | [Formatter.title](../types.md#symbol-Formatter.title) · interface dispatch | string |

:::

## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |
| types.aug | [Flow and sequences](../types-diagrams.md) · [Explanation](../types.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
