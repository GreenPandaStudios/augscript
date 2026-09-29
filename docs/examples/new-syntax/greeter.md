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
import Console from august.io
import Logger from logger
Greeter(resolve Logger logger, int x) implements IGreeter:
    greet(resolve Console console, string name) uses Console.write:
        logger.log(message="Hello, " + name + "!")
interface IGreeter:
    greet(resolve Console console, string name) uses Console.write
```

```aug [Braces]
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

Implements [`IGreeter`](greeter.md#symbol-IGreeter).

**Inputs:** Resolve [`Logger`](logger.md#symbol-Logger) as `logger`; store read-only. Take `x` (`int`); store read-only.

<a id="symbol-Greeter.greet"></a>
#### `Greeter.greet` · [source](greeter.md#code)

**Inputs:** Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `name` (`string`).

Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

- Call [`Logger.log`](logger.md#symbol-Logger.log) on `logger` with `message` as text that joins `"Hello, "`, `name` and `"!"` using `console`.

<a id="symbol-IGreeter"></a>
### `IGreeter` · interface · [source](greeter.md#code)

<a id="symbol-IGreeter.greet"></a>
#### `IGreeter.greet` · [source](greeter.md#code)

**Inputs:** Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `name` (`string`).

Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

- [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`: [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.
- [`Logger`](logger.md#symbol-Logger) from `logger`: [`log`](logger.md#symbol-Logger.log) (`message`: `string`) → `void`.

::::

:::::
