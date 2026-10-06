---
title: "greeter.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/greeter.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `greeter.aug`

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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZWQ4YjY2ZWIzZTJlOTc3MzY3OWEzMDZkOWRkODIwN2NhZWY4MmZiNTFmNGU3YjFiMjI3NGZlYzJkZDNmOWUzNiIsImZvcm1hdHRlZFNoYTI1NiI6IjMzYmRiZTM5NzkyYTg0YmQwYTBlMTlmYmYzZTc0MTAyZGU5ODUwZWE0OTFlYmM3NDU2ZTMxYTljOTNmZDExNDkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NiwiYmFja2xpbmtzIjpbImdyZWV0ZXItZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtR3JlZXRlciJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjUsImxhc3QiOjYsImJhY2tsaW5rcyI6WyJncmVldGVyLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLUdyZWV0ZXIuZ3JlZXQiXX0seyJpZCI6InNvdXJjZS1MMTAiLCJmaXJzdCI6OCwibGFzdCI6OCwiYmFja2xpbmtzIjpbImdyZWV0ZXItZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtSUdyZWV0ZXIuZ3JlZXQiXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo2LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo3LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JR3JlZXRlciJdfV19
// aug-spec: "greeter.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
Greeter(resolve Logger logger, int x) implements IGreeter:
    greet(resolve Console console, string name):
        logger.log(message="Hello, " + name + "!")
interface IGreeter:
    greet(resolve Console console, string name) uses Console.write
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZWQ4YjY2ZWIzZTJlOTc3MzY3OWEzMDZkOWRkODIwN2NhZWY4MmZiNTFmNGU3YjFiMjI3NGZlYzJkZDNmOWUzNiIsImZvcm1hdHRlZFNoYTI1NiI6ImJiNjFkMGZjNTNkMTQ2YWQwM2YzYzdmYzRiMzY3OTFmYjNkNTIwYzdhMDZiZTM1ZWViM2Q2NGFkMjM3Y2UyODMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6OCwiYmFja2xpbmtzIjpbImdyZWV0ZXItZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtR3JlZXRlciJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjUsImxhc3QiOjcsImJhY2tsaW5rcyI6WyJncmVldGVyLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLUdyZWV0ZXIuZ3JlZXQiXX0seyJpZCI6InNvdXJjZS1MMTAiLCJmaXJzdCI6MTAsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiZ3JlZXRlci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1JR3JlZXRlci5ncmVldCJdfSx7ImlkIjoic291cmNlLUw2IiwiZmlyc3QiOjYsImxhc3QiOjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjksImxhc3QiOjExLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JR3JlZXRlciJdfV19
// aug-spec: "greeter.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
import Logger from logger
Greeter(resolve Logger logger, int x) implements IGreeter {
    greet(resolve Console console, string name) {
        logger.log(message="Hello, " + name + "!")
    }
}
interface IGreeter {
    greet(resolve Console console, string name) uses Console.write
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](greeter-diagrams.md)

### `Greeter` · class · [source](greeter.md#source-L4) {#symbol-Greeter}

It implements [`IGreeter`](greeter.md#symbol-IGreeter). It takes `x` as an integer, kept read-only. It gets `logger` ([`Logger`](logger.md#symbol-Logger)), kept read-only from dependency injection.

#### `Greeter.greet` · [source](greeter.md#source-L5) {#symbol-Greeter.greet}

::: spec-paragraph specification-paragraph-1
It takes `name` as a string. It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It passes the text `Hello, {name}!` to [`logger.log`](logger.md#symbol-Logger.log), using injected `console`. [source](greeter.md#source-L6)
:::

::: details Checked interface

```text
greet(resolve Console console, string name) returns void uses Console.write
```

It takes `name` as a string. It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection.

:::

### `IGreeter` · interface · [source](greeter.md#source-L9) {#symbol-IGreeter}

#### `IGreeter.greet` · [source](greeter.md#source-L10) {#symbol-IGreeter.greet}

It takes `name` as a string. It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](logger.md#symbol-Logger) ([`log`](logger.md#symbol-Logger.log)) from `logger`.

::::

:::::
