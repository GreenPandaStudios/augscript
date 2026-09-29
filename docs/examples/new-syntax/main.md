---
title: "main.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Register 2 dependency providers before startup.
- Run 5 other startup steps in source order.

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Reuse one instance.
- Provide [`ConsoleLogger`](console.md#symbol-ConsoleLogger) when `Logger` is requested. Reuse one instance.

### Startup, in source order

- Set `greeter` to call [`Greeter`](greeter.md#symbol-Greeter) with `x` = `4`; inject `logger` from `Logger`.
- Call [`Greeter.greet`](greeter.md#symbol-Greeter.greet) on `greeter` with `name` = `"AugScript"`; inject `console` from `Console`.
- Set `count` of type `int` to `7`.
- Set `count` to call [`increment`](math.md#symbol-increment) with `value` = `count`.
- Call `print` with `value` = `count`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Class from `august.io`.

Used as a type or provider.

#### [`ConsoleLogger`](console.md#symbol-ConsoleLogger)

Class from `console`.

Used as a type or provider.

#### [`Greeter`](greeter.md#symbol-Greeter)

Class from `greeter`.

- Construct with `x`: `int` → [`Greeter`](greeter.md#symbol-Greeter).
- [`Greeter.greet`](greeter.md#symbol-Greeter.greet) (`name`: `string`) → `void`; inject `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console); uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`increment`](math.md#symbol-increment)

Function from `math`.

- [`increment`](math.md#symbol-increment) (`value`: `int`) → `int`.

### Built-in operations used by this file

- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
