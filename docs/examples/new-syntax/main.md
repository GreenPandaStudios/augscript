---
title: "main.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[Labeled calls and injection](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`console.aug`](console.md)
- [`greeter.aug`](greeter.md)
- [`logger.aug`](logger.md)
- [`math.aug`](math.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logger
import ConsoleLogger from console
import Greeter from greeter
import increment from math
implement Logger with ConsoleLogger
greeter = Greeter(x=4)
greeter.greet(name="AugScript")
int count = 7
count = increment(value=count)
print(value=count)
```

```aug [Braces]
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logger
import ConsoleLogger from console
import Greeter from greeter
import increment from math
implement Logger with ConsoleLogger
greeter = Greeter(x=4)
greeter.greet(name="AugScript")
int count = 7
count = increment(value=count)
print(value=count)
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Available from `august.io`.

Class. Follow the linked specification for its full explanation.

#### [`ConsoleLogger`](console.md#symbol-ConsoleLogger)

Available from `console`.

Class. Follow the linked specification for its full explanation.

#### [`Greeter`](greeter.md#symbol-Greeter)

Available from `greeter`.

Class. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `logger`: [`Logger`](logger.md#symbol-Logger). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `x`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`Greeter`](greeter.md#symbol-Greeter).

**[`Greeter.greet`](greeter.md#symbol-Greeter.greet)**

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`increment`](math.md#symbol-increment)

Available from `math`.

**Inputs and dependencies**

- `value`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `int`.

### Built-in operations used by this file

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Reuse one instance.
- Provide [`ConsoleLogger`](console.md#symbol-ConsoleLogger) when `Logger` is requested. Reuse one instance.

### Startup, in source order

- Set `greeter` to the result of call [`Greeter`](greeter.md#symbol-Greeter) with `x` set to `4`; supply dependencies `logger` from `Logger`.
- Call [`Greeter.greet`](greeter.md#symbol-Greeter.greet) on `greeter` with `name` set to `"AugScript"`; supply dependencies `console` from `Console`.
- Set `count` of type `int` to `7`.
- Set `count` to the result of call [`increment`](math.md#symbol-increment) with `value` set to `count`.
- Call `print` with `value` set to `count`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
