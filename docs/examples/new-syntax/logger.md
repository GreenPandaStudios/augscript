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
import Console from august.io
/** Displays application messages. */
interface Logger:
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
```

```aug [Braces]
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

**Inputs:** Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `message` (`string`) — Text to display.

Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

- [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`: [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

::::

:::::
