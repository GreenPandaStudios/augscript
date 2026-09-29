---
title: "logging/console.aug · Hello world with dependencies"
generated: true
source: "examples/hello/logging/console.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logging/console.aug`

[Hello world with dependencies](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`app/export.aug`](../app/export.md)
- [`app/greeter.aug`](../app/greeter.md)
- [`logging/console.aug`](console.md)
- [`logging/export.aug`](export.md)
- [`logging/logger.aug`](logger.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
import Console from august.io
import Logger from logger
ConsoleLogger() implements Logger:
    log(resolve Console console, string message) uses Console.write:
        console.write(value=message)
```

```aug [Braces]
import Console from august.io
import Logger from logger
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

Implements [`Logger`](logger.md#symbol-Logger).

<a id="symbol-ConsoleLogger.log"></a>
#### `ConsoleLogger.log` · [source](console.md#code)

Writes one message.

**Inputs:** Resolve [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `message` (`string`) — Text to write.

Uses [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

- Call [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` as `message`.

### Dependencies

- [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`: [`write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.
- [`Logger`](logger.md#symbol-Logger) from `logger`.

::::

:::::
