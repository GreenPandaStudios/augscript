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

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Available from `august.io`.

Interface. Follow the linked specification for its full explanation.

**[`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)**

Type parameters: `T`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`AddOne`](interceptors.md#symbol-AddOne)

Available from `interceptors`.

Interceptor. Follow the linked specification for its full explanation.

**[`AddOne.around`](interceptors.md#symbol-AddOne.around)**

**Inputs and dependencies**

- `y`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `T`.

#### [`Audit`](interceptors.md#symbol-Audit)

Available from `interceptors`.

Interceptor. Follow the linked specification for its full explanation.

**[`Audit.around`](interceptors.md#symbol-Audit.around)**

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `T`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`Positive`](interceptors.md#symbol-Positive)

Available from `interceptors`.

Interceptor. Follow the linked specification for its full explanation.

**[`Positive.around`](interceptors.md#symbol-Positive.around)**

**Inputs and dependencies**

- `y`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `T`.

Possible failures: `ValidationError`. The caller must catch or propagate them.

#### [`Logger`](logging.md#symbol-Logger)

Available from `logging`.

Interface. Follow the linked specification for its full explanation.

### `describe` {#symbol-describe}

[source](app.md#code)

**Inputs and dependencies**

- `logger`: [`Logger`](logging.md#symbol-Logger). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `x`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `label`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Possible failures: `ValidationError`. The caller must catch or propagate them.

**Author documentation**

Prints a number and returns its label.

**Parameters**
- `x`: The numeric input, validated and incremented by the chain.
- `label`: Text forwarded through each layer unchanged.

**Interceptors, in execution order**

1. Call [`Audit.around`](interceptors.md#symbol-Audit.around). It can call the next layer or finish with its own result or failure. Unselected inputs pass through.
2. Call [`Positive.around`](interceptors.md#symbol-Positive.around). It can call the next layer or finish with its own result or failure. Map `x` to `y`. Unselected inputs pass through.
3. Call [`AddOne.around`](interceptors.md#symbol-AddOne.around). It can call the next layer or finish with its own result or failure. Map `x` to `y`. Unselected inputs pass through.

The first layer wraps the remaining layers. HTTP policies run before wire decoding; custom interceptors run after decoding. Follow linked behavior to see its conditions, input changes, and calls to the next layer.

**Behavior when execution reaches this operation**

- Call [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` set to `x`.
- Return `label` and finish this operation.

### `IGreeter` {#symbol-IGreeter}

[source](app.md#code)

Interface.

#### `IGreeter.greet` {#symbol-IGreeter.greet}

[source](app.md#code)

**Inputs and dependencies**

- `logger`: [`Logger`](logging.md#symbol-Logger). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `string`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Interface contract. A selected implementation supplies the behavior.

### `Greeter` {#symbol-Greeter}

[source](app.md#code)

Behavioral class.

Satisfies [`IGreeter`](app.md#symbol-IGreeter).

**Author documentation**

Construction stores its inputs; startup is visible in the greet call.

**Inputs and dependencies**

- `logger`: [`Logger`](logging.md#symbol-Logger). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them. Store it as `_logger`. This field is private. The field is read-only after initialization.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `name`. The field is read-only after initialization.

#### `Greeter.greet` {#symbol-Greeter.greet}

[source](app.md#code)

**Inputs and dependencies**

- `logger`: [`Logger`](logging.md#symbol-Logger). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `string`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**Author documentation**

Method annotations wrap each method invocation separately.

**Interceptors, in execution order**

1. Call [`Audit.around`](interceptors.md#symbol-Audit.around). It can call the next layer or finish with its own result or failure. Unselected inputs pass through.

The first layer wraps the remaining layers. HTTP policies run before wire decoding; custom interceptors run after decoding. Follow linked behavior to see its conditions, input changes, and calls to the next layer.

**Behavior when execution reaches this operation**

- Return ((`"Hello, "` plus `name`) plus `"!"`) and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
