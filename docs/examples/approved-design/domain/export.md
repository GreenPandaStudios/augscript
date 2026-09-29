---
title: "domain/export.aug · Modules and composition"
generated: true
source: "examples/approved-design/domain/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `domain/export.aug`

[Modules and composition](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`counters.aug`](../counters.md)
- [`domain/app.aug`](app.md)
- [`domain/export.aug`](export.md)
- [`domain/models.aug`](models.md)
- [`domain/numbers.aug`](numbers.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
export Application from app
export ApplicationImpl from app
export Fruit from models
export double from numbers
export RangeError from numbers
```

```aug [Braces]
export Application from app
export ApplicationImpl from app
export Fruit from models
export double from numbers
export RangeError from numbers
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Folder exports

- Export the declaration `Application` from [`app.aug`](app.md#symbol-Application).
- Export the declaration `ApplicationImpl` from [`app.aug`](app.md#symbol-ApplicationImpl).
- Export the declaration `Fruit` from [`models.aug`](models.md#symbol-Fruit).
- Export the declaration `double` from [`numbers.aug`](numbers.md#symbol-double).
- Export the declaration `RangeError` from [`numbers.aug`](numbers.md#symbol-RangeError).


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
