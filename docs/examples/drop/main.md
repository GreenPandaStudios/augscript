---
title: "main.aug · Resource cleanup"
generated: true
source: "examples/drop/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[Resource cleanup](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import Resource from resource
own Resource resource = Resource()
print(value="using resource")
```

```aug [Braces]
import Resource from resource
own Resource resource = Resource()
print(value="using resource")
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Run 2 other startup steps in source order.

### Startup, in source order

- Set `resource` of type [`Resource`](resource.md#symbol-Resource) to call [`Resource`](resource.md#symbol-Resource).
- This variable owns the value.
- Call `print` with `value` = `"using resource"`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Resource`](resource.md#symbol-Resource)

Class from `resource`.

- Construct with no caller inputs → [`Resource`](resource.md#symbol-Resource).

### Built-in operations used by this file

- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
