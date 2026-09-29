---
title: "logging/export.aug · Hello world with dependencies"
generated: true
source: "examples/hello/logging/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `logging/export.aug`

[Hello world with dependencies](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`app/export.aug`](../app/export.md)
- [`app/greeter.aug`](../app/greeter.md)
- [`logging/console.aug`](console.md)
- [`logging/export.aug`](export.md)
- [`logging/logger.aug`](logger.md)

:::

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Folder exports

- Export the declaration `Logger` from [`logger.aug`](logger.md#symbol-Logger).
- Export the declaration `ConsoleLogger` from [`console.aug`](console.md#symbol-ConsoleLogger).


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
