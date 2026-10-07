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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZGQzOTNhNjUxYzQwYjQ2YjVlNGQyZWE3YmRiZDYyNTEzZjI2NzM0N2IyY2RiMzZiNDc5YzBmYmIzM2M2NjczNCIsImZvcm1hdHRlZFNoYTI1NiI6IjNkMTE1ZTNiMTc0MjUxOWQwZTk5YjM0MzgzY2FlMmU3NDYwM2I5MDhlYWU2MGEyZWFmZmNlZjJkYjJlODhkMjAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvbG9nZ2luZy9pbmRleC5tZCNib3VuZGFyeS0yMTFkNmQzMmNlNmUiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1mMTQzYzZmZmUwMzUiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjYsImJhY2tsaW5rcyI6WyJjb25zb2xlLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLUNvbnNvbGVMb2dnZXIiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo1LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiY29uc29sZS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1Db25zb2xlTG9nZ2VyLmxvZyJdfV19
// aug-spec: "console.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
ConsoleLogger() implements Logger:
    log(resolve Console console, string message):
        console.write(value=message)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZGQzOTNhNjUxYzQwYjQ2YjVlNGQyZWE3YmRiZDYyNTEzZjI2NzM0N2IyY2RiMzZiNDc5YzBmYmIzM2M2NjczNCIsImZvcm1hdHRlZFNoYTI1NiI6IjAyMDVmMGNmOTVhZDYzMGZkOTNiZTk0YTY4MTRiODI3Njc4YWU3ZTExYTllN2FjNTg2NTBlN2JiZjQ3MTBhZWYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvbG9nZ2luZy9pbmRleC5tZCNib3VuZGFyeS0yMTFkNmQzMmNlNmUiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1mMTQzYzZmZmUwMzUiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjgsImJhY2tsaW5rcyI6WyJjb25zb2xlLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLUNvbnNvbGVMb2dnZXIiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo1LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiY29uc29sZS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1Db25zb2xlTG9nZ2VyLmxvZyJdfV19
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

Writes one message. It takes `message` as a string. It gets `console` ([`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

::: spec-paragraph specification-paragraph-1
It passes `message` to [`console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). [source](console.md#source-L6)
:::

::: details Checked interface

```text
log(resolve Console console, string message) returns void uses Console.write
```

It takes `message` as a string (Text to write). It gets `console` ([`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

:::

### Dependencies

It uses [`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console) ([`write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](logger.md#symbol-Logger) from `logger`.

::::

:::::
