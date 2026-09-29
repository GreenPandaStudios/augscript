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

### Providers

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance.
- Provide [`ConsoleLogger`](logging.md#symbol-ConsoleLogger) for `Logger`. Share one instance.

### Startup

- Try:
  - Call `print` with `value` as the result of [`describe`](app.md#symbol-describe) with `label` as `"value"`, `x` as `6` using `Logger` for `logger`, `Console` for `console`.
- Catch [`ValidationError`](interceptors.md#symbol-ValidationError) as `error`:
  - Call `print` with `value` as `"rejected"`.
- Set `greeter` to a new [`Greeter`](app.md#symbol-Greeter) with `name` as `"AugScript"` using `Logger` for `_logger`.
- Call `print` with `value` as the result of [`Greeter.greet`](app.md#symbol-Greeter.greet) on `greeter` using `Logger` for `logger`, `Console` for `console`.
- Try:
  - Call [`describe`](app.md#symbol-describe) with `x` as `-1`, `label` as `"invalid"` using `Logger` for `logger`, `Console` for `console`.
- Catch [`ValidationError`](interceptors.md#symbol-ValidationError) as `error`:
  - Call `print` with `value` as `"rejected"`.

### Dependencies

- [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`.
- [`Greeter`](app.md#symbol-Greeter) from `app`: construct with `name`: `string`; [`greet`](app.md#symbol-Greeter.greet) (no caller inputs) → `string`.
- [`describe`](app.md#symbol-describe) (`x`: `int`, `label`: `string`) → `string`; can fail with `ValidationError` from `app`.
- [`ValidationError`](interceptors.md#symbol-ValidationError) from `interceptors`.
- [`ConsoleLogger`](logging.md#symbol-ConsoleLogger) from `logging`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
