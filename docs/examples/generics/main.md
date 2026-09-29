---
title: "main.aug · Generic contracts"
generated: true
source: "examples/generics/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[Generic contracts](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`types.aug`](types.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import Formatter from types
import TextFormatter from types
import Box from types
implement Formatter with TextFormatter
resolve Formatter to formatter
print(value=formatter.title())
print(value=formatter.format<int>(value=42))
box = Box<string>(value="inside a generic box")
print(value=box.get())
```

```aug [Braces]
import Formatter from types
import TextFormatter from types
import Box from types
implement Formatter with TextFormatter
resolve Formatter to formatter
print(value=formatter.title())
print(value=formatter.format<int>(value=42))
box = Box<string>(value="inside a generic box")
print(value=box.get())
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Box`](types.md#symbol-Box)

Available from `types`.

Class. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`Box`](types.md#symbol-Box).

**[`Box.get`](types.md#symbol-Box.get)**

Result: `T`.

#### [`Formatter`](types.md#symbol-Formatter)

Available from `types`.

Interface. Follow the linked specification for its full explanation.

**[`Formatter.format`](types.md#symbol-Formatter.format)**

Type parameters: `T`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

**[`Formatter.title`](types.md#symbol-Formatter.title)**

Result: `string`.

#### [`TextFormatter`](types.md#symbol-TextFormatter)

Available from `types`.

Class. Follow the linked specification for its full explanation.

### Built-in operations used by this file

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`TextFormatter`](types.md#symbol-TextFormatter) when `Formatter` is requested. Reuse one instance.

### Startup, in source order

- Set `formatter` to the instance provided for `Formatter`.
- Call `print` with `value` set to the result of call [`Formatter.title`](types.md#symbol-Formatter.title) on `formatter`.
- Call `print` with `value` set to the result of call [`Formatter.format`](types.md#symbol-Formatter.format) on `formatter` with type arguments `int` with `value` set to `42`.
- Set `box` to the result of call [`Box`](types.md#symbol-Box) with type arguments `string` with `value` set to `"inside a generic box"`.
- Call `print` with `value` set to the result of call [`Box.get`](types.md#symbol-Box.get) on `box`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
