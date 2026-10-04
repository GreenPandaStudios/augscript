---
title: "main.aug · Task scheduling benchmark"
generated: true
source: "benchmarks/tasks/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import compute from operations
int iterations = 2000
int index = 0
int checksum = 0
while index < iterations:
    scope:
        first = start compute(value=index)
        second = start compute(value=index + 1)
        (left, right) = wait for first and second
        checksum = checksum + left + right
    index = index + 1
print(value=checksum)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import compute from operations
int iterations = 2000
int index = 0
int checksum = 0
while index < iterations {
    scope {
        first = start compute(value=index)
        second = start compute(value=index + 1)
        (left, right) = wait for first and second
        checksum = checksum + left + right
    }
    index = index + 1
}
print(value=checksum)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `iterations` to `2000`. It sets `index` and `checksum` separately, each to `0`. While `index` is less than `iterations`, within a task and ownership scope, it sets `first` to a child task running [`compute`](operations.md#symbol-compute) with `value` from `index` with its inputs captured now. It sets `second` to a child task running [`compute`](operations.md#symbol-compute) with `value` from `index` plus `1` with its inputs captured now.

It splits the result of waiting for `first` and `second` in input order; propagate failures into `left` and `right` in order. It sets `checksum` to (`checksum` plus `left`) plus `right`. On leaving this scope, join its child tasks and release its local values. It increases `index` by `1`.

After the loop, it prints `checksum`.

### Dependencies

It uses [`compute`](operations.md#symbol-compute) from `operations`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
