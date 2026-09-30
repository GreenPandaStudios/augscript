---
title: "logger.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/logger.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logger.aug`

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
// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Displays application messages. */
interface Logger:
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
```

```aug [Braces]
// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Displays application messages. */
interface Logger {
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Logger"></a>
### `Logger` · interface · [source](logger.md#code)

Displays application messages.

<a id="symbol-Logger.log"></a>
#### `Logger.log` · [source](logger.md#code)

It takes `message` as a string (Text to display). It gets `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)) from `august.io`. These links explain the full dependency contracts.

::::

:::::
