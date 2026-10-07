---
title: "Labeled calls and injection diagrams"
generated: true
source: "examples/new-syntax/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Labeled calls and injection diagrams

[Labeled calls and injection](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 5 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Providers {#providers}

`Console` is provided by [`SystemConsole`](../dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Logger` is provided by [`ConsoleLogger`](../console.md#symbol-ConsoleLogger). The same instance is shared.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `greeter` to a [`Greeter`](../greeter.md#symbol-Greeter) with `x` `4` using injected `Logger` for `logger`. It passes `"AugScript"` to [`greeter.greet`](../greeter.md#symbol-Greeter.greet), using injected `Console`. It sets `count` to `7`. It sets `count` to [`increment`](../math.md#symbol-increment) with `value` from `count`. [source](../main.md#source-L9-L12)
:::

::: spec-paragraph specification-paragraph-2
It prints `count`. [source](../main.md#source-L13)
:::

## Data flow

```mermaid
flowchart TD
    n0["greeter"]
    n1["logger"]
    n2["Startup"]
    n3["math"]
    n0 -->|"Logger.log(message)"| n1
    n2 -->|"Greeter(x) / Greeter.greet(name) → Greeter"| n0
    n2 -->|"increment(value) → int"| n3
```

### Package boundaries

::: details console package calls

```mermaid
flowchart LR
    n0["August libraries"]
    n1["console"]
    n1 -->|"Console.write(value)"| n0
```

:::

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| console | August libraries | 1 | [Inputs, results and call sites](index.md#boundary-6806815e2275) |
| greeter | logger | 1 | [Inputs, results and call sites](index.md#boundary-e2b6a7888245) |
| Startup | greeter | 2 | [Inputs, results and call sites](index.md#boundary-757c9f22a16b) |
| Startup | math | 1 | [Inputs, results and call sites](index.md#boundary-8237cebea893) |

#### Data crossing these boundaries (5 contracts)

#### console → August libraries {#boundary-6806815e2275}

::: details 1 operation, 1 site

**[Console.write](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)** · interface dispatch

Inputs: value: string. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| ConsoleLogger.log | [Call site](../console.md#source-L6) · [Caller explanation](../console.md#symbol-ConsoleLogger.log) |

:::

#### greeter → logger {#boundary-e2b6a7888245}

::: details 1 operation, 1 site

**[Logger.log](../logger.md#symbol-Logger.log)** · interface dispatch

Inputs: message: string. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| Greeter.greet | [Call site](../greeter.md#source-L6) · [Caller explanation](../greeter.md#symbol-Greeter.greet) |

:::

#### Startup → greeter {#boundary-757c9f22a16b}

::: details 2 operations, 2 sites

**[Greeter](../greeter.md#symbol-Greeter)**

Inputs: x: int. Result: Greeter.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L9) · [Caller explanation](../main.md#startup) |

**[Greeter.greet](../greeter.md#symbol-Greeter.greet)**

Inputs: name: string. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L10) · [Caller explanation](../main.md#startup) |

:::

#### Startup → math {#boundary-8237cebea893}

::: details 1 operation, 1 site

**[increment](../math.md#symbol-increment)**

Inputs: value: int. Result: int.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L12) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| console.aug | [Flow and sequences](../console-diagrams.md) · [Explanation](../console.md) |
| greeter.aug | [Flow and sequences](../greeter-diagrams.md) · [Explanation](../greeter.md) |
| logger.aug | [Flow and sequences](../logger-diagrams.md) · [Explanation](../logger.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |
| math.aug | [Flow and sequences](../math-diagrams.md) · [Explanation](../math.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
