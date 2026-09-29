---
title: "app.aug · Function and constructor middleware"
generated: true
source: "examples/interceptors/app.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `app.aug`

[Function and constructor middleware](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`app.aug`](app.md)
- [`interceptors.aug`](interceptors.md)
- [`logging.aug`](logging.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
import Console from august.io
import Logger from logging
import Audit from interceptors
import Positive from interceptors
import AddOne from interceptors
/**
* Prints a number and returns its label.
* @param x The numeric input, validated and incremented by the chain.
* @param label Text forwarded through each layer unchanged.
*/
[Audit]
[Positive(y=x)]
[AddOne(y=x)]
describe(resolve Logger logger, resolve Console console, int x, string label) returns string uses Console.write:
    console.write(value=x)
    return label
interface IGreeter:
    greet(resolve Logger logger, resolve Console console) returns string uses Console.write
/** Construction stores its inputs; startup is visible in the greet call. */
Greeter(resolve Logger logger to _logger, string name) implements IGreeter:
    /** Method annotations wrap each method invocation separately. */
    [Audit]
    greet(resolve Logger logger, resolve Console console) returns string uses Console.write:
        return "Hello, " + name + "!"
```

```aug [Braces]
import Console from august.io
import Logger from logging
import Audit from interceptors
import Positive from interceptors
import AddOne from interceptors
/**
* Prints a number and returns its label.
* @param x The numeric input, validated and incremented by the chain.
* @param label Text forwarded through each layer unchanged.
*/
[Audit]
[Positive(y=x)]
[AddOne(y=x)]
describe(resolve Logger logger, resolve Console console, int x, string label) returns string uses Console.write {
    console.write(value=x)
    return label
}
interface IGreeter {
    greet(resolve Logger logger, resolve Console console) returns string uses Console.write
}
/** Construction stores its inputs; startup is visible in the greet call. */
Greeter(resolve Logger logger to _logger, string name) implements IGreeter {
    /** Method annotations wrap each method invocation separately. */
    [Audit]
    greet(resolve Logger logger, resolve Console console) returns string uses Console.write {
        return "Hello, " + name + "!"
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-describe"></a>
### `describe` · [source](app.md#code)

Prints a number and returns its label.

**Inputs:** Resolve [`Logger`](logging.md#symbol-Logger) as `logger`. Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `x` (`int`) — The numeric input, validated and incremented by the chain. Take `label` (`string`) — Text forwarded through each layer unchanged.

Returns `string`. Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). Can fail with `ValidationError`.

Layers run in this order:

1. Call [`Audit.around`](interceptors.md#symbol-Audit.around).
2. Call [`Positive.around`](interceptors.md#symbol-Positive.around). Map `x` to `y`.
3. Call [`AddOne.around`](interceptors.md#symbol-AddOne.around). Map `x` to `y`.

- Call [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` as `x`.
- Return `label`.

<a id="symbol-IGreeter"></a>
### `IGreeter` · interface · [source](app.md#code)

<a id="symbol-IGreeter.greet"></a>
#### `IGreeter.greet` · [source](app.md#code)

**Inputs:** Resolve [`Logger`](logging.md#symbol-Logger) as `logger`. Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`.

Returns `string`. Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

<a id="symbol-Greeter"></a>
### `Greeter` · class · [source](app.md#code)

Construction stores its inputs; startup is visible in the greet call. Implements [`IGreeter`](app.md#symbol-IGreeter).

**Inputs:** Resolve [`Logger`](logging.md#symbol-Logger) as `logger`; store read-only and privately as `_logger`. Take `name` (`string`); store read-only.

<a id="symbol-Greeter.greet"></a>
#### `Greeter.greet` · [source](app.md#code)

Method annotations wrap each method invocation separately.

**Inputs:** Resolve [`Logger`](logging.md#symbol-Logger) as `logger`. Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`.

Returns `string`. Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Layers run in this order:

1. Call [`Audit.around`](interceptors.md#symbol-Audit.around).

- Return text that joins `"Hello, "`, `name` and `"!"`.

### Dependencies

- [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`: [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.
- [`AddOne`](interceptors.md#symbol-AddOne) from `interceptors`: [`around`](interceptors.md#symbol-AddOne.around) (`y`: `int`) → `T`.
- [`Audit`](interceptors.md#symbol-Audit) from `interceptors`: [`around`](interceptors.md#symbol-Audit.around) (no caller inputs) → `T`.
- [`Positive`](interceptors.md#symbol-Positive) from `interceptors`: [`around`](interceptors.md#symbol-Positive.around) (`y`: `int`) → `T`; can fail with `ValidationError`.
- [`Logger`](logging.md#symbol-Logger) from `logging`.

::::

:::::
