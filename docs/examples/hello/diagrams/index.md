---
title: "Hello world with dependencies diagrams"
generated: true
source: "examples/hello/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Hello world with dependencies diagrams

[Hello world with dependencies](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 6 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Providers {#providers}

`Console` is provided by [`SystemConsole`](../dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Logger` is provided by [`ConsoleLogger`](../logging/console.md#symbol-ConsoleLogger). The same instance is shared.

`app` is provided by [`Greeter`](../app/greeter.md#symbol-Greeter). The same instance is shared. It requires bindings for `Logger`.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `greeter` to the instance provided for `app`. It passes `"AugScript"` to [`greeter.greet`](../app/greeter.md#symbol-Greeter.greet), using injected `Console`. [source](../main.md#source-L9-L10)
:::

## Data flow

```mermaid
flowchart TD
    n0["app"]
    n1["logging"]
    n2["Startup"]
    n0 -->|"Logger.log(message)"| n1
    n2 -->|"Greeter.greet(name)"| n0
```

### Package boundaries

::: details logging package calls

```mermaid
flowchart LR
    n0["August libraries"]
    n1["logging"]
    n1 -->|"Console.write(value)"| n0
```

:::

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| app | logging | 1 | [Inputs, results and call sites](index.md#boundary-c0d38c047558) |
| logging | August libraries | 1 | [Inputs, results and call sites](index.md#boundary-f143c6ffe035) |
| Startup | app | 1 | [Inputs, results and call sites](index.md#boundary-5022cf84d895) |

#### Data crossing these boundaries (3 contracts)

#### app → logging {#boundary-c0d38c047558}

::: details 1 operation, 1 site

**[Logger.log](../logging/logger.md#symbol-Logger.log)** · interface dispatch

Inputs: message: string. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| Greeter.greet | [Call site](../app/greeter.md#source-L14) · [Caller explanation](../app/greeter.md#symbol-Greeter.greet) |

:::

#### logging → August libraries {#boundary-f143c6ffe035}

::: details 1 operation, 1 site

**[Console.write](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)** · interface dispatch

Inputs: value: string. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| ConsoleLogger.log | [Call site](../logging/console.md#source-L6) · [Caller explanation](../logging/console.md#symbol-ConsoleLogger.log) |

:::

#### Startup → app {#boundary-5022cf84d895}

::: details 1 operation, 1 site

**[Greeter.greet](../app/greeter.md#symbol-Greeter.greet)**

Inputs: name: string. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L10) · [Caller explanation](../main.md#startup) |

:::


## Open a folder

| Folder | Read |
| --- | --- |
| logging | [Folder data flow](folders/logging/index.md) |

## Open a module

| Module | Read |
| --- | --- |
| app/export.aug | [Flow and sequences](../app/export-diagrams.md) · [Explanation](../app/export.md) |
| app/greeter.aug | [Flow and sequences](../app/greeter-diagrams.md) · [Explanation](../app/greeter.md) |
| logging/console.aug | [Flow and sequences](../logging/console-diagrams.md) · [Explanation](../logging/console.md) |
| logging/export.aug | [Flow and sequences](../logging/export-diagrams.md) · [Explanation](../logging/export.md) |
| logging/logger.aug | [Flow and sequences](../logging/logger-diagrams.md) · [Explanation](../logging/logger.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
