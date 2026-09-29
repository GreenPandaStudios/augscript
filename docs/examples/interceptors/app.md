---
title: "app.aug · Function and constructor middleware"
generated: true
source: "examples/interceptors/app.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `app.aug`

[Function and constructor middleware](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`app.aug`](app.md)
- [`interceptors.aug`](interceptors.md)
- [`logging.aug`](logging.md)

:::

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`describe`](app.md#symbol-describe) is a function returning `string`.
- [`IGreeter`](app.md#symbol-IGreeter) is an interface.
- [`Greeter`](app.md#symbol-Greeter) is a class implementing `IGreeter`.

### `describe` {#symbol-describe}

[source](app.md#code)

**Inputs**

- `logger` ([`Logger`](logging.md#symbol-Logger)) — injected; callers omit it.
- `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.
- `x` (`int`) — required labeled input.
- `label` (`string`) — required labeled input.

Returns: `string`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Can fail with `ValidationError`. Callers must catch or propagate these errors.

**Interceptors, in execution order**

1. Call [`Audit.around`](interceptors.md#symbol-Audit.around). It can call the next layer or finish with its own result or failure. Unselected inputs pass through.
2. Call [`Positive.around`](interceptors.md#symbol-Positive.around). It can call the next layer or finish with its own result or failure. Map `x` to `y`. Unselected inputs pass through.
3. Call [`AddOne.around`](interceptors.md#symbol-AddOne.around). It can call the next layer or finish with its own result or failure. Map `x` to `y`. Unselected inputs pass through.

The first layer wraps the remaining layers. HTTP policies run before wire decoding; custom interceptors run after decoding. Follow linked behavior to see its conditions, input changes, and calls to the next layer.

**What it does**

- Call [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` = `x`.
- Return `label`.

**Author documentation**

Prints a number and returns its label.

**Parameters**
- `x`: The numeric input, validated and incremented by the chain.
- `label`: Text forwarded through each layer unchanged.

### `IGreeter` {#symbol-IGreeter}

[source](app.md#code)

Interface.

#### `IGreeter.greet` {#symbol-IGreeter.greet}

[source](app.md#code)

**Inputs**

- `logger` ([`Logger`](logging.md#symbol-Logger)) — injected; callers omit it.
- `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.

Returns: `string`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Interface contract. A selected implementation supplies the behavior.

### `Greeter` {#symbol-Greeter}

[source](app.md#code)

Behavioral class.

Satisfies [`IGreeter`](app.md#symbol-IGreeter).

**Author documentation**

Construction stores its inputs; startup is visible in the greet call.

**Inputs**

- `logger` ([`Logger`](logging.md#symbol-Logger)) — injected; callers omit it — stored as `_logger` (private) and read-only after initialization.
- `name` (`string`) — required labeled input — stored as `name` and read-only after initialization.

#### `Greeter.greet` {#symbol-Greeter.greet}

[source](app.md#code)

**Inputs**

- `logger` ([`Logger`](logging.md#symbol-Logger)) — injected; callers omit it.
- `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.

Returns: `string`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**Interceptors, in execution order**

1. Call [`Audit.around`](interceptors.md#symbol-Audit.around). It can call the next layer or finish with its own result or failure. Unselected inputs pass through.

The first layer wraps the remaining layers. HTTP policies run before wire decoding; custom interceptors run after decoding. Follow linked behavior to see its conditions, input changes, and calls to the next layer.

**What it does**

- Return text formed by joining `"Hello, "`, `name`, `"!"` in order.

**Author documentation**

Method annotations wrap each method invocation separately.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Capability interface from `august.io`.

- [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

#### [`AddOne`](interceptors.md#symbol-AddOne)

Interceptor from `interceptors`.

- [`AddOne.around`](interceptors.md#symbol-AddOne.around) (`y`: `int`) → `T`.

#### [`Audit`](interceptors.md#symbol-Audit)

Interceptor from `interceptors`.

- [`Audit.around`](interceptors.md#symbol-Audit.around) (no caller inputs) → `T`; inject `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console); uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`Positive`](interceptors.md#symbol-Positive)

Interceptor from `interceptors`.

- [`Positive.around`](interceptors.md#symbol-Positive.around) (`y`: `int`) → `T`; can fail with `ValidationError`.

#### [`Logger`](logging.md#symbol-Logger)

Interface from `logging`.

Used as a type or provider.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
