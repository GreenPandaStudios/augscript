---
title: "CPU tensors with PyTorch diagrams"
generated: true
source: "examples/native-pytorch/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# CPU tensors with PyTorch diagrams

[CPU tensors with PyTorch](../index.md)

Start here to see what moves between the application’s folders. Each arrow names an operation’s inputs and the result it returns to its caller. Open a folder for the next level of detail. Expand the contract list for complete types and dependency links.

## Data flow

```mermaid
flowchart TD
    n0["Startup"]
    n1["tensors"]
    n0 -->|"calculate → float"| n1
```

### Package boundaries

::: details tensors package calls

```mermaid
flowchart LR
    n0["url_b05554aeae5c0d02f8f8"]
    n1["tensors"]
    n1 -->|"add(left, right) / sum(tensor) + 2 more → Tensor / float + 1 more"| n0
```

:::

::: details Data crossing these boundaries (5 contracts)

| From | To | Operation and inputs | Result |
| --- | --- | --- | --- |
| Startup | tensors | [calculate](../tensors.md) | float |
| tensors | url\_b05554aeae5c0d02f8f8 | [add](../dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.6/api.md) · left: Tensor, right: Tensor | Tensor |
| tensors | url\_b05554aeae5c0d02f8f8 | [sum](../dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.6/api.md) · tensor: Tensor | float |
| tensors | url\_b05554aeae5c0d02f8f8 | [tensor](../dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.6/api.md) · values: List\<float\> | Tensor |
| tensors | url\_b05554aeae5c0d02f8f8 | [values](../dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.6/api.md) · tensor: Tensor | List\<float\> |

:::

## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |
| tensors.aug | [Flow and sequences](../tensors-diagrams.md) · [Explanation](../tensors.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
