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
describe(resolve Logger logger, resolve Console console, int x, string label):
    console.write(value=x)
    return label
interface IGreeter:
    greet(resolve Logger logger, resolve Console console) returns string uses Console.write
/** Construction stores its inputs; startup is visible in the greet call. */
Greeter(resolve Logger logger to _logger, string name) implements IGreeter:
    /** Method annotations wrap each method invocation separately. */
    [Audit]
    greet(resolve Logger logger, resolve Console console):
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
describe(resolve Logger logger, resolve Console console, int x, string label) {
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
    greet(resolve Logger logger, resolve Console console) {
        return "Hello, " + name + "!"
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `describe` · [source](app.md#code) {#symbol-describe}

Prints a number and returns its label. It takes `x` as an integer (the numeric input, validated and incremented by the chain) and `label` as a string (Text forwarded through each layer unchanged). It gets `logger` ([`Logger`](logging.md#symbol-Logger)) and `console` ([`Console`](dependencies/august/0.20.1/io/contracts.md#symbol-Console)) from dependency injection. Failures can raise `ValidationError`.

Layers run in the declared order. Call [`Audit.around`](interceptors.md#symbol-Audit.around). Call [`Positive.around`](interceptors.md#symbol-Positive.around). Map `x` to `y`. Call [`AddOne.around`](interceptors.md#symbol-AddOne.around). Map `x` to `y`.

It passes `x` to [`console.write`](dependencies/august/0.20.1/io/contracts.md#symbol-Console.write). It returns `label`.

### `IGreeter` · interface · [source](app.md#code) {#symbol-IGreeter}

#### `IGreeter.greet` · [source](app.md#code) {#symbol-IGreeter.greet}

It gets `logger` ([`Logger`](logging.md#symbol-Logger)) and `console` ([`Console`](dependencies/august/0.20.1/io/contracts.md#symbol-Console)) from dependency injection. It returns `string`. It can call [`Console.write`](dependencies/august/0.20.1/io/contracts.md#symbol-Console.write).

### `Greeter` · class · [source](app.md#code) {#symbol-Greeter}

Construction stores its inputs; startup is visible in the greet call. It implements [`IGreeter`](app.md#symbol-IGreeter). It takes `name` as a string, kept read-only. It gets `_logger` ([`Logger`](logging.md#symbol-Logger)), kept read-only and private as `_logger` from dependency injection.

#### `Greeter.greet` · [source](app.md#code) {#symbol-Greeter.greet}

Method annotations wrap each method invocation separately. It gets `logger` ([`Logger`](logging.md#symbol-Logger)) and `console` ([`Console`](dependencies/august/0.20.1/io/contracts.md#symbol-Console)) from dependency injection. Layers run in the declared order. Call [`Audit.around`](interceptors.md#symbol-Audit.around).

It returns the text `Hello, {name}!`.

### Dependencies

It uses [`Console`](dependencies/august/0.20.1/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.20.1/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`AddOne`](interceptors.md#symbol-AddOne) ([`around`](interceptors.md#symbol-AddOne.around)), [`Audit`](interceptors.md#symbol-Audit) ([`around`](interceptors.md#symbol-Audit.around)), and [`Positive`](interceptors.md#symbol-Positive) ([`around`](interceptors.md#symbol-Positive.around)) from `interceptors`. It uses [`Logger`](logging.md#symbol-Logger) from `logging`.

::::

:::::
