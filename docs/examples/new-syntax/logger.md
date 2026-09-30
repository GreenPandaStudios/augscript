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

```aug [Indentation]
// aug-spec: "logger.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
/** Displays application messages. */
interface Logger:
    /** @param message Text to display. */
    log(resolve Console console, string message) uses Console.write
```

```aug [Braces]
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

<a id="symbol-Logger"></a>
### `Logger` · interface · [source](logger.md#code)

Displays application messages.

<a id="symbol-Logger.log"></a>
#### `Logger.log` · [source](logger.md#code)

The caller supplies `message` as `string` (Text to display). Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

::::

:::::
