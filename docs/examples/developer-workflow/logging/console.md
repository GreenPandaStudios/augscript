---
title: "logging/console.aug · A small tested application"
generated: true
source: "examples/developer-workflow/logging/console.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logging/console.aug`

[A small tested application](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`calculator.aug`](../calculator.md)
- [`logging/console.aug`](console.md)
- [`logging/export.aug`](export.md)
- [`logging/logger.aug`](logger.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMDMzOGQwZTE4NzYxNDM1YmM2NDUwMzMyNjJiMjVhMjY5NDNkOWVjZjIxZDM4MTQwYTQyOWIzNDU1NzY1MzYzMSIsImZvcm1hdHRlZFNoYTI1NiI6IjI4NTllNDQ0ZWMyNjQzZWE4NDkxZjIyN2ViYTZlNmVkZDc5YmIxYzgxMjA0ZmUyYzg4YjMwOTU0NGZhNTkxOWEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDciLCJmaXJzdCI6NywibGFzdCI6NywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvbG9nZ2luZy9pbmRleC5tZCNib3VuZGFyeS0yMTFkNmQzMmNlNmUiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1mMTQzYzZmZmUwMzUiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjUsImxhc3QiOjcsImJhY2tsaW5rcyI6WyJjb25zb2xlLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLUNvbnNvbGVMb2dnZXIiXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo2LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiY29uc29sZS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1Db25zb2xlTG9nZ2VyLmxvZyJdfV19
// aug-spec: "console.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
/** Writes application messages to standard output. */
ConsoleLogger() implements Logger:
    log(resolve Console console, string message):
        console.write(value=message)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMDMzOGQwZTE4NzYxNDM1YmM2NDUwMzMyNjJiMjVhMjY5NDNkOWVjZjIxZDM4MTQwYTQyOWIzNDU1NzY1MzYzMSIsImZvcm1hdHRlZFNoYTI1NiI6IjMxNjhiOGIxNTA5M2ViNGE3NWIwMzExYjMzOWM0ODAzODIwMDRmNzI3NDdjMWIxYzU5YzcyYmEzMmIyOTQ0Y2EiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDciLCJmaXJzdCI6NywibGFzdCI6NywiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvbG9nZ2luZy9pbmRleC5tZCNib3VuZGFyeS0yMTFkNmQzMmNlNmUiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1mMTQzYzZmZmUwMzUiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjUsImxhc3QiOjksImJhY2tsaW5rcyI6WyJjb25zb2xlLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLUNvbnNvbGVMb2dnZXIiXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo2LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiY29uc29sZS1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1Db25zb2xlTG9nZ2VyLmxvZyJdfV19
// aug-spec: "console.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
/** Writes application messages to standard output. */
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

### `ConsoleLogger` · class · [source](console.md#source-L5) {#symbol-ConsoleLogger}

Writes application messages to standard output. It implements [`Logger`](logger.md#symbol-Logger).

#### `ConsoleLogger.log` · [source](console.md#source-L6) {#symbol-ConsoleLogger.log}

::: spec-paragraph specification-paragraph-1
It takes `message` as a string. It gets `console` ([`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). It passes `message` to [`console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). [source](console.md#source-L7)
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
