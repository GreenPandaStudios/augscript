---
title: "main.aug · Generic dependency injection"
generated: true
source: "examples/generic-di/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Generic dependency injection](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`types.aug`](types.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZGRkZTkxZWZhMGQyOWIxOGEwYjBjN2JiYTlhZDQ3ZmFhZDdlMzNiYzVjMDY4MmVkYTM1MjUyYTMxZTdkMDc1MyIsImZvcm1hdHRlZFNoYTI1NiI6IjJiZjJkOTM4ODhjN2YxMmM1ZGUxZjQ5YTc0NTE4YjY0YWRlNmM1MzVlYzhiMTA0YzM5M2Y1M2JjNTJmZGFlMWIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6OSwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5LUwxMCIsImZpcnN0Ijo5LCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Repository from types
import NumberRepository from types
import Program from types
implement Repository<int> with NumberRepository
implement app with Program
resolve app to program
program.start()
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZGRkZTkxZWZhMGQyOWIxOGEwYjBjN2JiYTlhZDQ3ZmFhZDdlMzNiYzVjMDY4MmVkYTM1MjUyYTMxZTdkMDc1MyIsImZvcm1hdHRlZFNoYTI1NiI6IjJiZjJkOTM4ODhjN2YxMmM1ZGUxZjQ5YTc0NTE4YjY0YWRlNmM1MzVlYzhiMTA0YzM5M2Y1M2JjNTJmZGFlMWIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6OSwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5LUwxMCIsImZpcnN0Ijo5LCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Repository from types
import NumberRepository from types
import Program from types
implement Repository<int> with NumberRepository
implement app with Program
resolve app to program
program.start()
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Providers

`Console` is provided by [`SystemConsole`](dependencies/august/0.23.0/io/contracts.md#symbol-SystemConsole). The same instance is shared. `Repository<int>` is provided by [`NumberRepository`](types.md#symbol-NumberRepository). The same instance is shared.

`app` is provided by [`Program`](types.md#symbol-Program). The same instance is shared. It requires bindings for `Repository<int>`.

### Startup

::: spec-paragraph specification-paragraph-1
It sets `program` to the instance provided for `app`. It calls [`program.start`](types.md#symbol-Program.start) using injected `Console` for `console`. [source](main.md#source-L9-L10)
:::

### Dependencies

It uses [`SystemConsole`](dependencies/august/0.23.0/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`NumberRepository`](types.md#symbol-NumberRepository) and [`Program`](types.md#symbol-Program) ([`start`](types.md#symbol-Program.start)) from `types`.

::::

:::::
