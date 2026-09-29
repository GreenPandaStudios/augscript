---
title: "native.aug · A native C boundary"
generated: true
source: "examples/ffi/native.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `native.aug`

[A native C boundary](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`native.aug`](native.md)

:::

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `puts` {#symbol-puts}

[source](native.md#code)

**Inputs and dependencies**

- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `c_int`.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.

### `announce` {#symbol-announce}

[source](native.md#code)

Result: finish without a result.

Capabilities: `C.puts`.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Call [`puts`](native.md#symbol-puts) with `message` set to `"hello from C FFI"`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
