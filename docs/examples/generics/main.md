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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

`Formatter` is provided by [`TextFormatter`](types.md#symbol-TextFormatter). The same instance is shared.

### Startup

It sets `formatter` to the instance provided for `Formatter`. It prints [`formatter.title`](types.md#symbol-Formatter.title). It prints [`formatter.format`](types.md#symbol-Formatter.format) for `int` with `value` `42`. It sets `box` to a [`Box`](types.md#symbol-Box) for `string` with `value` `"inside a generic box"`.

It prints [`box.get`](types.md#symbol-Box.get).

### Dependencies

It uses [`Box`](types.md#symbol-Box) ([`get`](types.md#symbol-Box.get)), [`Formatter`](types.md#symbol-Formatter) ([`format`](types.md#symbol-Formatter.format) and [`title`](types.md#symbol-Formatter.title)), and [`TextFormatter`](types.md#symbol-TextFormatter) from `types`. These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
