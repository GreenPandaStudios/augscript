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

```aug [Indentation]
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

```aug [Braces]
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

<a id="symbol-Logger"></a>
### `Logger` · interface · [source](logger.md#code)

Writes messages to an application log.

<a id="symbol-Logger.log"></a>
#### `Logger.log` · [source](logger.md#code)

Writes one message. The caller supplies `message` as `string` (Text to write). Dependency injection supplies `console` as [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

The file uses [`Console`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](../dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

::::

:::::
