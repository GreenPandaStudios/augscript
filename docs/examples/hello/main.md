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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNmE4OGQ2ZGFhOWEzOWE4MmVjNzM0OWQ4NjcxODllMTcwOWI4NGY4YWI4YTcwNzBmODZkY2ExOTJiZDk4ZTY3NCIsImZvcm1hdHRlZFNoYTI1NiI6IjMwNDNhMjRhODhlOTMwNTE2ODhjYTYyYTYxMmQ4YThiYjZlNThiMGNlODBkZTBjZjYzMzU4YjJlYWMxYjAzZjAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6OSwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5LUwxMCIsImZpcnN0Ijo5LCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNmE4OGQ2ZGFhOWEzOWE4MmVjNzM0OWQ4NjcxODllMTcwOWI4NGY4YWI4YTcwNzBmODZkY2ExOTJiZDk4ZTY3NCIsImZvcm1hdHRlZFNoYTI1NiI6IjMwNDNhMjRhODhlOTMwNTE2ODhjYTYyYTYxMmQ4YThiYjZlNThiMGNlODBkZTBjZjYzMzU4YjJlYWMxYjAzZjAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6OSwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5LUwxMCIsImZpcnN0Ijo5LCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
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

[Interactions and sequences](main-diagrams.md)

### Providers

`Console` is provided by [`SystemConsole`](dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Logger` is provided by [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger). The same instance is shared.

`app` is provided by [`Greeter`](app/greeter.md#symbol-Greeter). The same instance is shared. It requires bindings for `Logger`.

### Startup

::: spec-paragraph specification-paragraph-1
It sets `greeter` to the instance provided for `app`. It passes `"AugScript"` to [`greeter.greet`](app/greeter.md#symbol-Greeter.greet), using injected `Console`. [source](main.md#source-L9-L10)
:::

### Dependencies

It uses [`SystemConsole`](dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`Greeter`](app/greeter.md#symbol-Greeter) ([`greet`](app/greeter.md#symbol-Greeter.greet)) from `app`. It uses [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) from `logging`.

::::

:::::
