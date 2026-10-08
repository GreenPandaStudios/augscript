---
title: "Function and constructor middleware diagrams"
generated: true
source: "examples/interceptors/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Function and constructor middleware diagrams

[Function and constructor middleware](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 4 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Providers {#providers}

`Console` is provided by [`SystemConsole`](../dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Logger` is provided by [`ConsoleLogger`](../logging.md#symbol-ConsoleLogger). The same instance is shared.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It prints [`describe`](../app.md#symbol-describe) with `label` `"value"` and `x` `6` using injected `Logger` for `logger` and `Console` for `console`. If this work raises [`ValidationError`](../interceptors.md#symbol-ValidationError), it prints `"rejected"`. It sets `greeter` to a [`Greeter`](../app.md#symbol-Greeter) with `name` `"AugScript"` using injected `Logger` for `_logger`. It prints [`greeter.greet`](../app.md#symbol-Greeter.greet) using injected `Logger` for `logger` and `Console` for `console`. [source](../main.md#source-L10-L17)
:::

::: spec-paragraph specification-paragraph-2
It tries to call [`describe`](../app.md#symbol-describe) with `x` `-1` and `label` `"invalid"` using injected `Logger` for `logger` and `Console` for `console`. If this work raises [`ValidationError`](../interceptors.md#symbol-ValidationError), it prints `"rejected"`. [source](../main.md#source-L18-L23)
:::

## Data flow

```mermaid
flowchart TD
    n0["app"]
    n1["interceptors"]
    n2["logging"]
    n3["Startup"]
    n1 -->|"Logger.log(message)"| n2
    n3 -->|"Greeter(name) / Greeter.greet + 1 more → Greeter / string"| n0
```

### Package boundaries

::: details app package calls

```mermaid
flowchart LR
    n0["August libraries"]
    n1["app"]
    n1 -->|"Console.write(value)"| n0
```

:::

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
| app | August libraries | 1 | [Inputs, results and call sites](index.md#boundary-2135dd7a022c) |
| interceptors | logging | 1 | [Inputs, results and call sites](index.md#boundary-781982b5ea6c) |
| logging | August libraries | 1 | [Inputs, results and call sites](index.md#boundary-212f9228b2b1) |
| Startup | app | 3 | [Inputs, results and call sites](index.md#boundary-d5066fbd498a) |

#### Data crossing these boundaries (6 contracts)

#### app → August libraries {#boundary-2135dd7a022c}

::: details 1 operation, 1 site

**[Console.write](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)** · interface dispatch

Inputs: value: int. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| describe | [Call site](../app.md#source-L16) · [Caller explanation](../app.md#symbol-describe) |

:::

#### interceptors → logging {#boundary-781982b5ea6c}

::: details 1 operation, 2 sites

**[Logger.log](../logging.md#symbol-Logger.log)** · interface dispatch

Inputs: message: string. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| Audit.around | [Call site](../interceptors.md#source-L16) · [Caller explanation](../interceptors.md#symbol-Audit.around) |
| Audit.around | [Call site](../interceptors.md#source-L18) · [Caller explanation](../interceptors.md#symbol-Audit.around) |

:::

#### logging → August libraries {#boundary-212f9228b2b1}

::: details 1 operation, 1 site

**[Console.write](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)** · interface dispatch

Inputs: value: string. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| ConsoleLogger.log | [Call site](../logging.md#source-L11) · [Caller explanation](../logging.md#symbol-ConsoleLogger.log) |

:::

#### Startup → app {#boundary-d5066fbd498a}

::: details 3 operations, 4 sites

**[Greeter](../app.md#symbol-Greeter)**

Inputs: name: string. Result: Greeter.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L16) · [Caller explanation](../main.md#startup) |

**[Greeter.greet](../app.md#symbol-Greeter.greet)**

No caller-supplied inputs. Result: string.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L17) · [Caller explanation](../main.md#startup) |

**[describe](../app.md#symbol-describe)**

Inputs: x: int, label: string. Result: string.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L11) · [Caller explanation](../main.md#startup) |
| Startup | [Call site](../main.md#source-L19) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| app.aug | [Flow and sequences](../app-diagrams.md) · [Explanation](../app.md) |
| interceptors.aug | [Flow and sequences](../interceptors-diagrams.md) · [Explanation](../interceptors.md) |
| logging.aug | [Flow and sequences](../logging-diagrams.md) · [Explanation](../logging.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
