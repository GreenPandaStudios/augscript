---
title: "main.aug · Generic contracts"
generated: true
source: "examples/generics/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Generic contracts](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`types.aug`](types.md)

:::

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Register 1 dependency provider before startup.
- Run 5 other startup steps in source order.

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`TextFormatter`](types.md#symbol-TextFormatter) when `Formatter` is requested. Reuse one instance.

### Startup, in source order

- Set `formatter` to the instance provided for `Formatter`.
- Call `print` with `value` = call [`Formatter.title`](types.md#symbol-Formatter.title) on `formatter`.
- Call `print` with `value` = call [`Formatter.format`](types.md#symbol-Formatter.format) on `formatter` with type arguments `int` with `value` = `42`.
- Set `box` to call [`Box`](types.md#symbol-Box) with type arguments `string` with `value` = `"inside a generic box"`.
- Call `print` with `value` = call [`Box.get`](types.md#symbol-Box.get) on `box`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Box`](types.md#symbol-Box)

Class from `types`.

- Construct with `value`: `T` → [`Box`](types.md#symbol-Box).
- [`Box.get`](types.md#symbol-Box.get) (no caller inputs) → `T`.

#### [`Formatter`](types.md#symbol-Formatter)

Interface from `types`.

- [`Formatter.format`](types.md#symbol-Formatter.format)<`T`> (`value`: `T`) → `string`.
- [`Formatter.title`](types.md#symbol-Formatter.title) (no caller inputs) → `string`.

#### [`TextFormatter`](types.md#symbol-TextFormatter)

Class from `types`.

Used as a type or provider.

### Built-in operations used by this file

- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
