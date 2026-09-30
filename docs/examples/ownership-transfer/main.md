---
title: "main.aug · Move ownership"
generated: true
source: "examples/ownership-transfer/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Move ownership](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Resource from resource
import make from resource
import consume from resource
own Resource first = make()
consume(value=first)
own Resource second = make()
print(value="end of main")
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Resource from resource
import make from resource
import consume from resource
own Resource first = make()
consume(value=first)
own Resource second = make()
print(value="end of main")
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Providers

`Console` is provided by [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole). The same instance is shared.

### Startup

It gets `first` of type [`Resource`](resource.md#symbol-Resource) from [`make`](resource.md#symbol-make). `first` of type [`Resource`](resource.md#symbol-Resource) owns this value. It calls [`consume`](resource.md#symbol-consume) with `value` from `first` using injected `Console` for `console`. It gets `second` of type [`Resource`](resource.md#symbol-Resource) from [`make`](resource.md#symbol-make).

`second` of type [`Resource`](resource.md#symbol-Resource) owns this value. It prints `"end of main"`.

### Dependencies

It uses [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`Resource`](resource.md#symbol-Resource), [`consume`](resource.md#symbol-consume), and [`make`](resource.md#symbol-make) from `resource`. These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
