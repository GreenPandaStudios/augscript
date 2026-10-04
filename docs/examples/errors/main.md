---
title: "main.aug · Checked failures"
generated: true
source: "examples/errors/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Checked failures](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`errors.aug`](errors.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import load from errors
try:
    print(value=load(fail=true))
catch FileError error:
    print(value="caught FileError")
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import load from errors
try {
    print(value=load(fail=true))
}
catch FileError error {
    print(value="caught FileError")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It prints [`load`](errors.md#symbol-load) with `fail` `true`. If this work raises `FileError`, it prints `"caught FileError"`.

### Dependencies

It uses [`load`](errors.md#symbol-load) from `errors`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
