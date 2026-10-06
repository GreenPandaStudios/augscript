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

Start here to see what moves between the application’s folders. Each arrow names an operation’s inputs and the result it returns to its caller. Open a folder for the next level of detail. Expand the contract list for complete types and dependency links.

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

::: details Data crossing these boundaries (3 contracts)

| From | To | Operation and inputs | Result |
| --- | --- | --- | --- |
| app | logging | [Logger.log](../logging/logger.md) · message: string · interface dispatch | void |
| logging | August libraries | [Console.write](../dependencies/august/0.23.0/io/contracts.md) · value: string · interface dispatch | void |
| Startup | app | [Greeter.greet](../app/greeter.md) · name: string | void |

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
