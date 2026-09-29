---
title: "main.aug · Function and constructor middleware"
generated: true
source: "examples/interceptors/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

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
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logging
import ConsoleLogger from logging
import Greeter from app
import describe from app
import ValidationError from interceptors
implement Logger with ConsoleLogger
try:
    print(value=describe(label="value", x=6))
catch ValidationError error:
    print(value="rejected")
greeter = Greeter(name="AugScript")
print(value=greeter.greet())
try:
    describe(x=-1, label="invalid")
catch ValidationError error:
    print(value="rejected")
```

```aug [Braces]
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logging
import ConsoleLogger from logging
import Greeter from app
import describe from app
import ValidationError from interceptors
implement Logger with ConsoleLogger
try {
    print(value=describe(label="value", x=6))
}
catch ValidationError error {
    print(value="rejected")
}
greeter = Greeter(name="AugScript")
print(value=greeter.greet())
try {
    describe(x=-1, label="invalid")
}
catch ValidationError error {
    print(value="rejected")
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Available from `august.io`.

Class. Follow the linked specification for its full explanation.

#### [`Greeter`](app.md#symbol-Greeter)

Available from `app`.

Class. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `logger`: [`Logger`](logging.md#symbol-Logger). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`Greeter`](app.md#symbol-Greeter).

**[`Greeter.greet`](app.md#symbol-Greeter.greet)**

**Inputs and dependencies**

- `logger`: [`Logger`](logging.md#symbol-Logger). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `string`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`describe`](app.md#symbol-describe)

Available from `app`.

**Inputs and dependencies**

- `logger`: [`Logger`](logging.md#symbol-Logger). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `x`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `label`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Possible failures: `ValidationError`. The caller must catch or propagate them.

#### [`ValidationError`](interceptors.md#symbol-ValidationError)

Available from `interceptors`.

Class. Follow the linked specification for its full explanation.

#### [`ConsoleLogger`](logging.md#symbol-ConsoleLogger)

Available from `logging`.

Class. Follow the linked specification for its full explanation.

### Built-in operations used by this file

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Reuse one instance.
- Provide [`ConsoleLogger`](logging.md#symbol-ConsoleLogger) when `Logger` is requested. Reuse one instance.

### Startup, in source order

- Try these operations:
  - Call `print` with `value` set to the result of call [`describe`](app.md#symbol-describe) with `label` set to `"value"`; `x` set to `6`; supply dependencies `logger` from `Logger`, `console` from `Console`.
- If they fail with [`ValidationError`](interceptors.md#symbol-ValidationError), name the failure `error` and recover:
  - Call `print` with `value` set to `"rejected"`.
- Set `greeter` to the result of call [`Greeter`](app.md#symbol-Greeter) with `name` set to `"AugScript"`; supply dependencies `_logger` from `Logger`.
- Call `print` with `value` set to the result of call [`Greeter.greet`](app.md#symbol-Greeter.greet) on `greeter`; supply dependencies `logger` from `Logger`, `console` from `Console`.
- Try these operations:
  - Call [`describe`](app.md#symbol-describe) with `x` set to `-1`; `label` set to `"invalid"`; supply dependencies `logger` from `Logger`, `console` from `Console`.
- If they fail with [`ValidationError`](interceptors.md#symbol-ValidationError), name the failure `error` and recover:
  - Call `print` with `value` set to `"rejected"`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
