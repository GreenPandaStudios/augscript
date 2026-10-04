---
title: "main.aug · Checked-error benchmark"
generated: true
source: "benchmarks/errors/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import validate from operations
int iterations = 20000
int index = 0
int checksum = 0
int failures = 0
while index < iterations:
    try:
        checksum = checksum + validate(value=index)
    catch FileError error:
        failures = failures + 1
    index = index + 1
print(value=checksum)
print(value=failures)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import validate from operations
int iterations = 20000
int index = 0
int checksum = 0
int failures = 0
while index < iterations {
    try {
        checksum = checksum + validate(value=index)
    }
    catch FileError error {
        failures = failures + 1
    }
    index = index + 1
}
print(value=checksum)
print(value=failures)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `iterations` to `20000`. It sets `index`, `checksum`, and `failures` separately, each to `0`. [source](main.md#code)

While `index` is less than `iterations`, it tries to increase `checksum` by [`validate`](operations.md#symbol-validate) with `value` from `index`. If this work raises `FileError`, it increases `failures` by `1`. It increases `index` by `1`. After the loop, it prints `checksum`. [source](main.md#code)

It prints `failures`. [source](main.md#code)

### Dependencies

It uses [`validate`](operations.md#symbol-validate) from `operations`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
