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

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It prints [`calculate`](../tensors.md#symbol-calculate). If this work raises [`TensorError`](../dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/contracts.md#symbol-TensorError) as `error`, it prints `error.message`. [source](../main.md#source-L5-L8)
:::

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
    n0["@greenpandastudios/aug-pytorch"]
    n1["tensors"]
    n1 -->|"add(left, right) / sum(tensor) + 1 more → float / own Tensor"| n0
```

:::

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| Startup | tensors | 1 | [Inputs, results and call sites](index.md#boundary-79dca6bbff59) |
| tensors | @greenpandastudios/aug-pytorch | 4 | [Inputs, results and call sites](index.md#boundary-ab1b8e2f1416) |

#### Data crossing these boundaries (5 contracts)

#### Startup → tensors {#boundary-79dca6bbff59}

::: details 1 operation, 1 site

**[calculate](../tensors.md#symbol-calculate)**

No caller-supplied inputs. Result: float.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L6) · [Caller explanation](../main.md#startup) |

:::

#### tensors → @greenpandastudios/aug-pytorch {#boundary-ab1b8e2f1416}

::: details 4 operations, 9 sites

**[add](../dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-add)**

Inputs: left: Tensor, right: Tensor. Result: own Tensor.

| Caller or entry | Evidence |
| --- | --- |
| calculate | [Call site](../tensors.md#source-L8) · [Caller explanation](../tensors.md#symbol-calculate) |
| test calculate | [Call site](../tensors.md#source-L16) · [Caller explanation](../tensors.md#symbol-test-20-calculate) |

**[sum](../dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-sum)**

Inputs: tensor: Tensor. Result: float.

| Caller or entry | Evidence |
| --- | --- |
| calculate | [Call site](../tensors.md#source-L9) · [Caller explanation](../tensors.md#symbol-calculate) |
| test calculate | [Call site](../tensors.md#source-L22) · [Caller explanation](../tensors.md#symbol-test-20-calculate) |

**[tensor](../dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-tensor)**

Inputs: values: List\<float\>. Result: own Tensor.

| Caller or entry | Evidence |
| --- | --- |
| calculate | [Call site](../tensors.md#source-L6) · [Caller explanation](../tensors.md#symbol-calculate) |
| calculate | [Call site](../tensors.md#source-L7) · [Caller explanation](../tensors.md#symbol-calculate) |
| test calculate | [Call site](../tensors.md#source-L14) · [Caller explanation](../tensors.md#symbol-test-20-calculate) |
| test calculate | [Call site](../tensors.md#source-L15) · [Caller explanation](../tensors.md#symbol-test-20-calculate) |

**[values](../dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api.md#symbol-values)**

Inputs: tensor: Tensor. Result: List\<float\>.

| Caller or entry | Evidence |
| --- | --- |
| test calculate | [Call site](../tensors.md#source-L17) · [Caller explanation](../tensors.md#symbol-test-20-calculate) |

:::


## Open a module

| Module | Read |
| --- | --- |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |
| tensors.aug | [Flow and sequences](../tensors-diagrams.md) · [Explanation](../tensors.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
