---
title: "operations.aug · Task scheduling benchmark"
generated: true
source: "benchmarks/tasks/operations.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `operations.aug`

[Task scheduling benchmark](index.md) · Source and specification

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
compute(int value) returns int:
    return value * 3 + 1
```

```aug [Braces]
// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
compute(int value) returns int {
    return value * 3 + 1
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `compute` · [source](operations.md#code) {#symbol-compute}

It takes `value` as an integer. It returns (`value` times `3`) plus `1`. [source](operations.md#code)

::: details Checked interface

```text
compute(int value) returns int
```

It takes `value` as an integer.

:::

::::

:::::
