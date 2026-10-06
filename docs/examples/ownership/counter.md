---
title: "counter.aug · Read access and mutable borrows"
generated: true
source: "examples/ownership/counter.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `counter.aug`

[Read access and mutable borrows](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`counter.aug`](counter.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMmY3NTk4MjFmYTAzYWUyM2UzYzg1NmEyNjZiNGY4MmZlM2UyZDllNmJmOTE3YjBkNmYxMmZjYmFhNDAyODRhMSIsImZvcm1hdHRlZFNoYTI1NiI6IjU1YTBhMmM4MDJiYjY0NDcyZTA4MjZiOWNmOTliY2RiOGRlOTlmMDAyZmJlYTdhMWE3ZjcyYTI0YzgxZDM0MWQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NywiYmFja2xpbmtzIjpbImNvdW50ZXItZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtQ291bnRlciJdfSx7ImlkIjoic291cmNlLUwzIiwiZmlyc3QiOjMsImxhc3QiOjUsImJhY2tsaW5rcyI6WyJjb3VudGVyLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLUNvdW50ZXIuaW5jcmVtZW50Il19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6NiwibGFzdCI6NywiYmFja2xpbmtzIjpbImNvdW50ZXItZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtQ291bnRlci5yZWFkIl19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjksImxhc3QiOjksImJhY2tsaW5rcyI6WyJjb3VudGVyLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiLCIjc3ltYm9sLUlDb3VudGVyLmluY3JlbWVudCJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoxMCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyJjb3VudGVyLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiLCIjc3ltYm9sLUlDb3VudGVyLnJlYWQiXX0seyJpZCI6InNvdXJjZS1MNC1MNiIsImZpcnN0Ijo0LCJsYXN0Ijo1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo3LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6OCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUlDb3VudGVyIl19XX0
// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
Counter(mutable int value) implements ICounter:
    increment():
        borrow self:
            value = value + 1
    read():
        return value
interface ICounter:
    increment() changes self
    read() returns int
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMmY3NTk4MjFmYTAzYWUyM2UzYzg1NmEyNjZiNGY4MmZlM2UyZDllNmJmOTE3YjBkNmYxMmZjYmFhNDAyODRhMSIsImZvcm1hdHRlZFNoYTI1NiI6Ijc0ZDc0NWRmNTZiZGRhNDc4ZGVlNzllODM5OWRhY2MzZGE2M2FjNTBmNWIwNTU2MDgyY2E3Mjc4MTdlMTNjZjAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MTEsImJhY2tsaW5rcyI6WyJjb3VudGVyLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLUNvdW50ZXIiXX0seyJpZCI6InNvdXJjZS1MMyIsImZpcnN0IjozLCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiY291bnRlci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1Db3VudGVyLmluY3JlbWVudCJdfSx7ImlkIjoic291cmNlLUw4IiwiZmlyc3QiOjgsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiY291bnRlci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1Db3VudGVyLnJlYWQiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6MTMsImxhc3QiOjEzLCJiYWNrbGlua3MiOlsiY291bnRlci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1JQ291bnRlci5pbmNyZW1lbnQiXX0seyJpZCI6InNvdXJjZS1MMTQiLCJmaXJzdCI6MTQsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiY291bnRlci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01IiwiI3N5bWJvbC1JQ291bnRlci5yZWFkIl19LHsiaWQiOiJzb3VyY2UtTDQtTDYiLCJmaXJzdCI6NCwibGFzdCI6NiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6OSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjEyLCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSUNvdW50ZXIiXX1dfQ
// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
Counter(mutable int value) implements ICounter {
    increment() {
        borrow self {
            value = value + 1
        }
    }
    read() {
        return value
    }
}
interface ICounter {
    increment() changes self
    read() returns int
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](counter-diagrams.md)

### `Counter` · class · [source](counter.md#source-L2) {#symbol-Counter}

It implements [`ICounter`](counter.md#symbol-ICounter). It takes `value` as an integer, kept mutable.

#### `Counter.increment` · [source](counter.md#source-L3) {#symbol-Counter.increment}

::: spec-paragraph specification-paragraph-1
With temporary permission to change `self`, it increases `value` by `1`. [source](counter.md#source-L4-L6)
:::

::: details Checked interface

```text
increment() returns void changes self
```

It may change `self`.

:::

#### `Counter.read` · [source](counter.md#source-L8) {#symbol-Counter.read}

::: spec-paragraph specification-paragraph-2
It returns `value`. [source](counter.md#source-L9)
:::

::: details Checked interface

```text
read() returns int
```

:::

### `ICounter` · interface · [source](counter.md#source-L12) {#symbol-ICounter}

#### `ICounter.increment` · [source](counter.md#source-L13) {#symbol-ICounter.increment}

It may change `self`.

#### `ICounter.read` · [source](counter.md#source-L14) {#symbol-ICounter.read}

It returns `int`.

::::

:::::
