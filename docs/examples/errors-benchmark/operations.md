---
title: "operations.aug · Checked-error benchmark"
generated: true
source: "benchmarks/errors/operations.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `operations.aug`

[Checked-error benchmark](index.md) · Source and specification

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
validate(int value) returns int unless FileError:
    if value - value / 16 * 16 == 0:
        throw FileError()
    return value
```

```aug [Braces]
// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
validate(int value) returns int unless FileError {
    if value - value / 16 * 16 == 0 {
        throw FileError()
    }
    return value
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `validate` · [source](operations.md#code) {#symbol-validate}

It takes `value` as an integer. Failures can raise `FileError`.

It checks that (`value` minus ((`value` divided by `16`) times `16`)) does not equal `0`. It raises a `FileError` at the first failed check. It returns `value`.

::::

:::::
