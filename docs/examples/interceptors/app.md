---
title: "app.aug · Function and constructor middleware"
generated: true
source: "examples/interceptors/app.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `app.aug`

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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOTYzNDU3YTM1NWYyYmVhOWUwZTc1NmVhMDM5MjgwNmU4NDVhNTRlNmFiZTQwOTU5MjFlZTgzZWNjMjA2MGY3YyIsImZvcm1hdHRlZFNoYTI1NiI6ImFkM2I0OWIzMjgzZDM4NDAxNDc2MjliMWJjZjIyZWZmMWI5MDJkZGEyNTIzNDk0ZDlhZTAxNTU2NGE3NjBhNzYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDE1IiwiZmlyc3QiOjE1LCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIiNzeW1ib2wtZGVzY3JpYmUiXX0seyJpZCI6InNvdXJjZS1MMTYtTDE3IiwiZmlyc3QiOjE2LCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDE5IiwiZmlyc3QiOjE4LCJsYXN0IjoxOSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSUdyZWV0ZXIiXX0seyJpZCI6InNvdXJjZS1MMjAiLCJmaXJzdCI6MTksImxhc3QiOjE5LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JR3JlZXRlci5ncmVldCJdfSx7ImlkIjoic291cmNlLUwyMyIsImZpcnN0IjoyMSwibGFzdCI6MjUsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUdyZWV0ZXIiXX0seyJpZCI6InNvdXJjZS1MMjYiLCJmaXJzdCI6MjQsImxhc3QiOjI1LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1HcmVldGVyLmdyZWV0Il19LHsiaWQiOiJzb3VyY2UtTDI3IiwiZmlyc3QiOjI1LCJsYXN0IjoyNSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19XX0
// aug-spec: "app.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logging
import Audit from interceptors
import Positive from interceptors
import AddOne from interceptors
/**
* Prints a number and returns its label.
* @param x The numeric input, validated and incremented by the chain.
* @param label Text forwarded through each layer unchanged.
*/
[Audit]
[Positive(y=x)]
[AddOne(y=x)]
describe(resolve Logger logger, resolve Console console, int x, string label):
    console.write(value=x)
    return label
interface IGreeter:
    greet(resolve Logger logger, resolve Console console) returns string uses Console.write
