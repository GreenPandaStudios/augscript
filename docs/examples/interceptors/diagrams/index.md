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

Start here to see what moves between the application’s folders. Each arrow names an operation’s inputs and the result it returns to its caller. Open a folder for the next level of detail. Expand the contract list for complete types and dependency links.

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

::: details Data crossing these boundaries (6 contracts)

| From | To | Operation and inputs | Result |
| --- | --- | --- | --- |
| app | August libraries | [Console.write](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write) · value: int · interface dispatch | void |
| interceptors | logging | [Logger.log](../logging.md#symbol-Logger.log) · message: string · interface dispatch | void |
| logging | August libraries | [Console.write](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write) · value: string · interface dispatch | void |
| Startup | app | [Greeter](../app.md#symbol-Greeter) · name: string | Greeter |
| Startup | app | [Greeter.greet](../app.md#symbol-Greeter.greet) | string |
| Startup | app | [describe](../app.md#symbol-describe) · x: int, label: string | string |

:::

## Open a module

| Module | Read |
| --- | --- |
| app.aug | [Flow and sequences](../app-diagrams.md) · [Explanation](../app.md) |
| interceptors.aug | [Flow and sequences](../interceptors-diagrams.md) · [Explanation](../interceptors.md) |
| logging.aug | [Flow and sequences](../logging-diagrams.md) · [Explanation](../logging.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
