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
extern C puts(string message) returns c_int
announce() uses C.puts:
    unsafe:
        puts(message="hello from C FFI")
```

```aug [Braces]
extern C puts(string message) returns c_int
announce() uses C.puts {
    unsafe {
        puts(message="hello from C FFI")
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-puts"></a>
### `puts` · [source](native.md#code)

**Inputs:** Take `message` (`string`).

Returns `c_int`.

Native C implementation; only its declared contract is visible here.

<a id="symbol-announce"></a>
### `announce` · [source](native.md#code)

Uses `C.puts`.

- Use native code with its declared contract:
  - Call [`puts`](native.md#symbol-puts) with `message` as `"hello from C FFI"`.

::::

:::::
