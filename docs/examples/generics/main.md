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

### Providers

- Provide [`TextFormatter`](types.md#symbol-TextFormatter) for `Formatter`. Share one instance.

### Startup

- Set `formatter` to the instance provided for `Formatter`.
- Call `print` with `value` as the result of [`Formatter.title`](types.md#symbol-Formatter.title) on `formatter`.
- Call `print` with `value` as the result of [`Formatter.format`](types.md#symbol-Formatter.format) on `formatter` with type arguments `int` with `value` as `42`.
- Set `box` to a new [`Box`](types.md#symbol-Box) with type arguments `string` with `value` as `"inside a generic box"`.
- Call `print` with `value` as the result of [`Box.get`](types.md#symbol-Box.get) on `box`.

### Dependencies

- [`Box`](types.md#symbol-Box) from `types`: construct with `value`: `T`; [`get`](types.md#symbol-Box.get) (no caller inputs) → `T`.
- [`Formatter`](types.md#symbol-Formatter) from `types`: [`format`](types.md#symbol-Formatter.format)<`T`> (`value`: `T`) → `string`; [`title`](types.md#symbol-Formatter.title) (no caller inputs) → `string`.
- [`TextFormatter`](types.md#symbol-TextFormatter) from `types`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
