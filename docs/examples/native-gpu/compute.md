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
import Device and Buffer and openDevice and upload and add and download from "https://github.com/GreenPandaStudios/aug-gpu#v0.1.0"
/** Add two lists on a GPU and return copied values. GPU resources stay local. */
calculate(List<float> left, List<float> right) returns List<float>:
    own Device device = openDevice()
    own Buffer first = upload(device, values=left)
    own Buffer second = upload(device, values=right)
    own Buffer result = add(left=first, right=second)
    return download(buffer=result)
```

```aug [Braces]
// aug-spec: "compute.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Device and Buffer and openDevice and upload and add and download from "https://github.com/GreenPandaStudios/aug-gpu#v0.1.0"
/** Add two lists on a GPU and return copied values. GPU resources stay local. */
calculate(List<float> left, List<float> right) returns List<float> {
    own Device device = openDevice()
    own Buffer first = upload(device, values=left)
    own Buffer second = upload(device, values=right)
    own Buffer result = add(left=first, right=second)
    return download(buffer=result)
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `calculate` · [source](compute.md#code) {#symbol-calculate}

Add two lists on a GPU and return copied values. GPU resources stay local. It takes `left` and `right` as `List<float>`. Failures can raise `GpuError`.

It calls [`openDevice`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/api.md#symbol-openDevice) and stores the result in owned `device` ([`Device`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/bindings.md#symbol-Device)). It calls [`upload`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/api.md#symbol-upload) with `device` and `values` from `left` and stores the result in owned `first` ([`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/bindings.md#symbol-Buffer)). It calls [`upload`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/api.md#symbol-upload) with `device` and `values` from `right` and stores the result in owned `second` ([`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/bindings.md#symbol-Buffer)). It calls [`add`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/api.md#symbol-add) with `left` from `first` and `right` from `second` and stores the result in owned `result` ([`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/bindings.md#symbol-Buffer)).

It returns [`download`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/api.md#symbol-download) with `buffer` from `result`.

### Dependencies

It uses [`add`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/api.md#symbol-add), [`download`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/api.md#symbol-download), [`openDevice`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/api.md#symbol-openDevice), [`upload`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/api.md#symbol-upload), [`Buffer`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/bindings.md#symbol-Buffer), and [`Device`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/bindings.md#symbol-Device) from `https://github.com/GreenPandaStudios/aug-gpu#v0.1.0`. It uses [`GpuError`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.0/contracts.md#symbol-GpuError).

::::

:::::
