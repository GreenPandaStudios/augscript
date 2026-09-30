---
title: "logging/logger.aug · A small tested application"
generated: true
source: "examples/developer-workflow/logging/logger.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logging/logger.aug`

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
// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Receives a message describing an application operation. */
interface Logger:
    /** @param message Text to write. */
    log(resolve Console console, string message) uses Console.write
```

```aug [Braces]
// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Receives a message describing an application operation. */
interface Logger {
    /** @param message Text to write. */
    log(resolve Console console, string message) uses Console.write
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Logger` · interface · [source](logger.md#code) {#symbol-Logger}

Receives a message describing an application operation.

#### `Logger.log` · [source](logger.md#code) {#symbol-Logger.log}

It takes `message` as a string (Text to write). It gets `console` ([`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) ([`write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)) from `august.io`. These links explain the full dependency contracts.

::::

:::::
