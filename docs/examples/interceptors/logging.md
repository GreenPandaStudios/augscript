---
title: "logging.aug · Function and constructor middleware"
generated: true
source: "examples/interceptors/logging.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logging.aug`

[Function and constructor middleware](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`app.aug`](app.md)
- [`interceptors.aug`](interceptors.md)
- [`logging.aug`](logging.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
import Console from august.io
/** Writes a message to the application log. */
interface Logger:
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
/** Console logger shared by interceptor instances and the application. */
ConsoleLogger() implements Logger:
    log(resolve Console console, string message) uses Console.write:
        console.write(value=message)
```

```aug [Braces]
import Console from august.io
/** Writes a message to the application log. */
interface Logger {
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
}
/** Console logger shared by interceptor instances and the application. */
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

<a id="symbol-Logger"></a>
### `Logger` · interface · [source](logging.md#code)

Writes a message to the application log.

<a id="symbol-Logger.log"></a>
#### `Logger.log` · [source](logging.md#code)

**Inputs:** Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `message` (`string`) — Text to display.

Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

<a id="symbol-ConsoleLogger"></a>
### `ConsoleLogger` · class · [source](logging.md#code)

Console logger shared by interceptor instances and the application. Implements [`Logger`](logging.md#symbol-Logger).

<a id="symbol-ConsoleLogger.log"></a>
#### `ConsoleLogger.log` · [source](logging.md#code)

**Inputs:** Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `message` (`string`) — Text to display.

Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

- Call [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` as `message`.

### Dependencies

- [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`: [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

::::

:::::
