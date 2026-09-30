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
// aug-spec: "app.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "app.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

Prints a number and returns its label. The caller supplies `x` as `int` (the numeric input, validated and incremented by the chain) and `label` as `string` (Text forwarded through each layer unchanged). Dependency injection supplies `logger` as [`Logger`](logging.md#symbol-Logger) and `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). The result is `string`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It can fail with `ValidationError`. Layers run in the declared order. Call [`Audit.around`](interceptors.md#symbol-Audit.around). Call [`Positive.around`](interceptors.md#symbol-Positive.around). Map `x` to `y`. Call [`AddOne.around`](interceptors.md#symbol-AddOne.around). Map `x` to `y`.

It calls [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` (`value` set to `x`). It returns `label`.

<a id="symbol-IGreeter"></a>
### `IGreeter` · interface · [source](app.md#code)

<a id="symbol-IGreeter.greet"></a>
#### `IGreeter.greet` · [source](app.md#code)

Dependency injection supplies `logger` as [`Logger`](logging.md#symbol-Logger) and `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). The result is `string`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

<a id="symbol-Greeter"></a>
### `Greeter` · class · [source](app.md#code)

Construction stores its inputs; startup is visible in the greet call. Implements [`IGreeter`](app.md#symbol-IGreeter). The caller supplies `name` as `string`, stored read-only. Dependency injection supplies `logger` as [`Logger`](logging.md#symbol-Logger), stored read-only and privately as `_logger`.

<a id="symbol-Greeter.greet"></a>
#### `Greeter.greet` · [source](app.md#code)

Method annotations wrap each method invocation separately. Dependency injection supplies `logger` as [`Logger`](logging.md#symbol-Logger) and `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). The result is `string`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). Layers run in the declared order. Call [`Audit.around`](interceptors.md#symbol-Audit.around). It returns text that joins `"Hello, "`, `name` and `"!"`.

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`AddOne`](interceptors.md#symbol-AddOne) from `interceptors`. The type parameters are `T`. [`around`](interceptors.md#symbol-AddOne.around) takes `y` as `int`. It returns `T`. The file uses [`Audit`](interceptors.md#symbol-Audit) from `interceptors`. The type parameters are `T`. [`around`](interceptors.md#symbol-Audit.around) takes no caller inputs. It returns `T`. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

The file uses [`Positive`](interceptors.md#symbol-Positive) from `interceptors`. The type parameters are `T`. [`around`](interceptors.md#symbol-Positive.around) takes `y` as `int`. It returns `T`. It can fail with `ValidationError`. The file uses [`ValidationError`](interceptors.md#symbol-ValidationError). The file uses [`Logger`](logging.md#symbol-Logger) from `logging`.

::::

:::::
