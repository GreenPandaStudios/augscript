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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZjU2NjM0NTAwMjZmOTQ5YmQxMzk3MjI1YzNiMzQ4NTRjMWJhMDdiMzc4ZWZkNjA3NDNlNWI5YTk2OWZmOGM0NyIsImZvcm1hdHRlZFNoYTI1NiI6IjJkMDk2YWQ1ZDIxM2MzZjQwMzA3M2FmMGI2ZjQ3YmNkN2M2YjY5MDEzODk5MTUzYWM3M2UwZjdhM2RiNDhkNWMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEwLUwxNyIsImZpcnN0IjoxMCwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxOC1MMjMiLCJmaXJzdCI6MTYsImxhc3QiOjE5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX1dfQ
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZjU2NjM0NTAwMjZmOTQ5YmQxMzk3MjI1YzNiMzQ4NTRjMWJhMDdiMzc4ZWZkNjA3NDNlNWI5YTk2OWZmOGM0NyIsImZvcm1hdHRlZFNoYTI1NiI6IjlkM2E2MzdiZDVkNjMzODAzNDRjNWEzODcxYmI3ZDA4YzU3NjA1YzU5NmIxNDM1NWQ3MWI2MmQ4YzNhMjg5NTMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEwLUwxNyIsImZpcnN0IjoxMCwibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxOC1MMjMiLCJmaXJzdCI6MTgsImxhc3QiOjIzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX1dfQ
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

`Console` is provided by [`SystemConsole`](dependencies/august/0.23.0/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Logger` is provided by [`ConsoleLogger`](logging.md#symbol-ConsoleLogger). The same instance is shared.

### Startup

::: spec-paragraph specification-paragraph-1
It prints [`describe`](app.md#symbol-describe) with `label` `"value"` and `x` `6` using injected `Logger` for `logger` and `Console` for `console`. If this work raises [`ValidationError`](interceptors.md#symbol-ValidationError), it prints `"rejected"`. It sets `greeter` to a [`Greeter`](app.md#symbol-Greeter) with `name` `"AugScript"` using injected `Logger` for `_logger`. It prints [`greeter.greet`](app.md#symbol-Greeter.greet) using injected `Logger` for `logger` and `Console` for `console`. [source](main.md#source-L10-L17)
:::

::: spec-paragraph specification-paragraph-2
It tries to call [`describe`](app.md#symbol-describe) with `x` `-1` and `label` `"invalid"` using injected `Logger` for `logger` and `Console` for `console`. If this work raises [`ValidationError`](interceptors.md#symbol-ValidationError), it prints `"rejected"`. [source](main.md#source-L18-L23)
:::

### Dependencies

It uses [`SystemConsole`](dependencies/august/0.23.0/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`Greeter`](app.md#symbol-Greeter) ([`greet`](app.md#symbol-Greeter.greet)) and [`describe`](app.md#symbol-describe) from `app`. It uses [`ValidationError`](interceptors.md#symbol-ValidationError) from `interceptors`. It uses [`ConsoleLogger`](logging.md#symbol-ConsoleLogger) from `logging`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
