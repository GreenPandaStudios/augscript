---
title: "logging/logger.aug · A small tested application"
generated: true
source: "examples/developer-workflow/logging/logger.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logging/logger.aug`

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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOTQ5MzcyOGQzMDIyZDAyY2EwMDkwNDEyNjM3ZWZkOWJlMTk3NzY4YWE3NmQ4OGJjMTMyZWIzODdlN2UyZWMzMiIsImZvcm1hdHRlZFNoYTI1NiI6IjcxMjk0MGQwOTRkOWQyODI1MGEwZmExN2RlOGNmOGQzYmQ3OTFmODU3MTYxYTY0ZDc0YTVhYjMwODNmZmNjYzAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbImxvZ2dlci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1Mb2dnZXIubG9nIl19LHsiaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtTG9nZ2VyIl19XX0
// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Receives a message describing an application operation. */
interface Logger:
    /** @param message Text to write. */
    log(resolve Console console, string message) uses Console.write
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOTQ5MzcyOGQzMDIyZDAyY2EwMDkwNDEyNjM3ZWZkOWJlMTk3NzY4YWE3NmQ4OGJjMTMyZWIzODdlN2UyZWMzMiIsImZvcm1hdHRlZFNoYTI1NiI6IjQzYmM0ODFiM2M4ZWNhYWVjNGIyOTYzYzUxNzQwZWYyNTViMDRiNzY0ZDUzMDdiY2Q0MWMxNmYwNzMwNjhjYjkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6NiwiYmFja2xpbmtzIjpbImxvZ2dlci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1Mb2dnZXIubG9nIl19LHsiaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtTG9nZ2VyIl19XX0
// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Receives a message describing an application operation. */
interface Logger {
    /** @param message Text to write. */
    log(resolve Console console, string message) uses Console.write
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](logger-diagrams.md)

### `Logger` · interface · [source](logger.md#source-L4) {#symbol-Logger}

Receives a message describing an application operation.

#### `Logger.log` · [source](logger.md#source-L6) {#symbol-Logger.log}

It takes `message` as a string (Text to write). It gets `console` ([`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console) ([`write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)) from `august.io`.

::::

:::::
