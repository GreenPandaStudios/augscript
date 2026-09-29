---
title: "app/greeter.aug · Hello world with dependencies"
generated: true
source: "examples/hello/app/greeter.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `app/greeter.aug`

[Hello world with dependencies](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`app/export.aug`](export.md)
- [`app/greeter.aug`](greeter.md)
- [`logging/console.aug`](../logging/console.md)
- [`logging/export.aug`](../logging/export.md)
- [`logging/logger.aug`](../logging/logger.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import Console from august.io
import Logger from logging
/**
* Welcomes a user through the configured logger.
* @param logger The application logger, injected when resolved.
*/
Greeter(resolve Logger logger) implements IGreeter:
    /**
    * Prints a personalized greeting.
    * @param name The user to welcome.
    */
    greet(resolve Console console, string name) uses Console.write:
        logger.log(message="Hello, " + name + "!")
interface IGreeter:
    /**
    * Prints a personalized greeting.
    * @param name The user to welcome.
    */
    greet(resolve Console console, string name) uses Console.write
```

```aug [Braces]
import Console from august.io
import Logger from logging
/**
* Welcomes a user through the configured logger.
* @param logger The application logger, injected when resolved.
*/
Greeter(resolve Logger logger) implements IGreeter {
    /**
    * Prints a personalized greeting.
    * @param name The user to welcome.
    */
    greet(resolve Console console, string name) uses Console.write {
        logger.log(message="Hello, " + name + "!")
    }
}
interface IGreeter {
    /**
    * Prints a personalized greeting.
    * @param name The user to welcome.
    */
    greet(resolve Console console, string name) uses Console.write
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Greeter`](greeter.md#symbol-Greeter) is a class implementing `IGreeter`.
- [`IGreeter`](greeter.md#symbol-IGreeter) is an interface.

### `Greeter` {#symbol-Greeter}

[source](greeter.md#code)

Behavioral class.

Satisfies [`IGreeter`](greeter.md#symbol-IGreeter).

**Author documentation**

Welcomes a user through the configured logger.

**Parameters**
- `logger`: The application logger, injected when resolved.

**Inputs**

- `logger` ([`Logger`](../logging/logger.md#symbol-Logger)) — injected; callers omit it — stored as `logger` and read-only after initialization.

#### `Greeter.greet` {#symbol-Greeter.greet}

[source](greeter.md#code)

**Inputs**

- `console` ([`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.
- `name` (`string`) — required labeled input.

Returns: no value.

Capabilities: [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**What it does**

- Call [`Logger.log`](../logging/logger.md#symbol-Logger.log) on `logger` with `message` = (text formed by joining `"Hello, "`, `name`, `"!"` in order); inject `console` from `console`.

**Author documentation**

Prints a personalized greeting.

**Parameters**
- `name`: The user to welcome.

### `IGreeter` {#symbol-IGreeter}

[source](greeter.md#code)

Interface.

#### `IGreeter.greet` {#symbol-IGreeter.greet}

[source](greeter.md#code)

**Inputs**

- `console` ([`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.
- `name` (`string`) — required labeled input.

Returns: no value.

Capabilities: [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Interface contract. A selected implementation supplies the behavior.

**Author documentation**

Prints a personalized greeting.

**Parameters**
- `name`: The user to welcome.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Capability interface from `august.io`.

- [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

#### [`Logger`](../logging/logger.md#symbol-Logger)

Interface from `logging`.

- [`Logger.log`](../logging/logger.md#symbol-Logger.log) (`message`: `string`) → `void`; inject `console`: [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console); uses [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
