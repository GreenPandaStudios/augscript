---
title: "native.aug · A native C boundary"
generated: true
source: "examples/ffi/native.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `native.aug`

[A native C boundary](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`native.aug`](native.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "native.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C puts(string message) returns c_int
announce():
    unsafe:
        puts(message="hello from C FFI")
```

```aug [Braces]
// aug-spec: "native.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C puts(string message) returns c_int
announce() {
    unsafe {
        puts(message="hello from C FFI")
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `puts` · [source](native.md#code) {#symbol-puts}

It takes `message` as a string. It returns `c_int`. Native C implementation; only its declared contract is visible here.

### `announce` · [source](native.md#code) {#symbol-announce}

Within an unsafe block, it calls [`puts`](native.md#symbol-puts) with `message` `"hello from C FFI"`. Native operations must satisfy their declared C contracts.

::::

:::::
