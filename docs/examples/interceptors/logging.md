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
// aug-spec: "logging.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "logging.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

The caller supplies `message` as `string` (Text to display). Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

<a id="symbol-ConsoleLogger"></a>
### `ConsoleLogger` · class · [source](logging.md#code)

Console logger shared by interceptor instances and the application. Implements [`Logger`](logging.md#symbol-Logger).

<a id="symbol-ConsoleLogger.log"></a>
#### `ConsoleLogger.log` · [source](logging.md#code)

The caller supplies `message` as `string` (Text to display). Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It calls [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` (`value` set to `message`).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

::::

:::::
