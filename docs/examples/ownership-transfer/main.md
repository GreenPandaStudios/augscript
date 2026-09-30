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

Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance.

### Startup

It sets `first` of type [`Resource`](resource.md#symbol-Resource) to the value from [`make`](resource.md#symbol-make). `first` of type [`Resource`](resource.md#symbol-Resource) owns this value. It calls [`consume`](resource.md#symbol-consume) (`value` set to `first`) using `Console` for `console`. It sets `second` of type [`Resource`](resource.md#symbol-Resource) to the value from [`make`](resource.md#symbol-make). `second` of type [`Resource`](resource.md#symbol-Resource) owns this value. It calls `print` (`value` set to `"end of main"`).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`. The file uses [`Resource`](resource.md#symbol-Resource) from `resource`. [`consume`](resource.md#symbol-consume) from `resource` takes `value` as [`Resource`](resource.md#symbol-Resource) with ownership transferred. It returns no value. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). [`make`](resource.md#symbol-make) from `resource` takes no caller inputs. It returns ownership of [`Resource`](resource.md#symbol-Resource).

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
