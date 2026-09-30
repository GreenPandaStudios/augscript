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

Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance. Provide [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) for `Logger`. Share one instance. Provide [`Greeter`](app/greeter.md#symbol-Greeter) for `app`. Share one instance. Needs `Logger`.

### Startup

It sets `greeter` to the instance provided for `app`. It calls [`Greeter.greet`](app/greeter.md#symbol-Greeter.greet) on `greeter` (`name` set to `"AugScript"`) using `Console` for `console`.

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`. The file uses [`Greeter`](app/greeter.md#symbol-Greeter) from `app`. [`greet`](app/greeter.md#symbol-Greeter.greet) takes `name` as `string`. It returns no value. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) from `logging`.

::::

:::::
