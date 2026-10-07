---
title: "Read access and mutable borrows diagrams"
generated: true
source: "examples/ownership/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Read access and mutable borrows diagrams

[Read access and mutable borrows](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It creates [`Counter`](../counter.md#symbol-Counter) with `value` `1` and stores the result in owned `counter` ([`Counter`](../counter.md#symbol-Counter)). It calls [`counter.increment`](../counter.md#symbol-Counter.increment). It prints [`counter.read`](../counter.md#symbol-Counter.read). [source](../main.md#source-L3-L5)
:::

## Data flow

```mermaid
flowchart TD
    n0["counter"]
    n1["Startup"]
    n1 -->|"Counter(value) / Counter.increment + 1 more → Counter / int"| n0
```

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | counter | 3 | [Inputs, results and call sites](index.md#boundary-786068825950) |

#### Data crossing these boundaries (3 contracts)

#### Startup → counter {#boundary-786068825950}

::: details 3 operations, 3 sites

**[Counter](../counter.md#symbol-Counter)**

Inputs: value: int. Result: Counter.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L3) · [Caller explanation](../main.md#startup) |

**[Counter.increment](../counter.md#symbol-Counter.increment)**

No caller-supplied inputs. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L4) · [Caller explanation](../main.md#startup) |

**[Counter.read](../counter.md#symbol-Counter.read)**

No caller-supplied inputs. Result: int.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L5) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| counter.aug | [Flow and sequences](../counter-diagrams.md) · [Explanation](../counter.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
