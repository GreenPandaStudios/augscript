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

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Available from `august.io`.

Interface. Follow the linked specification for its full explanation.

**[`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)**

Type parameters: `T`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### `Logger` {#symbol-Logger}

[source](logger.md#code)

Interface.

**Author documentation**

Receives a message describing an application operation.

#### `Logger.log` {#symbol-Logger.log}

[source](logger.md#code)

**Inputs and dependencies**

- `console`: [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**Author documentation**

**Parameters**
- `message`: Text to write.

Interface contract. A selected implementation supplies the behavior.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
