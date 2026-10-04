---
title: "greeter.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/greeter.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `greeter.aug`

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
// aug-spec: "greeter.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
Greeter(resolve Logger logger, int x) implements IGreeter:
    greet(resolve Console console, string name):
        logger.log(message="Hello, " + name + "!")
interface IGreeter:
    greet(resolve Console console, string name) uses Console.write
```

```aug [Braces]
// aug-spec: "greeter.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
Greeter(resolve Logger logger, int x) implements IGreeter {
    greet(resolve Console console, string name) {
        logger.log(message="Hello, " + name + "!")
    }
}
interface IGreeter {
    greet(resolve Console console, string name) uses Console.write
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Greeter` · class · [source](greeter.md#code) {#symbol-Greeter}

It implements [`IGreeter`](greeter.md#symbol-IGreeter). It takes `x` as an integer, kept read-only. It gets `logger` ([`Logger`](logger.md#symbol-Logger)), kept read-only from dependency injection.

#### `Greeter.greet` · [source](greeter.md#code) {#symbol-Greeter.greet}

It takes `name` as a string. It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It passes the text `Hello, {name}!` to [`logger.log`](logger.md#symbol-Logger.log), using injected `console`. [source](greeter.md#code)

::: details Checked interface

```text
greet(resolve Console console, string name) returns void uses Console.write
```

It takes `name` as a string. It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection.

:::

### `IGreeter` · interface · [source](greeter.md#code) {#symbol-IGreeter}

#### `IGreeter.greet` · [source](greeter.md#code) {#symbol-IGreeter.greet}

It takes `name` as a string. It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](logger.md#symbol-Logger) ([`log`](logger.md#symbol-Logger.log)) from `logger`.

::::

:::::
