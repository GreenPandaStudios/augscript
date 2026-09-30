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
    greet(resolve Console console, string name) uses Console.write:
        logger.log(message="Hello, " + name + "!")
interface IGreeter:
    greet(resolve Console console, string name) uses Console.write
```

```aug [Braces]
// aug-spec: "greeter.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
Greeter(resolve Logger logger, int x) implements IGreeter {
    greet(resolve Console console, string name) uses Console.write {
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

<a id="symbol-Greeter"></a>
### `Greeter` · class · [source](greeter.md#code)

Implements [`IGreeter`](greeter.md#symbol-IGreeter). The caller supplies `x` as `int`, stored read-only. Dependency injection supplies `logger` as [`Logger`](logger.md#symbol-Logger), stored read-only.

<a id="symbol-Greeter.greet"></a>
#### `Greeter.greet` · [source](greeter.md#code)

The caller supplies `name` as `string`. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It calls [`Logger.log`](logger.md#symbol-Logger.log) on `logger` (`message` set to text that joins `"Hello, "`, `name` and `"!"`) using `console`.

<a id="symbol-IGreeter"></a>
### `IGreeter` · interface · [source](greeter.md#code)

<a id="symbol-IGreeter.greet"></a>
#### `IGreeter.greet` · [source](greeter.md#code)

The caller supplies `name` as `string`. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`Logger`](logger.md#symbol-Logger) from `logger`. [`log`](logger.md#symbol-Logger.log) takes `message` as `string`. It returns no value. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

::::

:::::
