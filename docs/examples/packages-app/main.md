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

### Startup

- Call `print` with `value` as the result of [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) with `left` as `20`, `right` as `22`.

### Dependencies

- [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) (`left`: `int`, `right`: `int`) → `int` from `math`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
