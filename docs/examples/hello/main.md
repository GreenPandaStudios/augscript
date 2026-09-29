---
title: "main.aug · Hello world with dependencies"
generated: true
source: "examples/hello/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::

:::: example-spec

## Compiled specification {#specification}

### Providers

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance.
- Provide [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) for `Logger`. Share one instance.
- Provide [`Greeter`](app/greeter.md#symbol-Greeter) for `app`. Share one instance. Needs `Logger`.

### Startup

- Set `greeter` to the instance provided for `app`.
- Call [`Greeter.greet`](app/greeter.md#symbol-Greeter.greet) on `greeter` with `name` as `"AugScript"` using `Console` for `console`.

### Dependencies

- [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`.
- [`Greeter`](app/greeter.md#symbol-Greeter) from `app`: [`greet`](app/greeter.md#symbol-Greeter.greet) (`name`: `string`) → `void`.
- [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) from `logging`.

::::

:::::
