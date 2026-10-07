---
title: "Move ownership diagrams"
generated: true
source: "examples/ownership-transfer/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Move ownership diagrams

[Move ownership](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Providers {#providers}

`Console` is provided by [`SystemConsole`](../dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole). The same instance is shared.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It calls [`make`](../resource.md#symbol-make) and stores the result in owned `first` ([`Resource`](../resource.md#symbol-Resource)). It calls [`consume`](../resource.md#symbol-consume) with `value` from `first` using injected `Console` for `console`. It calls [`make`](../resource.md#symbol-make) and stores the result in owned `second` ([`Resource`](../resource.md#symbol-Resource)). It prints `"end of main"`. [source](../main.md#source-L7-L10)
:::

## Data flow

```mermaid
flowchart TD
    n0["Startup"]
    n1["resource"]
    n0 -->|"consume(value) / make → own Resource"| n1
```

### Package boundaries

::: details resource package calls

```mermaid
flowchart LR
    n0["August libraries"]
    n1["resource"]
    n1 -->|"Console.write(value)"| n0
```

:::

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | resource | 2 | [Inputs, results and call sites](index.md#boundary-9f88528d62a1) |
| resource | August libraries | 1 | [Inputs, results and call sites](index.md#boundary-ed30e8b2fe83) |

#### Data crossing these boundaries (3 contracts)

#### Startup → resource {#boundary-9f88528d62a1}

::: details 2 operations, 3 sites

**[consume](../resource.md#symbol-consume)**

Inputs: value: own Resource. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L8) · [Caller explanation](../main.md#startup) |

**[make](../resource.md#symbol-make)**

No caller-supplied inputs. Result: own Resource.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L7) · [Caller explanation](../main.md#startup) |
| Startup | [Call site](../main.md#source-L9) · [Caller explanation](../main.md#startup) |

:::

#### resource → August libraries {#boundary-ed30e8b2fe83}

::: details 1 operation, 1 site

**[Console.write](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)** · interface dispatch

Inputs: value: string. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| consume | [Call site](../resource.md#source-L16) · [Caller explanation](../resource.md#symbol-consume) |

:::


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |
| resource.aug | [Flow and sequences](../resource-diagrams.md) · [Explanation](../resource.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