/** Construction stores its inputs; startup is visible in the greet call. */
Greeter(resolve Logger logger to _logger, string name) implements IGreeter:
    /** Method annotations wrap each method invocation separately. */
    [Audit]
    greet(resolve Logger logger, resolve Console console):
        return "Hello, " + name + "!"
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOTYzNDU3YTM1NWYyYmVhOWUwZTc1NmVhMDM5MjgwNmU4NDVhNTRlNmFiZTQwOTU5MjFlZTgzZWNjMjA2MGY3YyIsImZvcm1hdHRlZFNoYTI1NiI6ImY1OTVlODg2M2MwMGI4OTUwM2Q1MzE2NTE3ZDIxYjFjZDNmNTExMTBhNmRmMGY4NDE5NzU1OTNlMjlhODA2ODMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDE1IiwiZmlyc3QiOjE1LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtZGVzY3JpYmUiXX0seyJpZCI6InNvdXJjZS1MMTYtTDE3IiwiZmlyc3QiOjE2LCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDE5IiwiZmlyc3QiOjE5LCJsYXN0IjoyMSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSUdyZWV0ZXIiXX0seyJpZCI6InNvdXJjZS1MMjAiLCJmaXJzdCI6MjAsImxhc3QiOjIwLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JR3JlZXRlci5ncmVldCJdfSx7ImlkIjoic291cmNlLUwyMyIsImZpcnN0IjoyMywibGFzdCI6MjksImJhY2tsaW5rcyI6WyIjc3ltYm9sLUdyZWV0ZXIiXX0seyJpZCI6InNvdXJjZS1MMjYiLCJmaXJzdCI6MjYsImxhc3QiOjI4LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1HcmVldGVyLmdyZWV0Il19LHsiaWQiOiJzb3VyY2UtTDI3IiwiZmlyc3QiOjI3LCJsYXN0IjoyNywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19XX0
// aug-spec: "app.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logging
import Audit from interceptors
import Positive from interceptors
import AddOne from interceptors
/**
* Prints a number and returns its label.
* @param x The numeric input, validated and incremented by the chain.
* @param label Text forwarded through each layer unchanged.
*/
[Audit]
[Positive(y=x)]
[AddOne(y=x)]
describe(resolve Logger logger, resolve Console console, int x, string label) {
    console.write(value=x)
    return label
}
interface IGreeter {
    greet(resolve Logger logger, resolve Console console) returns string uses Console.write
}
/** Construction stores its inputs; startup is visible in the greet call. */
Greeter(resolve Logger logger to _logger, string name) implements IGreeter {
    /** Method annotations wrap each method invocation separately. */
    [Audit]
    greet(resolve Logger logger, resolve Console console) {
        return "Hello, " + name + "!"
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `describe` · [source](app.md#source-L15) {#symbol-describe}

Prints a number and returns its label. It takes labeled inputs `x` and `label`. It gets `logger` ([`Logger`](logging.md#symbol-Logger)) and `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection.

Layers run in the declared order. Call [`Audit.around`](interceptors.md#symbol-Audit.around). Call [`Positive.around`](interceptors.md#symbol-Positive.around). Map `x` to `y`. Call [`AddOne.around`](interceptors.md#symbol-AddOne.around). Map `x` to `y`.

::: spec-paragraph specification-paragraph-1
It passes `x` to [`console.write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write). It returns `label`. [source](app.md#source-L16-L17)
:::

::: details Checked interface

```text
describe(resolve Logger logger, resolve Console console, int x, string label) returns string unless ValidationError uses Console.write
```

It takes `x` as an integer (the numeric input, validated and incremented by the chain) and `label` as a string (Text forwarded through each layer unchanged). It gets `logger` ([`Logger`](logging.md#symbol-Logger)) and `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. Failures can raise `ValidationError`.

:::

### `IGreeter` · interface · [source](app.md#source-L19) {#symbol-IGreeter}

#### `IGreeter.greet` · [source](app.md#source-L20) {#symbol-IGreeter.greet}

It gets `logger` ([`Logger`](logging.md#symbol-Logger)) and `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It returns `string`. It can call [`Console.write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write).

### `Greeter` · class · [source](app.md#source-L23) {#symbol-Greeter}

Construction stores its inputs; startup is visible in the greet call. It implements [`IGreeter`](app.md#symbol-IGreeter). It takes `name` as a string, kept read-only. It gets `_logger` ([`Logger`](logging.md#symbol-Logger)), kept read-only and private as `_logger` from dependency injection.

#### `Greeter.greet` · [source](app.md#source-L26) {#symbol-Greeter.greet}

Method annotations wrap each method invocation separately. It gets `logger` ([`Logger`](logging.md#symbol-Logger)) and `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. Layers run in the declared order. Call [`Audit.around`](interceptors.md#symbol-Audit.around).

::: spec-paragraph specification-paragraph-2
It returns the text `Hello, {name}!`. [source](app.md#source-L27)
:::

::: details Checked interface

```text
greet(resolve Logger logger, resolve Console console) returns string uses Console.write
```

It gets `logger` ([`Logger`](logging.md#symbol-Logger)) and `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection.

:::

### Dependencies

It uses [`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`AddOne`](interceptors.md#symbol-AddOne) ([`around`](interceptors.md#symbol-AddOne.around)), [`Audit`](interceptors.md#symbol-Audit) ([`around`](interceptors.md#symbol-Audit.around)), and [`Positive`](interceptors.md#symbol-Positive) ([`around`](interceptors.md#symbol-Positive.around)) from `interceptors`. It uses [`Logger`](logging.md#symbol-Logger) from `logging`.

::::

:::::
