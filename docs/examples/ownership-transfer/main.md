---
title: "main.aug · Move ownership"
generated: true
source: "examples/ownership-transfer/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Move ownership](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMzU2ZjUyZGVkYzU3MTNiODViMjFjMmU3YTBjYmY5MzlhMGE5ZjMzY2I2MDExNGIzMzE1MDhmYmRmYWVmMGY4ZiIsImZvcm1hdHRlZFNoYTI1NiI6ImQ5ZjdkYjE4NTc4MTIxNTZkZDhkNmE2YTFkNWZhODg0MTM1NjM5MTg0ZjA4ODI1MmIyMDU1ZDUyMGM5OTM0ZmYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDctTDEwIiwiZmlyc3QiOjcsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6OCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTlmODg1MjhkNjJhMSJdfSx7ImlkIjoic291cmNlLUw3IiwiZmlyc3QiOjcsImxhc3QiOjcsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS05Zjg4NTI4ZDYyYTEiLCJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo5LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOWY4ODUyOGQ2MmExIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Resource from resource
import make from resource
import consume from resource
own Resource first = make()
consume(value=first)
own Resource second = make()
print(value="end of main")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMzU2ZjUyZGVkYzU3MTNiODViMjFjMmU3YTBjYmY5MzlhMGE5ZjMzY2I2MDExNGIzMzE1MDhmYmRmYWVmMGY4ZiIsImZvcm1hdHRlZFNoYTI1NiI6ImQ5ZjdkYjE4NTc4MTIxNTZkZDhkNmE2YTFkNWZhODg0MTM1NjM5MTg0ZjA4ODI1MmIyMDU1ZDUyMGM5OTM0ZmYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDctTDEwIiwiZmlyc3QiOjcsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6OCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTlmODg1MjhkNjJhMSJdfSx7ImlkIjoic291cmNlLUw3IiwiZmlyc3QiOjcsImxhc3QiOjcsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS05Zjg4NTI4ZDYyYTEiLCJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo5LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOWY4ODUyOGQ2MmExIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Resource from resource
import make from resource
import consume from resource
own Resource first = make()
consume(value=first)
own Resource second = make()
print(value="end of main")
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Providers {#providers}

`Console` is provided by [`SystemConsole`](dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole). The same instance is shared.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It calls [`make`](resource.md#symbol-make) and stores the result in owned `first` ([`Resource`](resource.md#symbol-Resource)). It calls [`consume`](resource.md#symbol-consume) with `value` from `first` using injected `Console` for `console`. It calls [`make`](resource.md#symbol-make) and stores the result in owned `second` ([`Resource`](resource.md#symbol-Resource)). It prints `"end of main"`. [source](main.md#source-L7-L10)
:::

### Dependencies

It uses [`SystemConsole`](dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`Resource`](resource.md#symbol-Resource), [`consume`](resource.md#symbol-consume), and [`make`](resource.md#symbol-make) from `resource`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
