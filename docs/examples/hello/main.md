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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

`Console` is provided by [`SystemConsole`](dependencies/august/0.23.0/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Logger` is provided by [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger). The same instance is shared.

`app` is provided by [`Greeter`](app/greeter.md#symbol-Greeter). The same instance is shared. It requires bindings for `Logger`.

### Startup

It sets `greeter` to the instance provided for `app`. It passes `"AugScript"` to [`greeter.greet`](app/greeter.md#symbol-Greeter.greet), using injected `Console`. [source](main.md#code)

### Dependencies

It uses [`SystemConsole`](dependencies/august/0.23.0/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`Greeter`](app/greeter.md#symbol-Greeter) ([`greet`](app/greeter.md#symbol-Greeter.greet)) from `app`. It uses [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) from `logging`.

::::

:::::
