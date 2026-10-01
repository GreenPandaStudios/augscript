---
title: "logging/console.aug · A small tested application"
generated: true
source: "examples/developer-workflow/logging/console.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logging/console.aug`

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
// aug-spec: "console.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
/** Writes application messages to standard output. */
ConsoleLogger() implements Logger:
    log(resolve Console console, string message):
        console.write(value=message)
```

```aug [Braces]
// aug-spec: "console.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
/** Writes application messages to standard output. */
ConsoleLogger() implements Logger {
    log(resolve Console console, string message) {
        console.write(value=message)
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `ConsoleLogger` · class · [source](console.md#code) {#symbol-ConsoleLogger}

Writes application messages to standard output. It implements [`Logger`](logger.md#symbol-Logger).

#### `ConsoleLogger.log` · [source](console.md#code) {#symbol-ConsoleLogger.log}

It takes `message` as a string (Text to write). It gets `console` ([`Console`](../dependencies/august/0.20.0/io/contracts.md#symbol-Console)) from dependency injection. It passes `message` to [`console.write`](../dependencies/august/0.20.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](../dependencies/august/0.20.0/io/contracts.md#symbol-Console) ([`write`](../dependencies/august/0.20.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](logger.md#symbol-Logger) from `logger`.

::::

:::::
