---
title: "app/export.aug · Hello world with dependencies"
generated: true
source: "examples/hello/app/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `app/export.aug`

[Hello world with dependencies](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`app/export.aug`](export.md)
- [`app/greeter.aug`](greeter.md)
- [`logging/console.aug`](../logging/console.md)
- [`logging/export.aug`](../logging/export.md)
- [`logging/logger.aug`](../logging/logger.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYTZmZGZlMDcyYTY1NjI1Y2I0NzUxOTQwMDYzZTFmMzMwNGU4ZDgzMjRmYjIyZTg0ODA3NmVmNmQ3OWRhN2Y2NyIsImZvcm1hdHRlZFNoYTI1NiI6ImUzZTBmM2MzM2Y1ZTU3MTMzOWNkZWI0NzgyOGU4NmUxODk5YzkzMTIyYmE3Y2UxOWI0M2VmOTE5NjJlMDk1NzMiLCJsaW5rcyI6W119
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export Greeter from greeter
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYTZmZGZlMDcyYTY1NjI1Y2I0NzUxOTQwMDYzZTFmMzMwNGU4ZDgzMjRmYjIyZTg0ODA3NmVmNmQ3OWRhN2Y2NyIsImZvcm1hdHRlZFNoYTI1NiI6ImUzZTBmM2MzM2Y1ZTU3MTMzOWNkZWI0NzgyOGU4NmUxODk5YzkzMTIyYmE3Y2UxOWI0M2VmOTE5NjJlMDk1NzMiLCJsaW5rcyI6W119
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export Greeter from greeter
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Exports

Export the declaration `Greeter` from [`greeter.aug`](greeter.md#symbol-Greeter).

::::

:::::
