---
title: "logging/console.aug · Hello world with dependencies"
generated: true
source: "examples/hello/logging/console.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logging/console.aug`

[Hello world with dependencies](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`app/export.aug`](../app/export.md)
- [`app/greeter.aug`](../app/greeter.md)
- [`logging/console.aug`](console.md)
- [`logging/export.aug`](export.md)
- [`logging/logger.aug`](logger.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZGQzOTNhNjUxYzQwYjQ2YjVlNGQyZWE3YmRiZDYyNTEzZjI2NzM0N2IyY2RiMzZiNDc5YzBmYmIzM2M2NjczNCIsImZvcm1hdHRlZFNoYTI1NiI6IjNkMTE1ZTNiMTc0MjUxOWQwZTk5YjM0MzgzY2FlMmU3NDYwM2I5MDhlYWU2MGEyZWFmZmNlZjJkYjJlODhkMjAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NiwiYmFja2xpbmtzIjpbImNvbnNvbGUtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtQ29uc29sZUxvZ2dlciJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjUsImxhc3QiOjYsImJhY2tsaW5rcyI6WyJjb25zb2xlLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLUNvbnNvbGVMb2dnZXIubG9nIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "console.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
ConsoleLogger() implements Logger:
    log(resolve Console console, string message):
        console.write(value=message)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZGQzOTNhNjUxYzQwYjQ2YjVlNGQyZWE3YmRiZDYyNTEzZjI2NzM0N2IyY2RiMzZiNDc5YzBmYmIzM2M2NjczNCIsImZvcm1hdHRlZFNoYTI1NiI6IjAyMDVmMGNmOTVhZDYzMGZkOTNiZTk0YTY4MTRiODI3Njc4YWU3ZTExYTllN2FjNTg2NTBlN2JiZjQ3MTBhZWYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6OCwiYmFja2xpbmtzIjpbImNvbnNvbGUtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtQ29uc29sZUxvZ2dlciJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjUsImxhc3QiOjcsImJhY2tsaW5rcyI6WyJjb25zb2xlLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLUNvbnNvbGVMb2dnZXIubG9nIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "console.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
ConsoleLogger() implements Logger {
    log(resolve Console console, string message) {
        console.write(value=message)
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](console-diagrams.md)

### `ConsoleLogger` · class · [source](console.md#source-L4) {#symbol-ConsoleLogger}

It implements [`Logger`](logger.md#symbol-Logger).

#### `ConsoleLogger.log` · [source](console.md#source-L5) {#symbol-ConsoleLogger.log}

::: spec-paragraph specification-paragraph-1
Writes one message. It takes `message` as a string. It gets `console` ([`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It passes `message` to [`console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). [source](console.md#source-L6)
:::

::: details Checked interface

```text
log(resolve Console console, string message) returns void uses Console.write
```

It takes `message` as a string (Text to write). It gets `console` ([`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection.

:::

### Dependencies

It uses [`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console) ([`write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](logger.md#symbol-Logger) from `logger`.

::::

:::::
