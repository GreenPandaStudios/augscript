---
title: "console.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/console.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `console.aug`

[Labeled calls and injection](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`console.aug`](console.md)
- [`greeter.aug`](greeter.md)
- [`logger.aug`](logger.md)
- [`math.aug`](math.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "console.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
ConsoleLogger() implements Logger:
    log(resolve Console console, string message):
        console.write(value=message)
```

```aug [Braces]
// aug-spec: "console.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
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

It implements [`Logger`](logger.md#symbol-Logger).

#### `ConsoleLogger.log` · [source](console.md#code) {#symbol-ConsoleLogger.log}

It takes `message` as a string (Text to display). It gets `console` ([`Console`](dependencies/august/0.20.0/io/contracts.md#symbol-Console)) from dependency injection. It passes `message` to [`console.write`](dependencies/august/0.20.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](dependencies/august/0.20.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.20.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](logger.md#symbol-Logger) from `logger`.

::::

:::::
