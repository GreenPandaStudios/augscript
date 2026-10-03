---
title: "compute.aug · GPU workers"
generated: true
source: "examples/native-gpu/compute.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `compute.aug`

[GPU workers](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`compute.aug`](compute.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "compute.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Device and Buffer and openDevice and upload and add and download from "https://github.com/GreenPandaStudios/aug-gpu#v0.1.1"
/** Add two lists on a GPU and return copied values. GPU resources stay local. */
calculate(List<float> left, List<float> right) returns List<float>:
    own Device device = openDevice()
    own Buffer first = upload(device, values=left)
    own Buffer second = upload(device, values=right)
    own Buffer result = add(left=first, right=second)
    return download(buffer=result)
test calculate:
    when "native":
        it "copies_the_GPU_result":
            List<float> result = calculate(left=[1.0, 2.0, 3.0], right=[4.0, 5.0, 6.0])
            assert(result.length() == 3)
            assert(result.get(index=0) == 5.0)
            assert(result.get(index=1) == 7.0)
            assert(result.get(index=2) == 9.0)
```

```aug [Braces]
// aug-spec: "compute.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Device and Buffer and openDevice and upload and add and download from "https://github.com/GreenPandaStudios/aug-gpu#v0.1.1"
/** Add two lists on a GPU and return copied values. GPU resources stay local. */
calculate(List<float> left, List<float> right) returns List<float> {
    own Device device = openDevice()
    own Buffer first = upload(device, values=left)
    own Buffer second = upload(device, values=right)
    own Buffer result = add(left=first, right=second)
    return download(buffer=result)
}
test calculate {
    when "native" {
        it "copies_the_GPU_result" {
            List<float> result = calculate(left=[1.0, 2.0, 3.0], right=[4.0, 5.0, 6.0])
            assert(result.length() == 3)
            assert(result.get(index=0) == 5.0)
            assert(result.get(index=1) == 7.0)
            assert(result.get(index=2) == 9.0)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `calculate` · [source](compute.md#code) {#symbol-calculate}

Add two lists on a GPU and return copied values. GPU resources stay local. It takes `left` and `right` as `List<float>`. Failures can raise `GpuError`.

It calls [`openDevice`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md#symbol-openDevice) and stores the result in owned `device` ([`Device`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/bindings.md#symbol-Device)). It calls [`upload`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md#symbol-upload) with `device` and `values` from `left` and stores the result in owned `first` ([`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/bindings.md#symbol-Buffer)). It calls [`upload`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md#symbol-upload) with `device` and `values` from `right` and stores the result in owned `second` ([`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/bindings.md#symbol-Buffer)). It calls [`add`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md#symbol-add) with `left` from `first` and `right` from `second` and stores the result in owned `result` ([`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/bindings.md#symbol-Buffer)).

It returns [`download`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md#symbol-download) with `buffer` from `result`.

### `test calculate` · [source](compute.md#code) {#symbol-test-20-calculate}

Tests [`calculate`](compute.md#symbol-calculate). Each case gets fresh setup and dependencies.

#### `native`

##### `copies_the_GPU_result` · [source](compute.md#code)

It sets `result` of type `List<float>` to [`calculate`](compute.md#symbol-calculate) with `left` from a list containing `1.0`, `2.0`, `3.0` and `right` from a list containing `4.0`, `5.0`, `6.0`. The test requires the number of elements in `result` equals `3`. The test requires the item at index `0` in `result` equals `5.0`. The test requires the item at index `1` in `result` equals `7.0`.

The test requires the item at index `2` in `result` equals `9.0`.

### Dependencies

It uses [`add`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md#symbol-add), [`download`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md#symbol-download), [`openDevice`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md#symbol-openDevice), [`upload`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/api.md#symbol-upload), [`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/bindings.md#symbol-Buffer), and [`Device`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/bindings.md#symbol-Device) from `https://github.com/GreenPandaStudios/aug-gpu#v0.1.1`. It uses [`GpuError`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/contracts.md#symbol-GpuError).

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
