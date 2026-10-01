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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

### Providers

`Console` is provided by [`SystemConsole`](dependencies/august/0.20.1/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Logger` is provided by [`ConsoleLogger`](console.md#symbol-ConsoleLogger). The same instance is shared.

### Startup

It sets `greeter` to a [`Greeter`](greeter.md#symbol-Greeter) with `x` `4` using injected `Logger` for `logger`. It passes `"AugScript"` to [`greeter.greet`](greeter.md#symbol-Greeter.greet), using injected `Console`. It sets `count` to `7`. It sets `count` to [`increment`](math.md#symbol-increment) with `value` from `count`.

It prints `count`.

### Dependencies

It uses [`SystemConsole`](dependencies/august/0.20.1/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`ConsoleLogger`](console.md#symbol-ConsoleLogger) from `console`. It uses [`Greeter`](greeter.md#symbol-Greeter) ([`greet`](greeter.md#symbol-Greeter.greet)) from `greeter`. It uses [`increment`](math.md#symbol-increment) from `math`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
