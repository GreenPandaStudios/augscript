---
title: "domain/export.aug · Modules and composition"
generated: true
source: "examples/approved-design/domain/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

### Exports

- Export the declaration `Application` from [`app.aug`](app.md#symbol-Application).
- Export the declaration `ApplicationImpl` from [`app.aug`](app.md#symbol-ApplicationImpl).
- Export the declaration `Fruit` from [`models.aug`](models.md#symbol-Fruit).
- Export the declaration `double` from [`numbers.aug`](numbers.md#symbol-double).
- Export the declaration `RangeError` from [`numbers.aug`](numbers.md#symbol-RangeError).

::::

:::::
