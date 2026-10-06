---
title: "package/@greenpandastudios/aug-pytorch@0.1.6/api.aug diagrams"
generated: true
source: "examples/native-pytorch/.aug-spec/packages/@greenpandastudios/aug-pytorch/0.1.6/api.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@greenpandastudios/aug-pytorch@0.1.6/api.aug diagrams

[CPU tensors with PyTorch](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](api.md)

## Class interactions

```mermaid
flowchart TD
    n0["_TensorContainer · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n1["_TensorHolder · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n2["_consumeAndFail · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n3["sum · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n4["Tensor · package/@greenpandastudios/aug-pytorch@0.1.6/bindings.aug"]
    n5["TensorError · package/@greenpandastudios/aug-pytorch@0.1.6/contracts.aug"]
    n1 -->|"implements"| n0
    n1 -->|"calls"| n3
    n1 -->|"holds item"| n4
    n2 -->|"calls"| n5
```

## API calls

```mermaid
flowchart TD
    n0["_TensorContainer.total · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n1["_TensorHolder.total · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n2["_add · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n3["_consumeAndFail · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n4["_liveBuffers · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n5["_liveTensors · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n6["_replace · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n7["_sum · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n8["_tensor · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n9["_values · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n10["add · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n11["sum · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n12["tensor · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n13["values · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n14["TensorError · package/@greenpandastudios/aug-pytorch@0.1.6/contracts.aug"]
    n1 -->|"calls"| n11
    n3 -->|"calls"| n14
    n10 -->|"calls"| n2
    n11 -->|"calls"| n7
    n12 -->|"calls"| n8
    n13 -->|"calls"| n9
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_tensor {#sequence-_tensor}

::: spec-paragraph specification-paragraph-1
[Source](api.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as _tensor

    Note over p0: May leave with checked errors: TensorError
    Note over p0: Native implementation#59; only the declared contract is known
```

### \_add {#sequence-_add}

::: spec-paragraph specification-paragraph-2
[Source](api.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as _add

    Note over p0: May leave with checked errors: TensorError
    Note over p0: Native implementation#59; only the declared contract is known
```

### \_sum {#sequence-_sum}

::: spec-paragraph specification-paragraph-3
[Source](api.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as _sum

    Note over p0: May leave with checked errors: TensorError
    Note over p0: Native implementation#59; only the declared contract is known
```

### \_values {#sequence-_values}

::: spec-paragraph specification-paragraph-4
[Source](api.md#source-L8)
:::

```mermaid
sequenceDiagram
    participant p0 as _values

    Note over p0: May leave with checked errors: TensorError
    Note over p0: Native implementation#59; only the declared contract is known
```

### tensor {#sequence-tensor}

::: spec-paragraph specification-paragraph-5
[Source](api.md#source-L10)
:::

```mermaid
sequenceDiagram
    participant p0 as tensor
    participant p1 as _tensor
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _tensor(values) · native boundary
    Note over p0: Return _tensor(values)#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: TensorError
```

### add {#sequence-add}

::: spec-paragraph specification-paragraph-6
[Source](api.md#source-L14)
:::

```mermaid
sequenceDiagram
    participant p0 as add
    participant p1 as _add
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _add(left, right) · native boundary
    Note over p0: Return _add(left, right)#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: TensorError
```

### sum {#sequence-sum}

::: spec-paragraph specification-paragraph-7
[Source](api.md#source-L18)
:::

```mermaid
sequenceDiagram
    participant p0 as sum
    participant p1 as _sum
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _sum(tensor) · native boundary
    Note over p0: Return _sum(tensor)#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: TensorError
```

### values {#sequence-values}

::: spec-paragraph specification-paragraph-8
[Source](api.md#source-L22)
:::

```mermaid
sequenceDiagram
    participant p0 as values
    participant p1 as _values
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _values(tensor) · native boundary
    Note over p0: Return _values(tensor)#59; required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: TensorError
```

### \_liveTensors {#sequence-_liveTensors}

::: spec-paragraph specification-paragraph-9
[Source](api.md#source-L26)
:::

```mermaid
sequenceDiagram
    participant p0 as _liveTensors

    Note over p0: Native implementation#59; only the declared contract is known
```

### \_liveBuffers {#sequence-_liveBuffers}

::: spec-paragraph specification-paragraph-10
[Source](api.md#source-L27)
:::

```mermaid
sequenceDiagram
    participant p0 as _liveBuffers

    Note over p0: Native implementation#59; only the declared contract is known
```

### \_consumeAndFail {#sequence-_consumeAndFail}

::: spec-paragraph specification-paragraph-11
[Source](api.md#source-L29)
:::

```mermaid
sequenceDiagram
    participant p0 as _consumeAndFail
    participant p1 as TensorError
    p0->>p1: TensorError(code, message)
    Note over p0: Raise checked failure TensorError(code=99, message=#34;expected cleanup test#34;)#59; required cleanup runs before exit
    Note over p0: May leave with checked errors: TensorError
```

### \_TensorContainer.total {#sequence-_TensorContainer.total}

::: spec-paragraph specification-paragraph-12
[Source](api.md#source-L33)
:::

```mermaid
sequenceDiagram
    participant p0 as _TensorContainer.total

    Note over p0: May leave with checked errors: TensorError
    Note over p0: Interface contract#59; implementation selected at runtime
```

### \_TensorHolder constructor {#sequence-_TensorHolder-20-constructor}

::: spec-paragraph specification-paragraph-13
[Source](api.md#source-L34)
:::

```mermaid
sequenceDiagram
    participant p0 as _TensorHolder constructor

    Note over p0: Receive fields: item
```

### \_TensorHolder.total {#sequence-_TensorHolder.total}

::: spec-paragraph specification-paragraph-14
[Source](api.md#source-L35)
:::

```mermaid
sequenceDiagram
    participant p0 as _TensorHolder.total
    participant p1 as sum
    p0->>p1: sum(tensor)
    Note over p0: Return sum(tensor=item)#59; required cleanup runs before exit
    Note over p0: May leave with checked errors: TensorError
```

### \_replace {#sequence-_replace}

::: spec-paragraph specification-paragraph-15
[Source](api.md#source-L37)
:::

```mermaid
sequenceDiagram
    participant p0 as _replace

    Note over p0: No calls in this operation#59; see the source and specification
```

## Called contracts

- [\_TensorContainer](api-diagrams.md) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [\_add](api-diagrams.md#sequence-_add) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [\_sum](api-diagrams.md#sequence-_sum) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [\_tensor](api-diagrams.md#sequence-_tensor) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [\_values](api-diagrams.md#sequence-_values) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [sum](api-diagrams.md#sequence-sum) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [TensorError](contracts-diagrams.md#sequence-TensorError-20-constructor) — package/@greenpandastudios/aug-pytorch@0.1.6/contracts.aug
