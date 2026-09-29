---
title: "logging/logger.aug · A small tested application"
generated: true
source: "examples/developer-workflow/logging/logger.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logging/logger.aug`

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
import Console from august.io
/** Receives a message describing an application operation. */
interface Logger:
    /** @param message Text to write. */
    log(resolve Console console, string message) uses Console.write
```

```aug [Braces]
import Console from august.io
/** Receives a message describing an application operation. */
interface Logger {
    /** @param message Text to write. */
    log(resolve Console console, string message) uses Console.write
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Logger"></a>
### `Logger` · interface · [source](logger.md#code)

Receives a message describing an application operation.

<a id="symbol-Logger.log"></a>
#### `Logger.log` · [source](logger.md#code)

**Inputs:** Resolve [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `message` (`string`) — Text to write.

Uses [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

- [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`: [`write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

::::

:::::
