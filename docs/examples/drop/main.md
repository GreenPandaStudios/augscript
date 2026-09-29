---
title: "main.aug · Resource cleanup"
generated: true
source: "examples/drop/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[Resource cleanup](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import Resource from resource
own Resource resource = Resource()
print(value="using resource")
```

```aug [Braces]
import Resource from resource
own Resource resource = Resource()
print(value="using resource")
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Resource`](resource.md#symbol-Resource)

Available from `resource`.

Class. Follow the linked specification for its full explanation.

**Construction**

Result: [`Resource`](resource.md#symbol-Resource).

### Built-in operations used by this file

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Startup, in source order

- Set `resource` of type [`Resource`](resource.md#symbol-Resource) to the result of call [`Resource`](resource.md#symbol-Resource). This variable owns the value.
- Call `print` with `value` set to `"using resource"`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
