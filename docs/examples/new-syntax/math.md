---
title: "math.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/math.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `math.aug`

[Labeled calls and injection](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`console.aug`](console.md)
- [`greeter.aug`](greeter.md)
- [`logger.aug`](logger.md)
- [`math.aug`](math.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "math.aug.md" explains this file. Read it before changes; refresh with aug spec.
increment(int value) returns int:
    return value + 1
```

```aug [Braces]
// aug-spec: "math.aug.md" explains this file. Read it before changes; refresh with aug spec.
increment(int value) returns int {
    return value + 1
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-increment"></a>
### `increment` · [source](math.md#code)

It takes `value` as an integer. It returns `value` plus `1`.

::::

:::::
