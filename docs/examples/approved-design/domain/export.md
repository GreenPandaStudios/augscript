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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMDhjZTU1ZWM2MzViM2QxZmRhMTE5NjdiZGZjNGY3YWFhNjA1ZDgxYmQ0ZGQxZDY1NTBkZWI4MWIzOGFkODU1MyIsImZvcm1hdHRlZFNoYTI1NiI6ImYyMDI3MzJmM2E5ZTZmYzI0NmZmOWUwYWVhZDYyYWMyOTM0MDM5Nzc1ODJlMGJhOThkZTNlYTUwYThmYmUwZWEiLCJsaW5rcyI6W119
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export Application from app
export ApplicationImpl from app
export Fruit from models
export double from numbers
export RangeError from numbers
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMDhjZTU1ZWM2MzViM2QxZmRhMTE5NjdiZGZjNGY3YWFhNjA1ZDgxYmQ0ZGQxZDY1NTBkZWI4MWIzOGFkODU1MyIsImZvcm1hdHRlZFNoYTI1NiI6ImYyMDI3MzJmM2E5ZTZmYzI0NmZmOWUwYWVhZDYyYWMyOTM0MDM5Nzc1ODJlMGJhOThkZTNlYTUwYThmYmUwZWEiLCJsaW5rcyI6W119
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

[Interactions and sequences](export-diagrams.md)

### Exports

Export the declaration `Application` from [`app.aug`](app.md#symbol-Application). Export the declaration `ApplicationImpl` from [`app.aug`](app.md#symbol-ApplicationImpl). Export the declaration `Fruit` from [`models.aug`](models.md#symbol-Fruit). Export the declaration `double` from [`numbers.aug`](numbers.md#symbol-double).

Export the declaration `RangeError` from [`numbers.aug`](numbers.md#symbol-RangeError).

::::

:::::
