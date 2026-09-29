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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Register 1 dependency provider before startup.
- Run 4 other startup steps in source order.

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Reuse one instance.

### Startup, in source order

- Set `first` of type [`Resource`](resource.md#symbol-Resource) to call [`make`](resource.md#symbol-make).
- This variable owns the value.
- Call [`consume`](resource.md#symbol-consume) with `value` = `first`; inject `console` from `Console`.
- Set `second` of type [`Resource`](resource.md#symbol-Resource) to call [`make`](resource.md#symbol-make).
- This variable owns the value.
- Call `print` with `value` = `"end of main"`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Class from `august.io`.

Used as a type or provider.

#### [`Resource`](resource.md#symbol-Resource)

Class from `resource`.

Used as a type or provider.

#### [`consume`](resource.md#symbol-consume)

Function from `resource`.

- [`consume`](resource.md#symbol-consume) (`value`: [`Resource`](resource.md#symbol-Resource)) → `void`; inject `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console); uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`make`](resource.md#symbol-make)

Function from `resource`.

- [`make`](resource.md#symbol-make) (no caller inputs) → [`Resource`](resource.md#symbol-Resource).

### Built-in operations used by this file

- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
