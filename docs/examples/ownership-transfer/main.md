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

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance.

### Startup

- Set `first` of type [`Resource`](resource.md#symbol-Resource) to the result of [`make`](resource.md#symbol-make).
- `first` of type [`Resource`](resource.md#symbol-Resource) owns this value.
- Call [`consume`](resource.md#symbol-consume) with `value` as `first` using `Console` for `console`.
- Set `second` of type [`Resource`](resource.md#symbol-Resource) to the result of [`make`](resource.md#symbol-make).
- `second` of type [`Resource`](resource.md#symbol-Resource) owns this value.
- Call `print` with `value` as `"end of main"`.

### Dependencies

- [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`.
- [`Resource`](resource.md#symbol-Resource) from `resource`.
- [`consume`](resource.md#symbol-consume) (`value`: [`Resource`](resource.md#symbol-Resource)) → `void` from `resource`.
- [`make`](resource.md#symbol-make) (no caller inputs) → [`Resource`](resource.md#symbol-Resource) from `resource`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
