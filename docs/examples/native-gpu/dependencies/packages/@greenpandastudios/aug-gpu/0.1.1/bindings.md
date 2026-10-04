---
title: "packages/@greenpandastudios/aug-gpu/0.1.1/bindings.aug · GPU workers"
generated: true
source: "examples/native-gpu/.aug-spec/packages/@greenpandastudios/aug-gpu/0.1.1/bindings.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-gpu/0.1.1/bindings.aug`

[GPU workers](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "bindings.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C resource Device
extern C resource Buffer
```

```aug [Braces]
// aug-spec: "bindings.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C resource Device
extern C resource Buffer
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Device` · native resource · [source](bindings.md#code) {#symbol-Device}

Native implementation: `@greenpandastudios/aug-gpu@0.1.1`, `0.1.0`. Supported targets: macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `d95e237d8be07df8fd20132ca0f5a45a125fd65b7ba93669e69c0a38db63d60c`). An owned value releases its opaque handle through `aug_gpu_device_release_v1` when its scope ends, including error and return paths.

### `Buffer` · native resource · [source](bindings.md#code) {#symbol-Buffer}

Native implementation: `@greenpandastudios/aug-gpu@0.1.1`, `0.1.0`. Supported targets: macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `d95e237d8be07df8fd20132ca0f5a45a125fd65b7ba93669e69c0a38db63d60c`). An owned value releases its opaque handle through `aug_gpu_buffer_release_v1` when its scope ends, including error and return paths.

::::

:::::
