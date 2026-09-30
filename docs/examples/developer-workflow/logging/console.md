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
    log(resolve Console console, string message) uses Console.write:
        console.write(value=message)
```

```aug [Braces]
// aug-spec: "console.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
/** Writes application messages to standard output. */
ConsoleLogger() implements Logger {
    log(resolve Console console, string message) uses Console.write {
        console.write(value=message)
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-ConsoleLogger"></a>
### `ConsoleLogger` · class · [source](console.md#code)

Writes application messages to standard output. Implements [`Logger`](logger.md#symbol-Logger).

<a id="symbol-ConsoleLogger.log"></a>
#### `ConsoleLogger.log` · [source](console.md#code)

The caller supplies `message` as `string` (Text to write). Dependency injection supplies `console` as [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It calls [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` (`value` set to `message`).

### Dependencies

The file uses [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`Logger`](logger.md#symbol-Logger) from `logger`.

::::

:::::
