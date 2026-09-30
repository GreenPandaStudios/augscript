---
title: "app/greeter.aug · Hello world with dependencies"
generated: true
source: "examples/hello/app/greeter.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "greeter.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "greeter.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Greeter"></a>
### `Greeter` · class · [source](greeter.md#code)

Welcomes a user through the configured logger. Implements [`IGreeter`](greeter.md#symbol-IGreeter). Dependency injection supplies `logger` as [`Logger`](../logging/logger.md#symbol-Logger), stored read-only (the application logger, injected when resolved).

<a id="symbol-Greeter.greet"></a>
#### `Greeter.greet` · [source](greeter.md#code)

Prints a personalized greeting. The caller supplies `name` as `string` (the user to welcome). Dependency injection supplies `console` as [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It calls [`Logger.log`](../logging/logger.md#symbol-Logger.log) on `logger` (`message` set to text that joins `"Hello, "`, `name` and `"!"`) using `console`.

<a id="symbol-IGreeter"></a>
### `IGreeter` · interface · [source](greeter.md#code)

<a id="symbol-IGreeter.greet"></a>
#### `IGreeter.greet` · [source](greeter.md#code)

Prints a personalized greeting. The caller supplies `name` as `string` (the user to welcome). Dependency injection supplies `console` as [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

The file uses [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`Logger`](../logging/logger.md#symbol-Logger) from `logging`. [`log`](../logging/logger.md#symbol-Logger.log) takes `message` as `string`. It returns no value. Dependency injection supplies `console` as [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

::::

:::::
