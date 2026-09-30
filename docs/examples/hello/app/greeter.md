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

Welcomes a user through the configured logger. It implements [`IGreeter`](greeter.md#symbol-IGreeter). The `logger` dependency is injected as [`Logger`](../logging/logger.md#symbol-Logger) and stored read-only (The application logger, injected when resolved).

<a id="symbol-Greeter.greet"></a>
#### `Greeter.greet` · [source](greeter.md#code)

Prints a personalized greeting. It takes `name` as a string (the user to welcome). It gets `console` ([`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)) from dependency injection. It passes the text `Hello, {name}!` to [`logger.log`](../logging/logger.md#symbol-Logger.log), using injected `console`.

<a id="symbol-IGreeter"></a>
### `IGreeter` · interface · [source](greeter.md#code)

<a id="symbol-IGreeter.greet"></a>
#### `IGreeter.greet` · [source](greeter.md#code)

Prints a personalized greeting. It takes `name` as a string (the user to welcome). It gets `console` ([`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) ([`write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](../logging/logger.md#symbol-Logger) ([`log`](../logging/logger.md#symbol-Logger.log)) from `logging`. These links explain the full dependency contracts.

::::

:::::
