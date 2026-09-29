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
import load from errors
try:
    print(value=load(fail=true))
catch FileError error:
    print(value="caught FileError")
```

```aug [Braces]
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

- Try:
  - Call `print` with `value` as the result of [`load`](errors.md#symbol-load) with `fail` as `true`.
- Catch `FileError` as `error`:
  - Call `print` with `value` as `"caught FileError"`.

### Dependencies

- [`load`](errors.md#symbol-load) (`fail`: `bool`) → `string`; can fail with `FileError` from `errors`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
