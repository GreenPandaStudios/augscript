---
title: "main.aug · Hello world with dependencies"
generated: true
source: "examples/hello/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[Hello world with dependencies](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`app/export.aug`](app/export.md)
- [`app/greeter.aug`](app/greeter.md)
- [`logging/console.aug`](logging/console.md)
- [`logging/export.aug`](logging/export.md)
- [`logging/logger.aug`](logging/logger.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logging
import ConsoleLogger from logging
import Greeter from app
implement Logger with ConsoleLogger
implement app with Greeter
resolve app to greeter
greeter.greet(name="AugScript")
```

```aug [Braces]
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logging
import ConsoleLogger from logging
import Greeter from app
implement Logger with ConsoleLogger
implement app with Greeter
resolve app to greeter
greeter.greet(name="AugScript")
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Available from `august.io`.

Class. Follow the linked specification for its full explanation.

#### [`Greeter`](app/greeter.md#symbol-Greeter)

Available from `app`.

Class. Follow the linked specification for its full explanation.

**[`Greeter.greet`](app/greeter.md#symbol-Greeter.greet)**

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger)

Available from `logging`.

Class. Follow the linked specification for its full explanation.

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Reuse one instance.
- Provide [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) when `Logger` is requested. Reuse one instance.
- Provide [`Greeter`](app/greeter.md#symbol-Greeter) when `app` is requested. Reuse one instance. Required dependencies: `Logger`.

### Startup, in source order

- Set `greeter` to the instance provided for `app`.
- Call [`Greeter.greet`](app/greeter.md#symbol-Greeter.greet) on `greeter` with `name` set to `"AugScript"`; supply dependencies `console` from `Console`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
