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

**Inputs:** Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `message` (`string`) — Text to display.

Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

- Call [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` as `message`.

### Dependencies

- [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`: [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.
- [`Logger`](logger.md#symbol-Logger) from `logger`.

::::

:::::
