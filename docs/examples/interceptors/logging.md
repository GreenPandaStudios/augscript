---
title: "logging.aug · Function and constructor middleware"
generated: true
source: "examples/interceptors/logging.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logging.aug`

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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiM2Q3NmM0NDI2YzUwYmQ2NGI1MzIzZmUxZGJiYjE2ZTAzZWNmY2VkZDRjOGJmZWEyOGE4ODhmNjMxZmJmNzY3YSIsImZvcm1hdHRlZFNoYTI1NiI6IjIwYzY1N2FkZGNhN2Y3ZWE1ZGE5MzM4YTU3MjI0YTk0NjU4NDg2ZjkwNDkzYjVlM2U2MzNiNDg0NzhlZTRjZTEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDExIiwiZmlyc3QiOjEwLCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTIxMmY5MjI4YjJiMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbImxvZ2dpbmctZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtTG9nZ2VyLmxvZyJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjgsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsibG9nZ2luZy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1Db25zb2xlTG9nZ2VyIl19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjksImxhc3QiOjEwLCJiYWNrbGlua3MiOlsibG9nZ2luZy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1Db25zb2xlTG9nZ2VyLmxvZyJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjYsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUxvZ2dlciJdfV19
// aug-spec: "logging.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Writes a message to the application log. */
interface Logger:
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
/** Console logger shared by interceptor instances and the application. */
ConsoleLogger() implements Logger:
    log(resolve Console console, string message):
        console.write(value=message)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiM2Q3NmM0NDI2YzUwYmQ2NGI1MzIzZmUxZGJiYjE2ZTAzZWNmY2VkZDRjOGJmZWEyOGE4ODhmNjMxZmJmNzY3YSIsImZvcm1hdHRlZFNoYTI1NiI6IjA2Zjk4NzQ4ODhlODNhOTljNTZmYWE4ZjM3ZGM1MDNjN2IxMDhhNmViZWIyYzFkN2VlMGZjNDM2NDRjMWU5ZWQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDExIiwiZmlyc3QiOjExLCJsYXN0IjoxMSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTIxMmY5MjI4YjJiMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbImxvZ2dpbmctZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtTG9nZ2VyLmxvZyJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjksImxhc3QiOjEzLCJiYWNrbGlua3MiOlsibG9nZ2luZy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1Db25zb2xlTG9nZ2VyIl19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjEwLCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbImxvZ2dpbmctZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtQ29uc29sZUxvZ2dlci5sb2ciXX0seyJpZCI6InNvdXJjZS1MNCIsImZpcnN0Ijo0LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Mb2dnZXIiXX1dfQ
// aug-spec: "logging.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Writes a message to the application log. */
interface Logger {
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
}
/** Console logger shared by interceptor instances and the application. */
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

[Interactions and sequences](logging-diagrams.md)

### `Logger` · interface · [source](logging.md#source-L4) {#symbol-Logger}

Writes a message to the application log.

#### `Logger.log` · [source](logging.md#source-L6) {#symbol-Logger.log}

It takes `message` as a string (Text to display). It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

### `ConsoleLogger` · class · [source](logging.md#source-L9) {#symbol-ConsoleLogger}

Console logger shared by interceptor instances and the application. It implements [`Logger`](logging.md#symbol-Logger).

#### `ConsoleLogger.log` · [source](logging.md#source-L10) {#symbol-ConsoleLogger.log}

::: spec-paragraph specification-paragraph-1
It takes `message` as a string. It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). It passes `message` to [`console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). [source](logging.md#source-L11)
:::

::: details Checked interface

```text
log(resolve Console console, string message) returns void uses Console.write
```

It takes `message` as a string (Text to display). It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

:::

### Dependencies

It uses [`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)) from `august.io`.

::::

:::::
