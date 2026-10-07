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

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### HTTP configuration

Listen on `127.0.0.1`. Limit request bodies to 1048576 bytes and buffered responses to 4194304 bytes.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It serves [`reply`](../routes.md#symbol-reply) on port `0`. [source](../main.md#source-L3)
:::

## Data flow

```mermaid
flowchart TD
    n0["HTTP requests"]
    n1["routes"]
    n0 -->|"GET /bench → Reply"| n1
```

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| HTTP requests | routes | 1 | [Inputs, results and call sites](index.md#boundary-da2e36dc02a1) |

#### Data crossing these boundaries (1 contracts)

#### HTTP requests → routes {#boundary-da2e36dc02a1}

::: details 1 operation, 1 site

**[GET /bench](../routes.md#symbol-reply)** · HTTP endpoint

No caller-supplied inputs. Result: Reply.

| Caller or entry | Evidence |
| --- | --- |
| HTTP requests | [Declaration](../routes.md#source-L3) · [Caller explanation](../routes.md#symbol-reply) |

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
