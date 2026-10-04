---
title: "logger.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/logger.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logger.aug`

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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOWZmZWQ2Y2M1NjQzZWUyNzBmMTY0NGVkNzc4OGNmMzEyMWExYzA4YWM5MzdjMjgzNzM0ZGUzYzA3ZjUxMjYxOCIsImZvcm1hdHRlZFNoYTI1NiI6ImViNzIxZDM5M2M0ZGNjOWJkZTRiNGZmMDI4MDYyMzhlZmIwNjA2MjgyMDY3NGIwODg1ZDBkYTc0YzYxNzQ0NTYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtTG9nZ2VyIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtTG9nZ2VyLmxvZyJdfV19
// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Displays application messages. */
interface Logger:
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOWZmZWQ2Y2M1NjQzZWUyNzBmMTY0NGVkNzc4OGNmMzEyMWExYzA4YWM5MzdjMjgzNzM0ZGUzYzA3ZjUxMjYxOCIsImZvcm1hdHRlZFNoYTI1NiI6IjRiMjU3MjgxZjBkOGViOTRjZDJlOWFmNTQ3NDIxNDI3MzE3OGVmZjg3NjNhMzY1ZWZmMjY1NDg5YjE2YzlmMWQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtTG9nZ2VyIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtTG9nZ2VyLmxvZyJdfV19
// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Displays application messages. */
interface Logger {
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Logger` · interface · [source](logger.md#source-L4) {#symbol-Logger}

Displays application messages.

#### `Logger.log` · [source](logger.md#source-L6) {#symbol-Logger.log}

It takes `message` as a string (Text to display). It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write)) from `august.io`.

::::

:::::
