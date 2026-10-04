---
title: "packages/@greenpandastudios/aug-pytorch/0.1.6/bindings.aug · CPU tensors with PyTorch"
generated: true
source: "examples/native-pytorch/.aug-spec/packages/@greenpandastudios/aug-pytorch/0.1.6/bindings.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-pytorch/0.1.6/bindings.aug`

[CPU tensors with PyTorch](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "bindings.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C resource Tensor
```

```aug [Braces]
// aug-spec: "bindings.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C resource Tensor
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Tensor` · native resource · [source](bindings.md#code) {#symbol-Tensor}

Native implementation: `@greenpandastudios/aug-pytorch@0.1.6`, `2.14.1`. Supported targets: linux arm64 glibc 2.36+ itanium-cxx11, linux x64 glibc 2.36+ itanium-cxx11, macos arm64 14.0+ apple-libc++. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `f07b8cab89ad7cfe368edcd9daf87ecc810adb6a2eed1f446d7b71fb664e91f5`). An owned value releases its opaque handle through `aug_torch_tensor_release_v1` when its scope ends, including error and return paths.

::::

:::::
