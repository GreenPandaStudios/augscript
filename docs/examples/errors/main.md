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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Run startup operations with checked error recovery.

### Startup, in source order

- Try these operations:
  - Call `print` with `value` = call [`load`](errors.md#symbol-load) with `fail` = `true`.
- If they fail with `FileError`, name the failure `error` and recover:
  - Call `print` with `value` = `"caught FileError"`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`load`](errors.md#symbol-load)

Function from `errors`.

- [`load`](errors.md#symbol-load) (`fail`: `bool`) → `string`; can fail with `FileError`.

### Built-in operations used by this file

- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
