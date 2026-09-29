---
title: "main.aug · Function and constructor middleware"
generated: true
source: "examples/interceptors/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

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

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Register 2 dependency providers before startup.
- Run startup operations with checked error recovery.
- Run 2 other startup steps in source order.

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Reuse one instance.
- Provide [`ConsoleLogger`](logging.md#symbol-ConsoleLogger) when `Logger` is requested. Reuse one instance.

### Startup, in source order

- Try these operations:
  - Call `print` with `value` = call [`describe`](app.md#symbol-describe) with `label` = `"value"`; `x` = `6`; inject `logger` from `Logger`, `console` from `Console`.
- If they fail with [`ValidationError`](interceptors.md#symbol-ValidationError), name the failure `error` and recover:
  - Call `print` with `value` = `"rejected"`.
- Set `greeter` to call [`Greeter`](app.md#symbol-Greeter) with `name` = `"AugScript"`; inject `_logger` from `Logger`.
- Call `print` with `value` = call [`Greeter.greet`](app.md#symbol-Greeter.greet) on `greeter`; inject `logger` from `Logger`, `console` from `Console`.
- Try these operations:
  - Call [`describe`](app.md#symbol-describe) with `x` = `-1`; `label` = `"invalid"`; inject `logger` from `Logger`, `console` from `Console`.
- If they fail with [`ValidationError`](interceptors.md#symbol-ValidationError), name the failure `error` and recover:
  - Call `print` with `value` = `"rejected"`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Class from `august.io`.

Used as a type or provider.

#### [`Greeter`](app.md#symbol-Greeter)

Class from `app`.

- Construct with `name`: `string` → [`Greeter`](app.md#symbol-Greeter).
- [`Greeter.greet`](app.md#symbol-Greeter.greet) (no caller inputs) → `string`; inject `logger`: [`Logger`](logging.md#symbol-Logger), `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console); uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`describe`](app.md#symbol-describe)

Function from `app`.

- [`describe`](app.md#symbol-describe) (`x`: `int`, `label`: `string`) → `string`; inject `logger`: [`Logger`](logging.md#symbol-Logger), `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console); uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write); can fail with `ValidationError`.

#### [`ValidationError`](interceptors.md#symbol-ValidationError)

Class from `interceptors`.

Used as a type or provider.

#### [`ConsoleLogger`](logging.md#symbol-ConsoleLogger)

Class from `logging`.

Used as a type or provider.

### Built-in operations used by this file

- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
