---
title: "main.aug · GPU workers"
generated: true
source: "examples/native-gpu/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[GPU workers](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`compute.aug`](compute.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from compute
import GpuError from "https://github.com/GreenPandaStudios/aug-gpu#v0.1.1"
try:
    scope:
        first = start worker calculate(left=[1.0, 2.0, 3.0], right=[4.0, 5.0, 6.0])
        second = start worker calculate(left=[10.0, 20.0], right=[1.0, 2.0])
        (firstResult, secondResult) = wait for first and second
        for value in firstResult:
            print(value)
        for value in secondResult:
            print(value)
catch GpuError error:
    print(value=error.explain())
    exit(status=1)
catch ConcurrencyError error:
    print(value="Worker capacity is exhausted")
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from compute
import GpuError from "https://github.com/GreenPandaStudios/aug-gpu#v0.1.1"
try {
    scope {
        first = start worker calculate(left=[1.0, 2.0, 3.0], right=[4.0, 5.0, 6.0])
        second = start worker calculate(left=[10.0, 20.0], right=[1.0, 2.0])
        (firstResult, secondResult) = wait for first and second
        for value in firstResult {
            print(value)
        }
        for value in secondResult {
            print(value)
        }
    }
}
catch GpuError error {
    print(value=error.explain())
    exit(status=1)
}
catch ConcurrencyError error {
    print(value="Worker capacity is exhausted")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

Within a task and ownership scope, it sets `first` to a worker task running [`calculate`](compute.md#symbol-calculate) with `left` from a list containing `1.0`, `2.0`, `3.0` and `right` from a list containing `4.0`, `5.0`, `6.0` with copies of its inputs on a separate heap. It sets `second` to a worker task running [`calculate`](compute.md#symbol-calculate) with `left` from a list containing `10.0`, `20.0` and `right` from a list containing `1.0`, `2.0` with copies of its inputs on a separate heap. It splits the result of waiting for `first` and `second` in input order; propagate failures into `firstResult` and `secondResult` in order. For each `value` in a snapshot of `firstResult`, it prints `value`. [source](main.md#code)

After the loop, for each `value` in a snapshot of `secondResult`, it prints `value`. On leaving this scope, join its child tasks and release its local values. If this work raises [`GpuError`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/contracts.md#symbol-GpuError) as `error`, it prints [`error.explain`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/contracts.md#symbol-GpuError.explain); then it calls `exit` with `status` `1`. If this work raises `ConcurrencyError`, it prints `"Worker capacity is exhausted"`. [source](main.md#code)

### Dependencies

It uses [`GpuError`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/contracts.md#symbol-GpuError) ([`explain`](dependencies/packages/%40greenpandastudios/aug-gpu/0.1.1/contracts.md#symbol-GpuError.explain)) from `https://github.com/GreenPandaStudios/aug-gpu#v0.1.1`. It uses [`calculate`](compute.md#symbol-calculate) from `compute`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
