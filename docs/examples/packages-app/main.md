---
title: "main.aug · Use a package"
generated: true
source: "examples/packages/app/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Use a package](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
import add from math
print(value=add(left=20, right=22))
```

```aug [Braces]
import add from math
print(value=add(left=20, right=22))
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Run 1 other startup step in source order.

### Startup, in source order

- Call `print` with `value` = call [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) with `left` = `20`; `right` = `22`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add)

Function from `math`.

- [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) (`left`: `int`, `right`: `int`) → `int`.

### Built-in operations used by this file

- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
