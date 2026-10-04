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
    log(resolve Console console, string message):
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
    log(resolve Console console, string message) {
        console.write(value=message)
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Logger` · interface · [source](logging.md#code) {#symbol-Logger}

Writes a message to the application log.

#### `Logger.log` · [source](logging.md#code) {#symbol-Logger.log}

It takes `message` as a string (Text to display). It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write).

### `ConsoleLogger` · class · [source](logging.md#code) {#symbol-ConsoleLogger}

Console logger shared by interceptor instances and the application. It implements [`Logger`](logging.md#symbol-Logger).

#### `ConsoleLogger.log` · [source](logging.md#code) {#symbol-ConsoleLogger.log}

It takes `message` as a string (Text to display). It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It passes `message` to [`console.write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write)) from `august.io`.

::::

:::::
