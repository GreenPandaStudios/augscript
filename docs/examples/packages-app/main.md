---
title: "main.aug · Use a package"
generated: true
source: "examples/packages/app/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[Use a package](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import add from math
print(value=add(left=20, right=22))
```

```aug [Braces]
import add from math
print(value=add(left=20, right=22))
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add)

Available from `math`.

**Inputs and dependencies**

- `left`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `right`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `int`.

### Built-in operations used by this file

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Startup, in source order

- Call `print` with `value` set to the result of call [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) with `left` set to `20`; `right` set to `22`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
