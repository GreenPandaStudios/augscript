---
title: "operations.aug · Function-call benchmark"
generated: true
source: "benchmarks/calls/operations.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `operations.aug`

[Function-call benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`operations.aug`](operations.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
step(int value) returns int:
    int product = value * 48271 + 1
    return product - product / 2147483647 * 2147483647
```

```aug [Braces]
// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
step(int value) returns int {
    int product = value * 48271 + 1
    return product - product / 2147483647 * 2147483647
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `step` · [source](operations.md#code) {#symbol-step}

It takes `value` as an integer. It sets `product` to (`value` times `48271`) plus `1`. It returns `product` minus ((`product` divided by `2147483647`) times `2147483647`).

::::

:::::
