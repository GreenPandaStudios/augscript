---
title: "console.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/console.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`ConsoleLogger`](console.md#symbol-ConsoleLogger) is a class implementing `Logger`.

### `ConsoleLogger` {#symbol-ConsoleLogger}

[source](console.md#code)

Behavioral class.

Satisfies [`Logger`](logger.md#symbol-Logger).

#### `ConsoleLogger.log` {#symbol-ConsoleLogger.log}

[source](console.md#code)

**Inputs**

- `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.
- `message` (`string`) — required labeled input.

Returns: no value.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**What it does**

- Call [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` = `message`.

**Author documentation**

**Parameters**
- `message`: Text to display.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Capability interface from `august.io`.

- [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

#### [`Logger`](logger.md#symbol-Logger)

Interface from `logger`.

Used as a type or provider.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
