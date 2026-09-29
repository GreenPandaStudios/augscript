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

```aug [Indentation]
export Logger from logger
export ConsoleLogger from console
```

```aug [Braces]
export Logger from logger
export ConsoleLogger from console
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Export `Logger` from this folder.
- Export `ConsoleLogger` from this folder.

### Folder exports

- Export the declaration `Logger` from [`logger.aug`](logger.md#symbol-Logger).
- Export the declaration `ConsoleLogger` from [`console.aug`](console.md#symbol-ConsoleLogger).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
