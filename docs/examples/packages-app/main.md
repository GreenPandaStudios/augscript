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

It prints [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) with `left` `20` and `right` `22`.

### Dependencies

It uses [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) from `math`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
