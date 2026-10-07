---
title: "Generic dependency injection diagrams"
generated: true
source: "examples/generic-di/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Generic dependency injection diagrams

[Generic dependency injection](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Providers {#providers}

`Console` is provided by [`SystemConsole`](../dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Repository<int>` is provided by [`NumberRepository`](../types.md#symbol-NumberRepository). The same instance is shared.

`app` is provided by [`Program`](../types.md#symbol-Program). The same instance is shared. It requires bindings for `Repository<int>`.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `program` to the instance provided for `app`. It calls [`program.start`](../types.md#symbol-Program.start) using injected `Console` for `console`. [source](../main.md#source-L9-L10)
:::

## Data flow

```mermaid
flowchart TD
    n0["Startup"]
    n1["types"]
    n0 -->|"Program.start"| n1
```

### Package boundaries

::: details types package calls

```mermaid
flowchart LR
    n0["August libraries"]
    n1["types"]
    n1 -->|"Console.write(value)"| n0
```

:::

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | types | 1 | [Inputs, results and call sites](index.md#boundary-0f6d1d161bd4) |
| types | August libraries | 1 | [Inputs, results and call sites](index.md#boundary-2aa7744b47e2) |

#### Data crossing these boundaries (2 contracts)

#### Startup → types {#boundary-0f6d1d161bd4}

::: details 1 operation, 1 site

**[Program.start](../types.md#symbol-Program.start)**

No caller-supplied inputs. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L10) · [Caller explanation](../main.md#startup) |

:::

#### types → August libraries {#boundary-2aa7744b47e2}

::: details 1 operation, 1 site

**[Console.write](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)** · interface dispatch

Inputs: value: int. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| Program.start | [Call site](../types.md#source-L13) · [Caller explanation](../types.md#symbol-Program.start) |

:::


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |
| types.aug | [Flow and sequences](../types-diagrams.md) · [Explanation](../types.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
