---
title: "tensors.aug · CPU tensors with PyTorch"
generated: true
source: "examples/native-pytorch/tensors.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `tensors.aug`

[CPU tensors with PyTorch](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`tensors.aug`](tensors.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "tensors.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Tensor and TensorError and tensor and add and sum and values from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.4"
/** Add two CPU tensors using LibTorch and return the sum of their elements. */
calculate() returns float unless TensorError:
    own Tensor left = tensor(values=[1.0, 2.0, 3.0])
    own Tensor right = tensor(values=[4.0, 5.0, 6.0])
    own Tensor result = add(left, right)
    return sum(tensor=result)
test calculate:
    when "cpu":
        it "adds_and_reads_real_tensors":
            own Tensor left = tensor(values=[1.0, 2.0, 3.0])
            own Tensor right = tensor(values=[4.0, 5.0, 6.0])
            own Tensor result = add(left, right)
            List<float> output = values(tensor=result)
            assert(output.length() == 3)
            assert(output.get(index=0) == 5.0)
            assert(output.get(index=1) == 7.0)
            assert(output.get(index=2) == 9.0)
            assert(sum(tensor=result) == 21.0)
            assert(calculate() == 21.0)
```

```aug [Braces]
// aug-spec: "tensors.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Tensor and TensorError and tensor and add and sum and values from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.4"
/** Add two CPU tensors using LibTorch and return the sum of their elements. */
calculate() returns float unless TensorError {
    own Tensor left = tensor(values=[1.0, 2.0, 3.0])
    own Tensor right = tensor(values=[4.0, 5.0, 6.0])
    own Tensor result = add(left, right)
    return sum(tensor=result)
}
test calculate {
    when "cpu" {
        it "adds_and_reads_real_tensors" {
            own Tensor left = tensor(values=[1.0, 2.0, 3.0])
            own Tensor right = tensor(values=[4.0, 5.0, 6.0])
            own Tensor result = add(left, right)
            List<float> output = values(tensor=result)
            assert(output.length() == 3)
            assert(output.get(index=0) == 5.0)
            assert(output.get(index=1) == 7.0)
            assert(output.get(index=2) == 9.0)
            assert(sum(tensor=result) == 21.0)
            assert(calculate() == 21.0)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `calculate` · [source](tensors.md#code) {#symbol-calculate}

Add two CPU tensors using LibTorch and return the sum of their elements. Failures can raise [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/contracts.md#symbol-TensorError).

It calls [`tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-tensor) with `values` from a list containing `1.0`, `2.0`, `3.0` and stores the result in owned `left` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/bindings.md#symbol-Tensor)). It calls [`tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-tensor) with `values` from a list containing `4.0`, `5.0`, `6.0` and stores the result in owned `right` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/bindings.md#symbol-Tensor)). It calls [`add`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-add) with `left` and `right` and stores the result in owned `result` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/bindings.md#symbol-Tensor)). It returns [`sum`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-sum) with `tensor` from `result`.

### `test calculate` · [source](tensors.md#code) {#symbol-test-20-calculate}

Tests [`calculate`](tensors.md#symbol-calculate). Each case gets fresh setup and dependencies.

#### `cpu`

##### `adds_and_reads_real_tensors` · [source](tensors.md#code)

It calls [`tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-tensor) with `values` from a list containing `1.0`, `2.0`, `3.0` and stores the result in owned `left` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/bindings.md#symbol-Tensor)). It calls [`tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-tensor) with `values` from a list containing `4.0`, `5.0`, `6.0` and stores the result in owned `right` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/bindings.md#symbol-Tensor)). It calls [`add`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-add) with `left` and `right` and stores the result in owned `result` ([`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/bindings.md#symbol-Tensor)). It sets `output` of type `List<float>` to [`values`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-values) with `tensor` from `result`.

The test requires the number of elements in `output` equals `3`. The test requires the item at index `0` in `output` equals `5.0`. The test requires the item at index `1` in `output` equals `7.0`. The test requires the item at index `2` in `output` equals `9.0`.

The test requires [`sum`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-sum) with `tensor` from `result` equals `21.0`. The test requires [`calculate`](tensors.md#symbol-calculate) equals `21.0`.

### Dependencies

It uses [`add`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-add), [`sum`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-sum), [`tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-tensor), [`values`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/api.md#symbol-values), [`Tensor`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/bindings.md#symbol-Tensor), and [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.4/contracts.md#symbol-TensorError) from `https://github.com/GreenPandaStudios/aug-pytorch#v0.1.4`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
