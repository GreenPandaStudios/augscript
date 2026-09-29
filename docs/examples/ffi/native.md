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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`puts`](native.md#symbol-puts) is a function returning `c_int`.
- [`announce`](native.md#symbol-announce) is a function.

### `puts` {#symbol-puts}

[source](native.md#code)

**Inputs**

- `message` (`string`) — required labeled input.

Returns: `c_int`.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### `announce` {#symbol-announce}

[source](native.md#code)

Returns: no value.

Capabilities: `C.puts`.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Call [`puts`](native.md#symbol-puts) with `message` = `"hello from C FFI"`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
