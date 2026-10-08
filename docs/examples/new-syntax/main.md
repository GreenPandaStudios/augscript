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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNDdiOWQ5NGI3ZTk0ZWQ3ZDQyNjUzOGIxMDkxNjFjMjQzYzRkYzkyYzdkN2Y4YTI5MDdlOTk1ZmQxZDk0NWM1NyIsImZvcm1hdHRlZFNoYTI1NiI6Ijc1ZjFjMmE3ZThmZDcwMjA3MDExODMxZGJlZDljN2IzNDQxNDQ5Y2Y5NWRjZTZiZGY0ODFkOTJkNWFkNTc3NDkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDktTDEyIiwiZmlyc3QiOjksImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEzLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjksImxhc3QiOjksImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS03NTdjOWYyMmExNmIiLCJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMTAiLCJmaXJzdCI6MTAsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktNzU3YzlmMjJhMTZiIl19LHsiaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjEyLCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTgyMzdjZWJlYTg5MyJdfV19
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNDdiOWQ5NGI3ZTk0ZWQ3ZDQyNjUzOGIxMDkxNjFjMjQzYzRkYzkyYzdkN2Y4YTI5MDdlOTk1ZmQxZDk0NWM1NyIsImZvcm1hdHRlZFNoYTI1NiI6Ijc1ZjFjMmE3ZThmZDcwMjA3MDExODMxZGJlZDljN2IzNDQxNDQ5Y2Y5NWRjZTZiZGY0ODFkOTJkNWFkNTc3NDkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDktTDEyIiwiZmlyc3QiOjksImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEzLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjksImxhc3QiOjksImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS03NTdjOWYyMmExNmIiLCJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMTAiLCJmaXJzdCI6MTAsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktNzU3YzlmMjJhMTZiIl19LHsiaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjEyLCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTgyMzdjZWJlYTg5MyJdfV19
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

[Interactions and sequences](main-diagrams.md)

### Providers {#providers}

`Console` is provided by [`SystemConsole`](dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Logger` is provided by [`ConsoleLogger`](console.md#symbol-ConsoleLogger). The same instance is shared.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `greeter` to a [`Greeter`](greeter.md#symbol-Greeter) with `x` `4` using injected `Logger` for `logger`. It passes `"AugScript"` to [`greeter.greet`](greeter.md#symbol-Greeter.greet), using injected `Console`. It sets `count` to `7`. It sets `count` to [`increment`](math.md#symbol-increment) with `value` from `count`. [source](main.md#source-L9-L12)
:::

::: spec-paragraph specification-paragraph-2
It prints `count`. [source](main.md#source-L13)
:::

### Dependencies

It uses [`SystemConsole`](dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`ConsoleLogger`](console.md#symbol-ConsoleLogger) from `console`. It uses [`Greeter`](greeter.md#symbol-Greeter) ([`greet`](greeter.md#symbol-Greeter.greet)) from `greeter`. It uses [`increment`](math.md#symbol-increment) from `math`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
