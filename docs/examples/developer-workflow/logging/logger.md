---
title: "logging/logger.aug · A small tested application"
generated: true
source: "examples/developer-workflow/logging/logger.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Logger`](logger.md#symbol-Logger) is an interface.

### `Logger` {#symbol-Logger}

[source](logger.md#code)

Interface.

**Author documentation**

Receives a message describing an application operation.

#### `Logger.log` {#symbol-Logger.log}

[source](logger.md#code)

**Inputs**

- `console` ([`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.
- `message` (`string`) — required labeled input.

Returns: no value.

Capabilities: [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

**Parameters**
- `message`: Text to write.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Capability interface from `august.io`.

- [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
