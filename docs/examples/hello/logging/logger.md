---
title: "logging/logger.aug · Hello world with dependencies"
generated: true
source: "examples/hello/logging/logger.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `logging/logger.aug`

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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNTA4MGFjNzZlZTUzMDczNmUzMjNhNDg3Mzk4NjA5NmE1MDcwMDYzMzBhMTFiNTNjYjM2OTBlZTJlODZjYTA3NSIsImZvcm1hdHRlZFNoYTI1NiI6ImYxMjQ3NGY1ODk0ZjRlZDA1Y2ZiYTg0YzI2ZWJmYzQ3ZGYxMWU5ZGU0YTliZDg5NzExNzA4NWJjOTQzYjkzZjEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6OSwiYmFja2xpbmtzIjpbImxvZ2dlci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1Mb2dnZXIubG9nIl19LHsiaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtTG9nZ2VyIl19XX0
// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Writes messages to an application log. */
interface Logger:
    /**
    * Writes one message.
    * @param message Text to write.
    */
    log(resolve Console console, string message) uses Console.write
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNTA4MGFjNzZlZTUzMDczNmUzMjNhNDg3Mzk4NjA5NmE1MDcwMDYzMzBhMTFiNTNjYjM2OTBlZTJlODZjYTA3NSIsImZvcm1hdHRlZFNoYTI1NiI6ImY3Y2Y4MDU1NGY2YWI5NzU2OWUyNWM2ODFmYzJlOTEzODBmNjgyYTA1NjQ2Zjc3NDJhOGJjMjA4MGU3MzM4N2IiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6OSwiYmFja2xpbmtzIjpbImxvZ2dlci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1Mb2dnZXIubG9nIl19LHsiaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUxvZ2dlciJdfV19
// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Writes messages to an application log. */
interface Logger {
    /**
    * Writes one message.
    * @param message Text to write.
    */
    log(resolve Console console, string message) uses Console.write
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](logger-diagrams.md)

### `Logger` · interface · [source](logger.md#source-L4) {#symbol-Logger}

Writes messages to an application log.

#### `Logger.log` · [source](logger.md#source-L9) {#symbol-Logger.log}

Writes one message. It takes `message` as a string (Text to write). It gets `console` ([`Console`](../dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](../dependencies/august/0.23.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](../dependencies/august/0.23.0/io/contracts.md#symbol-Console) ([`write`](../dependencies/august/0.23.0/io/contracts.md#symbol-Console.write)) from `august.io`.

::::

:::::
