---
title: "GPU workers diagrams"
generated: true
source: "examples/native-gpu/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# GPU workers diagrams

[GPU workers](../index.md)

Start here to see what moves between the application’s folders. Each arrow names an operation’s inputs and the result it returns to its caller. Open a folder for the next level of detail. Expand the contract list for complete types and dependency links.

## Data flow

```mermaid
flowchart TD
    n0["compute"]
    n1["Startup"]
    n1 -->|"calculate(left, right) → list of float"| n0
```

### Package boundaries

::: details compute package calls

```mermaid
flowchart LR
    n0["compute"]
    n1["url_39068e92fef803d998a8"]
    n0 -->|"add(left, right) / download(buffer) + 2 more → Buffer / Device + 1 more"| n1
```

:::

::: details Startup package calls

```mermaid
flowchart LR
    n0["Startup"]
    n1["url_39068e92fef803d998a8"]
    n0 -->|"GpuError.explain → string"| n1
```

:::

::: details Data crossing these boundaries (6 contracts)

| From | To | Operation and inputs | Result |
| --- | --- | --- | --- |
| compute | url\_39068e92fef803d998a8 | [add](../dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md) · left: Buffer, right: Buffer | Buffer |
| compute | url\_39068e92fef803d998a8 | [download](../dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md) · buffer: Buffer | List\<float\> |
| compute | url\_39068e92fef803d998a8 | [openDevice](../dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md) | Device |
| compute | url\_39068e92fef803d998a8 | [upload](../dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md) · device: Device, values: List\<float\> | Buffer |
| Startup | compute | [calculate](../compute.md) · left: List\<float\>, right: List\<float\> | List\<float\> |
| Startup | url\_39068e92fef803d998a8 | [GpuError.explain](../dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/contracts.md) | string |

:::

## Open a module

| Module | Read |
| --- | --- |
| compute.aug | [Flow and sequences](../compute-diagrams.md) · [Explanation](../compute.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
