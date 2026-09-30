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

Provide [`TextFormatter`](types.md#symbol-TextFormatter) for `Formatter`. Share one instance.

### Startup

It sets `formatter` to the instance provided for `Formatter`. It calls `print` (`value` set to the value from [`Formatter.title`](types.md#symbol-Formatter.title) on `formatter`). It calls `print` (`value` set to the value from [`Formatter.format`](types.md#symbol-Formatter.format) on `formatter` with type arguments `int` (`value` set to `42`)). It sets `box` to a new [`Box`](types.md#symbol-Box) with type arguments `string` (`value` set to `"inside a generic box"`). It calls `print` (`value` set to the value from [`Box.get`](types.md#symbol-Box.get) on `box`).

### Dependencies

The file uses [`Box`](types.md#symbol-Box) from `types`. The type parameters are `T`. Construction takes `value` as `T`. [`get`](types.md#symbol-Box.get) takes no caller inputs. It returns `T`. The file uses [`Formatter`](types.md#symbol-Formatter) from `types`. [`format`](types.md#symbol-Formatter.format) takes `value` as `T`. It returns `string`. The type parameters are `T`. [`title`](types.md#symbol-Formatter.title) takes no caller inputs. It returns `string`. The file uses [`TextFormatter`](types.md#symbol-TextFormatter) from `types`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
