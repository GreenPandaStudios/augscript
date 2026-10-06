---
title: "main.aug · Generic types and functions"
generated: true
source: "examples/generics/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Generic types and functions](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`types.aug`](types.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYjJlNmJlNTI5Y2ExMzQ1MGU2OTllMzUyNGYyYTg0Y2E0YTNlNGQ2NTM2NDgyY2EzYmMwODk3NmNjYWI1ZWY3ZSIsImZvcm1hdHRlZFNoYTI1NiI6ImNkYjM4OWMyMTM1N2VjNWJkN2FmM2VkYTVlZmQ3NGIxYTMwMWE3ODBmMDBkYWNmYjZlNjE1MmUwYjE5YTM0MjUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw2LUw5IiwiZmlyc3QiOjYsImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0IjoxMCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfV19
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYjJlNmJlNTI5Y2ExMzQ1MGU2OTllMzUyNGYyYTg0Y2E0YTNlNGQ2NTM2NDgyY2EzYmMwODk3NmNjYWI1ZWY3ZSIsImZvcm1hdHRlZFNoYTI1NiI6ImNkYjM4OWMyMTM1N2VjNWJkN2FmM2VkYTVlZmQ3NGIxYTMwMWE3ODBmMDBkYWNmYjZlNjE1MmUwYjE5YTM0MjUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw2LUw5IiwiZmlyc3QiOjYsImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0IjoxMCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfV19
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

[Interactions and sequences](main-diagrams.md)

### Providers

`Formatter` is provided by [`TextFormatter`](types.md#symbol-TextFormatter). The same instance is shared.

### Startup

::: spec-paragraph specification-paragraph-1
It sets `formatter` to the instance provided for `Formatter`. It prints [`formatter.title`](types.md#symbol-Formatter.title). It prints [`formatter.format`](types.md#symbol-Formatter.format) for `int` with `value` `42`. It sets `box` to a [`Box`](types.md#symbol-Box) for `string` with `value` `"inside a generic box"`. [source](main.md#source-L6-L9)
:::

::: spec-paragraph specification-paragraph-2
It prints [`box.get`](types.md#symbol-Box.get). [source](main.md#source-L10)
:::

### Dependencies

It uses [`Box`](types.md#symbol-Box) ([`get`](types.md#symbol-Box.get)), [`Formatter`](types.md#symbol-Formatter) ([`format`](types.md#symbol-Formatter.format) and [`title`](types.md#symbol-Formatter.title)), and [`TextFormatter`](types.md#symbol-TextFormatter) from `types`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
