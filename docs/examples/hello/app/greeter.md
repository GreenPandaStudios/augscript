---
title: "app/greeter.aug · Hello world with dependencies"
generated: true
source: "examples/hello/app/greeter.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `app/greeter.aug`

[Hello world with dependencies](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`app/export.aug`](export.md)
- [`app/greeter.aug`](greeter.md)
- [`logging/console.aug`](../logging/console.md)
- [`logging/export.aug`](../logging/export.md)
- [`logging/logger.aug`](../logging/logger.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZjAyOTk1NTcyNGJkNTY1MGQwZjQ0MDcwMGFjNjM5ZTlmNTZhNzQwNGYxMDQ5ZWUyZjk5YjU0ODkxMzNkNGIxNSIsImZvcm1hdHRlZFNoYTI1NiI6IjA0YzcyNjg5Y2RiNzBhMzQxMWI2YTBjMTA0YmVmNzZhY2JjYjczYTYwNGMzNGMwZDg4MTVkNTM0ZTFhMTNkODYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUdyZWV0ZXIiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6MTMsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1HcmVldGVyLmdyZWV0Il19LHsiaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjE0LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE1LCJsYXN0IjoyMCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSUdyZWV0ZXIiXX0seyJpZCI6InNvdXJjZS1MMjIiLCJmaXJzdCI6MjAsImxhc3QiOjIwLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JR3JlZXRlci5ncmVldCJdfV19
// aug-spec: "greeter.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logging
/**
* Welcomes a user through the configured logger.
* @param logger The application logger, injected when resolved.
*/
Greeter(resolve Logger logger) implements IGreeter:
    /**
    * Prints a personalized greeting.
    * @param name The user to welcome.
    */
    greet(resolve Console console, string name):
        logger.log(message="Hello, " + name + "!")
interface IGreeter:
    /**
    * Prints a personalized greeting.
    * @param name The user to welcome.
    */
    greet(resolve Console console, string name) uses Console.write
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZjAyOTk1NTcyNGJkNTY1MGQwZjQ0MDcwMGFjNjM5ZTlmNTZhNzQwNGYxMDQ5ZWUyZjk5YjU0ODkxMzNkNGIxNSIsImZvcm1hdHRlZFNoYTI1NiI6ImVhNmZjYWQ1NGVhODMxNGJjY2Q2OTA5YWQyZTJkN2ExODdkOGFmNGYzYTFiNzdmMDExMzA4YTA2NGVjZWJkZWEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6MTYsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUdyZWV0ZXIiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6MTMsImxhc3QiOjE1LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1HcmVldGVyLmdyZWV0Il19LHsiaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjE0LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE3LCJsYXN0IjoyMywiYmFja2xpbmtzIjpbIiNzeW1ib2wtSUdyZWV0ZXIiXX0seyJpZCI6InNvdXJjZS1MMjIiLCJmaXJzdCI6MjIsImxhc3QiOjIyLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JR3JlZXRlci5ncmVldCJdfV19
// aug-spec: "greeter.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logging
/**
* Welcomes a user through the configured logger.
* @param logger The application logger, injected when resolved.
*/
Greeter(resolve Logger logger) implements IGreeter {
    /**
    * Prints a personalized greeting.
    * @param name The user to welcome.
    */
    greet(resolve Console console, string name) {
        logger.log(message="Hello, " + name + "!")
    }
}
interface IGreeter {
    /**
    * Prints a personalized greeting.
    * @param name The user to welcome.
    */
    greet(resolve Console console, string name) uses Console.write
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Greeter` · class · [source](greeter.md#source-L8) {#symbol-Greeter}

Welcomes a user through the configured logger. It implements [`IGreeter`](greeter.md#symbol-IGreeter). The `logger` dependency is injected as [`Logger`](../logging/logger.md#symbol-Logger) and stored read-only (the application logger, injected when resolved).

#### `Greeter.greet` · [source](greeter.md#source-L13) {#symbol-Greeter.greet}

::: spec-paragraph specification-paragraph-1
Prints a personalized greeting. It takes `name` as a string. It gets `console` ([`Console`](../dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It passes the text `Hello, {name}!` to [`logger.log`](../logging/logger.md#symbol-Logger.log), using injected `console`. [source](greeter.md#source-L14)
:::

::: details Checked interface

```text
greet(resolve Console console, string name) returns void uses Console.write
```

It takes `name` as a string (the user to welcome). It gets `console` ([`Console`](../dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection.

:::

### `IGreeter` · interface · [source](greeter.md#source-L17) {#symbol-IGreeter}

#### `IGreeter.greet` · [source](greeter.md#source-L22) {#symbol-IGreeter.greet}

Prints a personalized greeting. It takes `name` as a string (the user to welcome). It gets `console` ([`Console`](../dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](../dependencies/august/0.23.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](../dependencies/august/0.23.0/io/contracts.md#symbol-Console) ([`write`](../dependencies/august/0.23.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](../logging/logger.md#symbol-Logger) ([`log`](../logging/logger.md#symbol-Logger.log)) from `logging`.

::::

:::::
