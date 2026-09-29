---
title: "main.aug · A native C boundary"
generated: true
source: "examples/ffi/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[A native C boundary](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`native.aug`](native.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
import announce from native
announce()
```

```aug [Braces]
import announce from native
announce()
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

- Call [`announce`](native.md#symbol-announce).

### Dependencies

- [`announce`](native.md#symbol-announce) (no caller inputs) → `void` from `native`.

::::

:::::
