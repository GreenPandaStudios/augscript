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

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Providers {#providers}

`Formatter` is provided by [`TextFormatter`](../types.md#symbol-TextFormatter). The same instance is shared.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `formatter` to the instance provided for `Formatter`. It prints [`formatter.title`](../types.md#symbol-Formatter.title). It prints [`formatter.format`](../types.md#symbol-Formatter.format) for `int` with `value` `42`. It sets `box` to a [`Box`](../types.md#symbol-Box) for `string` with `value` `"inside a generic box"`. [source](../main.md#source-L6-L9)
:::

::: spec-paragraph specification-paragraph-2
It prints [`box.get`](../types.md#symbol-Box.get). [source](../main.md#source-L10)
:::

## Data flow

```mermaid
flowchart TD
    n0["Startup"]
    n1["types"]
    n0 -->|"Box(value) / Box.get + 2 more → Box‹string› / string"| n1
```

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | types | 4 | [Inputs, results and call sites](index.md#boundary-0f6d1d161bd4) |

#### Data crossing these boundaries (4 contracts)

#### Startup → types {#boundary-0f6d1d161bd4}

::: details 4 operations, 4 sites

**[Box](../types.md#symbol-Box)**

Inputs: value: string. Result: Box\<string\>.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L9) · [Caller explanation](../main.md#startup) |

**[Box.get](../types.md#symbol-Box.get)**

No caller-supplied inputs. Result: string.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L10) · [Caller explanation](../main.md#startup) |

**[Formatter.format](../types.md#symbol-Formatter.format)** · interface dispatch

Inputs: value: int. Result: string.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L8) · [Caller explanation](../main.md#startup) |

**[Formatter.title](../types.md#symbol-Formatter.title)** · interface dispatch

No caller-supplied inputs. Result: string.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L7) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |
| types.aug | [Flow and sequences](../types-diagrams.md) · [Explanation](../types.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
