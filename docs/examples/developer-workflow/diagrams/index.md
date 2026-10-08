---
title: "A small tested application diagrams"
generated: true
source: "examples/developer-workflow/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# A small tested application diagrams

[A small tested application](../index.md)

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 5 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Providers {#providers}

`Console` is provided by [`SystemConsole`](../dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Logger` is provided by [`ConsoleLogger`](../logging/console.md#symbol-ConsoleLogger). The same instance is shared.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `numbers` of type `List<int>` to a list containing `1`, `2`. It sets `pair` of type `Tuple<int,string>` to a tuple containing `1`, `"apple"`. It sets `unique` of type `Set<int>` to a set containing `1`, `2`, `1`. It sets `fruit` of type `Map<int,string>` to a map with `1` mapped to `"apples"`; `2` mapped to `"pears"`. [source](../main.md#source-L7-L26)
:::

::: spec-paragraph specification-paragraph-2
It sets `calculator` to a [`Calculator`](../calculator.md#symbol-Calculator) using injected `Logger` for `_logger`. It prints [`calculator.add`](../calculator.md#symbol-Calculator.add) with `right` from the item at index `1` in `numbers` and `left` from the item at index `0` in `numbers` using injected `Console` for `console`. It prints `pair.get` with `index` `1`. It prints the number of elements in `unique`. [source](../main.md#source-L12-L15)
:::

::: spec-paragraph specification-paragraph-3
It prints the value under `2` in `fruit`. It prints [`load`](../calculator.md#symbol-load) with `fail` `true`. If this work raises `FileError`, it prints `"load failed as expected"`. If this work raises `IndexError`, it prints `"unexpected index failure"`. [source](../main.md#source-L16-L25)
:::

## Data flow

```mermaid
flowchart TD
    n0["calculator"]
    n1["logging"]
    n2["Startup"]
    n0 -->|"Logger.log(message)"| n1
    n2 -->|"Calculator / Calculator.add(left, right) + 1 more → Calculator / int + 1 more"| n0
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
| calculator | logging | 1 | [Inputs, results and call sites](index.md#boundary-691dd47f54a7) |
| logging | August libraries | 1 | [Inputs, results and call sites](index.md#boundary-f143c6ffe035) |
| Startup | calculator | 3 | [Inputs, results and call sites](index.md#boundary-1ef56d68045c) |

#### Data crossing these boundaries (5 contracts)

#### calculator → logging {#boundary-691dd47f54a7}

::: details 1 operation, 1 site

**[Logger.log](../logging/logger.md#symbol-Logger.log)** · interface dispatch

Inputs: message: string. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| Calculator.add | [Call site](../calculator.md#source-L17) · [Caller explanation](../calculator.md#symbol-Calculator.add) |

:::

#### logging → August libraries {#boundary-f143c6ffe035}

::: details 1 operation, 1 site

**[Console.write](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)** · interface dispatch

Inputs: value: string. Result: void.

| Caller or entry | Evidence |
| --- | --- |
| ConsoleLogger.log | [Call site](../logging/console.md#source-L7) · [Caller explanation](../logging/console.md#symbol-ConsoleLogger.log) |

:::

#### Startup → calculator {#boundary-1ef56d68045c}

::: details 3 operations, 3 sites

**[Calculator](../calculator.md#symbol-Calculator)**

No caller-supplied inputs. Result: Calculator.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L12) · [Caller explanation](../main.md#startup) |

**[Calculator.add](../calculator.md#symbol-Calculator.add)**

Inputs: left: int, right: int. Result: int.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L13) · [Caller explanation](../main.md#startup) |

**[load](../calculator.md#symbol-load)**

Inputs: fail: bool. Result: string.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L18) · [Caller explanation](../main.md#startup) |

:::


## Open a folder

| Folder | Read |
| --- | --- |
| logging | [Folder data flow](folders/logging/index.md) |

## Open a module

| Module | Read |
| --- | --- |
| calculator.aug | [Flow and sequences](../calculator-diagrams.md) · [Explanation](../calculator.md) |
| logging/console.aug | [Flow and sequences](../logging/console-diagrams.md) · [Explanation](../logging/console.md) |
| logging/export.aug | [Flow and sequences](../logging/export-diagrams.md) · [Explanation](../logging/export.md) |
| logging/logger.aug | [Flow and sequences](../logging/logger-diagrams.md) · [Explanation](../logging/logger.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
