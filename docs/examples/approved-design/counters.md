---
title: "counters.aug · Modules and composition"
generated: true
source: "examples/approved-design/counters.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `counters.aug`

[Modules and composition](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`counters.aug`](counters.md)
- [`domain/app.aug`](domain/app.md)
- [`domain/export.aug`](domain/export.md)
- [`domain/models.aug`](domain/models.md)
- [`domain/numbers.aug`](domain/numbers.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYWU3YzZmNmU4Y2I5ODA1MDVhMzhmMGQxZTU3YmE1ZjhhOWQxNGEyZjEyNGM2MDQwNzM1Mzc4Y2IxM2EyODczMSIsImZvcm1hdHRlZFNoYTI1NiI6ImI1YzY4N2ExM2ZhYjIzZTRiZjNlODVmNDY4MDAxZWEzNTFmM2ZjMDQzMTIyZjkwMzJhODU4ODg3NTE4ZDgxMTUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NCwiYmFja2xpbmtzIjpbImNvdW50ZXJzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLVN0YXRlLnJlYWQiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo1LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiY291bnRlcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzeW1ib2wtX0luaXRpYWwiXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo2LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiY291bnRlcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtX0luaXRpYWwucmVhZCJdfSx7ImlkIjoic291cmNlLUw4IiwiZmlyc3QiOjgsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiY291bnRlcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCIsIiNzeW1ib2wtX1VwZGF0ZWQiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo5LCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbImNvdW50ZXJzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiLCIjc3ltYm9sLV9VcGRhdGVkLnJlYWQiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6MTMsImxhc3QiOjEzLCJiYWNrbGlua3MiOlsiY291bnRlcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNiIsIiNzeW1ib2wtQ291bnRlci5pbmNyZW1lbnQiXX0seyJpZCI6InNvdXJjZS1MMTQiLCJmaXJzdCI6MTQsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiY291bnRlcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNyIsIiNzeW1ib2wtQ291bnRlci52YWx1ZSJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNSwibGFzdCI6MTksImJhY2tsaW5rcyI6WyJjb3VudGVycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC04IiwiI3N5bWJvbC1fQ291bnRlciJdfSx7ImlkIjoic291cmNlLUwxNiIsImZpcnN0IjoxNiwibGFzdCI6MTcsImJhY2tsaW5rcyI6WyJjb3VudGVycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC05IiwiI3N5bWJvbC1fQ291bnRlci5pbmNyZW1lbnQiXX0seyJpZCI6InNvdXJjZS1MMTgiLCJmaXJzdCI6MTgsImxhc3QiOjE5LCJiYWNrbGlua3MiOlsiY291bnRlcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTAiLCIjc3ltYm9sLV9Db3VudGVyLnZhbHVlIl19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtU3RhdGUiXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MTIsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Db3VudGVyIl19LHsiaWQiOiJzb3VyY2UtTDIxIiwiZmlyc3QiOjIxLCJsYXN0IjoyMywiYmFja2xpbmtzIjpbIiNzeW1ib2wtQ291bnRlcnMiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo3LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMTAiLCJmaXJzdCI6MTAsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTciLCJmaXJzdCI6MTcsImxhc3QiOjE3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MMTkiLCJmaXJzdCI6MTksImxhc3QiOjE5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiXX1dfQ
// aug-spec: "counters.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Reading state has no mutation effect. */
interface State:
    read() returns int
_Initial() implements State:
    read():
        return 0
_Updated(int count) implements State:
    read():
        return count
/** A mutable counter with an explicit transition contract. */
interface Counter:
    increment() changes self
    value() returns int
_Counter(resolve mutable State initial to _state) implements Counter:
    increment():
        _state to _Updated(count=_state.read() + 1)
    value():
        return _state.read()
/** The complete counter composition; its mutable state belongs to each scope. */
composition Counters:
    implement State with _Initial
    implement Counter with _Counter scoped mutable
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYWU3YzZmNmU4Y2I5ODA1MDVhMzhmMGQxZTU3YmE1ZjhhOWQxNGEyZjEyNGM2MDQwNzM1Mzc4Y2IxM2EyODczMSIsImZvcm1hdHRlZFNoYTI1NiI6ImNiOTYwN2Q3MjZhNWFlOThkZjU1YWY2ZjgyZjFjNWM2Y2JhOTdiMzc1N2JiOTI1OGUyODU0NzZkZmFjMDhiOGEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NCwiYmFja2xpbmtzIjpbImNvdW50ZXJzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLVN0YXRlLnJlYWQiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo2LCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbImNvdW50ZXJzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLV9Jbml0aWFsIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NywibGFzdCI6OSwiYmFja2xpbmtzIjpbImNvdW50ZXJzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiLCIjc3ltYm9sLV9Jbml0aWFsLnJlYWQiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0IjoxMSwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyJjb3VudGVycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1fVXBkYXRlZCJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjEyLCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbImNvdW50ZXJzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTUiLCIjc3ltYm9sLV9VcGRhdGVkLnJlYWQiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6MTgsImxhc3QiOjE4LCJiYWNrbGlua3MiOlsiY291bnRlcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNiIsIiNzeW1ib2wtQ291bnRlci5pbmNyZW1lbnQiXX0seyJpZCI6InNvdXJjZS1MMTQiLCJmaXJzdCI6MTksImxhc3QiOjE5LCJiYWNrbGlua3MiOlsiY291bnRlcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNyIsIiNzeW1ib2wtQ291bnRlci52YWx1ZSJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoyMSwibGFzdCI6MjgsImJhY2tsaW5rcyI6WyJjb3VudGVycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC04IiwiI3N5bWJvbC1fQ291bnRlciJdfSx7ImlkIjoic291cmNlLUwxNiIsImZpcnN0IjoyMiwibGFzdCI6MjQsImJhY2tsaW5rcyI6WyJjb3VudGVycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC05IiwiI3N5bWJvbC1fQ291bnRlci5pbmNyZW1lbnQiXX0seyJpZCI6InNvdXJjZS1MMTgiLCJmaXJzdCI6MjUsImxhc3QiOjI3LCJiYWNrbGlua3MiOlsiY291bnRlcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMTAiLCIjc3ltYm9sLV9Db3VudGVyLnZhbHVlIl19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtU3RhdGUiXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MTcsImxhc3QiOjIwLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Db3VudGVyIl19LHsiaWQiOiJzb3VyY2UtTDIxIiwiZmlyc3QiOjMwLCJsYXN0IjozMywiYmFja2xpbmtzIjpbIiNzeW1ib2wtQ291bnRlcnMiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo4LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMTAiLCJmaXJzdCI6MTMsImxhc3QiOjEzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTciLCJmaXJzdCI6MjMsImxhc3QiOjIzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MMTkiLCJmaXJzdCI6MjYsImxhc3QiOjI2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiXX1dfQ
// aug-spec: "counters.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Reading state has no mutation effect. */
interface State {
    read() returns int
}
_Initial() implements State {
    read() {
        return 0
    }
}
_Updated(int count) implements State {
    read() {
        return count
    }
}
/** A mutable counter with an explicit transition contract. */
interface Counter {
    increment() changes self
    value() returns int
}
_Counter(resolve mutable State initial to _state) implements Counter {
    increment() {
        _state to _Updated(count=_state.read() + 1)
    }
    value() {
        return _state.read()
    }
}
/** The complete counter composition; its mutable state belongs to each scope. */
composition Counters {
    implement State with _Initial
    implement Counter with _Counter scoped mutable
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](counters-diagrams.md)

### `State` · interface · [source](counters.md#source-L3) {#symbol-State}

Reading state has no mutation effect.

#### `State.read` · [source](counters.md#source-L4) {#symbol-State.read}

It returns `int`.

### `Counter` · interface · [source](counters.md#source-L12) {#symbol-Counter}

A mutable counter with an explicit transition contract.

#### `Counter.increment` · [source](counters.md#source-L13) {#symbol-Counter.increment}

It may change `self`.

#### `Counter.value` · [source](counters.md#source-L14) {#symbol-Counter.value}

It returns `int`.

### `Counters` · [source](counters.md#source-L21) {#symbol-Counters}

The complete counter composition; its mutable state belongs to each scope.

These providers are registered before startup. `State` is provided by [`_Initial`](counters.md#symbol-_Initial). The same instance is shared. `Counter` is provided by [`_Counter`](counters.md#symbol-_Counter). Each scope shares one instance. Shared mutation is allowed. It requires bindings for `State`.

### `_Initial` · class · [source](counters.md#source-L5) {#symbol-_Initial}

It implements [`State`](counters.md#symbol-State). It is private to this file.

#### `_Initial.read` · [source](counters.md#source-L6) {#symbol-_Initial.read}

::: spec-paragraph specification-paragraph-1
It returns `0`. [source](counters.md#source-L7)
:::

::: details Checked interface

```text
read() returns int
```

:::

### `_Updated` · class · [source](counters.md#source-L8) {#symbol-_Updated}

It implements [`State`](counters.md#symbol-State). It is private to this file. It takes `count` as an integer, kept read-only.

#### `_Updated.read` · [source](counters.md#source-L9) {#symbol-_Updated.read}

::: spec-paragraph specification-paragraph-2
It returns `count`. [source](counters.md#source-L10)
:::

::: details Checked interface

```text
read() returns int
```

:::

### `_Counter` · class · [source](counters.md#source-L15) {#symbol-_Counter}

It implements [`Counter`](counters.md#symbol-Counter). It is private to this file. The `_state` dependency is injected as [`State`](counters.md#symbol-State) and stored mutably and privately.

#### `_Counter.increment` · [source](counters.md#source-L16) {#symbol-_Counter.increment}

::: spec-paragraph specification-paragraph-3
It may change `self`. It sets `_state` to a [`_Updated`](counters.md#symbol-_Updated) with `count` from [`_state.read`](counters.md#symbol-State.read) plus `1`. [source](counters.md#source-L17)
:::

::: details Checked interface

```text
increment() returns void changes self
```

It may change `self`.

:::

#### `_Counter.value` · [source](counters.md#source-L18) {#symbol-_Counter.value}

::: spec-paragraph specification-paragraph-4
It returns [`_state.read`](counters.md#symbol-State.read). [source](counters.md#source-L19)
:::

::: details Checked interface

```text
value() returns int
```

:::

::::

:::::
