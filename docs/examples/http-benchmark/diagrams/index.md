---
title: "HTTP benchmark diagrams"
generated: true
source: "benchmarks/http/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# HTTP benchmark diagrams

[HTTP benchmark](../index.md)

Start here to see what moves between the application’s folders. Each arrow names an operation’s inputs and the result it returns to its caller. Open a folder for the next level of detail. Expand the contract list for complete types and dependency links.

## Data flow

```mermaid
flowchart TD
    n0["HTTP requests"]
    n1["routes"]
    n0 -->|"GET /bench → Reply"| n1
```

::: details Data crossing these boundaries (1 contracts)

| From | To | Operation and inputs | Result |
| --- | --- | --- | --- |
| HTTP requests | routes | [GET /bench](../routes.md#symbol-reply) · HTTP endpoint | Reply |

:::

## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |
| routes.aug | [Flow and sequences](../routes-diagrams.md) · [Explanation](../routes.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.

## HTTP APIs

| API | Operation |
| --- | --- |
| GET /bench | [reply](../routes-diagrams.md#sequence-reply) |
