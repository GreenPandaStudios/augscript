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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZjAyOTk1NTcyNGJkNTY1MGQwZjQ0MDcwMGFjNjM5ZTlmNTZhNzQwNGYxMDQ5ZWUyZjk5YjU0ODkxMzNkNGIxNSIsImZvcm1hdHRlZFNoYTI1NiI6IjA0YzcyNjg5Y2RiNzBhMzQxMWI2YTBjMTA0YmVmNzZhY2JjYjczYTYwNGMzNGMwZDg4MTVkNTM0ZTFhMTNkODYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjE0LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvbG9nZ2luZy9pbmRleC5tZCNib3VuZGFyeS1hYWNiODdmNTAwZmMiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1jMGQzOGMwNDc1NTgiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw4IiwiZmlyc3QiOjgsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiZ3JlZXRlci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1HcmVldGVyIl19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEzLCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbImdyZWV0ZXItZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzeW1ib2wtR3JlZXRlci5ncmVldCJdfSx7ImlkIjoic291cmNlLUwyMiIsImZpcnN0IjoyMCwibGFzdCI6MjAsImJhY2tsaW5rcyI6WyJncmVldGVyLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiLCIjc3ltYm9sLUlHcmVldGVyLmdyZWV0Il19LHsiaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE1LCJsYXN0IjoyMCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSUdyZWV0ZXIiXX1dfQ
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZjAyOTk1NTcyNGJkNTY1MGQwZjQ0MDcwMGFjNjM5ZTlmNTZhNzQwNGYxMDQ5ZWUyZjk5YjU0ODkxMzNkNGIxNSIsImZvcm1hdHRlZFNoYTI1NiI6ImVhNmZjYWQ1NGVhODMxNGJjY2Q2OTA5YWQyZTJkN2ExODdkOGFmNGYzYTFiNzdmMDExMzA4YTA2NGVjZWJkZWEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjE0LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIi4uL2RpYWdyYW1zL2ZvbGRlcnMvbG9nZ2luZy9pbmRleC5tZCNib3VuZGFyeS1hYWNiODdmNTAwZmMiLCIuLi9kaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1jMGQzOGMwNDc1NTgiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw4IiwiZmlyc3QiOjgsImxhc3QiOjE2LCJiYWNrbGlua3MiOlsiZ3JlZXRlci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1HcmVldGVyIl19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEzLCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbImdyZWV0ZXItZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzeW1ib2wtR3JlZXRlci5ncmVldCJdfSx7ImlkIjoic291cmNlLUwyMiIsImZpcnN0IjoyMiwibGFzdCI6MjIsImJhY2tsaW5rcyI6WyJncmVldGVyLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiLCIjc3ltYm9sLUlHcmVldGVyLmdyZWV0Il19LHsiaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE3LCJsYXN0IjoyMywiYmFja2xpbmtzIjpbIiNzeW1ib2wtSUdyZWV0ZXIiXX1dfQ
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

[Interactions and sequences](greeter-diagrams.md)

### `Greeter` · class · [source](greeter.md#source-L8) {#symbol-Greeter}

Welcomes a user through the configured logger. It implements [`IGreeter`](greeter.md#symbol-IGreeter). The `logger` dependency is injected as [`Logger`](../logging/logger.md#symbol-Logger) and stored read-only (the application logger, injected when resolved).

#### `Greeter.greet` · [source](greeter.md#source-L13) {#symbol-Greeter.greet}

Prints a personalized greeting. It takes `name` as a string. It gets `console` ([`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

::: spec-paragraph specification-paragraph-1
It passes the text `Hello, {name}!` to [`logger.log`](../logging/logger.md#symbol-Logger.log), using injected `console`. [source](greeter.md#source-L14)
:::

::: details Checked interface

```text
greet(resolve Console console, string name) returns void uses Console.write
```

It takes `name` as a string (the user to welcome). It gets `console` ([`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

:::

### `IGreeter` · interface · [source](greeter.md#source-L17) {#symbol-IGreeter}

#### `IGreeter.greet` · [source](greeter.md#source-L22) {#symbol-IGreeter.greet}

Prints a personalized greeting. It takes `name` as a string (the user to welcome). It gets `console` ([`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console) ([`write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](../logging/logger.md#symbol-Logger) ([`log`](../logging/logger.md#symbol-Logger.log)) from `logging`.

::::

:::::
