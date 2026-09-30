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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

### Providers

Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance. Provide [`ConsoleLogger`](logging.md#symbol-ConsoleLogger) for `Logger`. Share one instance.

### Startup

It tries to call `print` (`value` set to the value from [`describe`](app.md#symbol-describe) (`label` set to `"value"` and `x` set to `6`) using `Logger` for `logger`, `Console` for `console`). If this attempt raises [`ValidationError`](interceptors.md#symbol-ValidationError), it catches it as `error` and calls `print` (`value` set to `"rejected"`). It sets `greeter` to a new [`Greeter`](app.md#symbol-Greeter) (`name` set to `"AugScript"`) using `Logger` for `_logger`. It calls `print` (`value` set to the value from [`Greeter.greet`](app.md#symbol-Greeter.greet) on `greeter` using `Logger` for `logger`, `Console` for `console`).

It tries to call [`describe`](app.md#symbol-describe) (`x` set to `-1` and `label` set to `"invalid"`) using `Logger` for `logger`, `Console` for `console`. If this attempt raises [`ValidationError`](interceptors.md#symbol-ValidationError), it catches it as `error` and calls `print` (`value` set to `"rejected"`).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`. The file uses [`Greeter`](app.md#symbol-Greeter) from `app`. Construction takes `name` as `string`. [`greet`](app.md#symbol-Greeter.greet) takes no caller inputs. It returns `string`. Dependency injection supplies `logger` as [`Logger`](logging.md#symbol-Logger) and `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

[`describe`](app.md#symbol-describe) from `app` takes `x` as `int` and `label` as `string`. It returns `string`. Dependency injection supplies `logger` as [`Logger`](logging.md#symbol-Logger) and `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It can fail with `ValidationError`. The file uses [`ValidationError`](interceptors.md#symbol-ValidationError) from `interceptors`. The file uses [`ConsoleLogger`](logging.md#symbol-ConsoleLogger) from `logging`. The file uses [`Logger`](logging.md#symbol-Logger) from `logging`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
