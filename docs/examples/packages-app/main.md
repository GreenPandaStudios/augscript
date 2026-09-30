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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import add from math
print(value=add(left=20, right=22))
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import add from math
print(value=add(left=20, right=22))
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It calls `print` (`value` set to the value from [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) (`left` set to `20` and `right` set to `22`)).

### Dependencies

[`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) from `math` takes `left` and `right` as `int`. It returns `int`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
