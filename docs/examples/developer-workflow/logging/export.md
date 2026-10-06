---
title: "logging/export.aug · A small tested application"
generated: true
source: "examples/developer-workflow/logging/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logging/export.aug`

[A small tested application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`calculator.aug`](../calculator.md)
- [`logging/console.aug`](console.md)
- [`logging/export.aug`](export.md)
- [`logging/logger.aug`](logger.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMzk4MWYwOTQ3NGUwMDc4MGNlZjA4MTEzZTNjM2U1YzAwYTAxMTE5MTE5YzJjNTkzYTE0ZTJkZjliYThlMjM0MSIsImZvcm1hdHRlZFNoYTI1NiI6IjM5ZGZmNmZkYzgxN2RlYmU4NzJlODczM2ExMGY3ODM1OWNjMjgxOTgzMmNlZGRlNTQyMTg5MWVjODUzMGViODQiLCJsaW5rcyI6W119
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export Logger from logger
export ConsoleLogger from console
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMzk4MWYwOTQ3NGUwMDc4MGNlZjA4MTEzZTNjM2U1YzAwYTAxMTE5MTE5YzJjNTkzYTE0ZTJkZjliYThlMjM0MSIsImZvcm1hdHRlZFNoYTI1NiI6IjM5ZGZmNmZkYzgxN2RlYmU4NzJlODczM2ExMGY3ODM1OWNjMjgxOTgzMmNlZGRlNTQyMTg5MWVjODUzMGViODQiLCJsaW5rcyI6W119
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export Logger from logger
export ConsoleLogger from console
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](export-diagrams.md)

### Exports

Export the declaration `Logger` from [`logger.aug`](logger.md#symbol-Logger). Export the declaration `ConsoleLogger` from [`console.aug`](console.md#symbol-ConsoleLogger).

::::

:::::
