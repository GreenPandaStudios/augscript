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
    n0["_TensorContainer"]
    n1["_TensorHolder"]
    n2["sum"]
    n3["Tensor"]
    n1 -->|"implements"| n0
    n1 -->|"calls"| n2
    n1 -->|"holds item"| n3
```

::: details Call relationships

```mermaid
flowchart TD
    n0["_TensorHolder.total"]
    n1["_add"]
    n2["_consumeAndFail"]
    n3["_sum"]
    n4["_tensor"]
    n5["_values"]
    n6["add"]
    n7["sum"]
    n8["tensor"]
    n9["values"]
    n10["TensorError"]
    n0 -->|"calls"| n7
    n2 -->|"calls"| n10
    n6 -->|"calls"| n1
    n7 -->|"calls"| n3
    n8 -->|"calls"| n4
    n9 -->|"calls"| n5
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_tensor {#sequence-_tensor}

::: spec-paragraph specification-paragraph-1
[Source](api.md#source-L5)
:::

May leave with checked errors: TensorError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_add {#sequence-_add}

::: spec-paragraph specification-paragraph-2
[Source](api.md#source-L6)
:::

May leave with checked errors: TensorError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_sum {#sequence-_sum}

::: spec-paragraph specification-paragraph-3
[Source](api.md#source-L7)
:::

May leave with checked errors: TensorError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_values {#sequence-_values}

::: spec-paragraph specification-paragraph-4
[Source](api.md#source-L8)
:::

May leave with checked errors: TensorError. Native implementation; only the declared contract is known. [Explanation](api.md).

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
    p0->>p1: _tensor(values=values) · native boundary
    p1-->>p0: Tensor
    Note over p0: Return _tensor(values)； required cleanup runs before exit
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
    p0->>p1: _add(left=left, right=right) · native boundary
    p1-->>p0: Tensor
    Note over p0: Return _add(left, right)； required cleanup runs before exit
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
    p0->>p1: _sum(tensor=tensor) · native boundary
    p1-->>p0: float
    Note over p0: Return _sum(tensor)； required cleanup runs before exit
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
    p0->>p1: _values(tensor=tensor) · native boundary
    p1-->>p0: List‹float›
    Note over p0: Return _values(tensor)； required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: TensorError
```

### \_liveTensors {#sequence-_liveTensors}

::: spec-paragraph specification-paragraph-9
[Source](api.md#source-L26)
:::

Native implementation; only the declared contract is known. [Explanation](api.md).

### \_liveBuffers {#sequence-_liveBuffers}

::: spec-paragraph specification-paragraph-10
[Source](api.md#source-L27)
:::

Native implementation; only the declared contract is known. [Explanation](api.md).

### \_consumeAndFail {#sequence-_consumeAndFail}

::: spec-paragraph specification-paragraph-11
[Source](api.md#source-L29)
:::

```mermaid
sequenceDiagram
    participant p0 as _consumeAndFail
    participant p1 as TensorError
    p0->>p1: TensorError(code=99, message=”expected cleanup test”)
    p1-->>p0: TensorError
    Note over p0: Raise checked failure TensorError(code=99, message=”expected cleanup test”)； required cleanup runs before exit
    Note over p0: May leave with checked errors: TensorError
```

### \_TensorContainer.total {#sequence-_TensorContainer.total}

::: spec-paragraph specification-paragraph-12
[Source](api.md#source-L33)
:::

May leave with checked errors: TensorError. Interface contract; implementation selected at runtime. [Explanation](api.md).

### \_TensorHolder constructor {#sequence-_TensorHolder-20-constructor}

::: spec-paragraph specification-paragraph-13
[Source](api.md#source-L34)
:::

Receive fields: item. [Explanation](api.md).

### \_TensorHolder.total {#sequence-_TensorHolder.total}

::: spec-paragraph specification-paragraph-14
[Source](api.md#source-L35)
:::

```mermaid
sequenceDiagram
    participant p0 as _TensorHolder.total
    participant p1 as sum
    p0->>p1: sum(tensor=item)
    p1-->>p0: float
    Note over p0: Return sum(tensor=item)； required cleanup runs before exit
    Note over p0: May leave with checked errors: TensorError
```

### \_replace {#sequence-_replace}

::: spec-paragraph specification-paragraph-15
[Source](api.md#source-L37)
:::

[Explanation](api.md).

## Called contracts

- [\_TensorContainer](api-diagrams.md) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [\_add](api-diagrams.md#sequence-_add) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [\_sum](api-diagrams.md#sequence-_sum) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [\_tensor](api-diagrams.md#sequence-_tensor) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [\_values](api-diagrams.md#sequence-_values) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [sum](api-diagrams.md#sequence-sum) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [TensorError](contracts-diagrams.md#sequence-TensorError-20-constructor) — package/@greenpandastudios/aug-pytorch@0.1.6/contracts.aug
