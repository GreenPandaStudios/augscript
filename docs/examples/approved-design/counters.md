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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYWU3YzZmNmU4Y2I5ODA1MDVhMzhmMGQxZTU3YmE1ZjhhOWQxNGEyZjEyNGM2MDQwNzM1Mzc4Y2IxM2EyODczMSIsImZvcm1hdHRlZFNoYTI1NiI6ImI1YzY4N2ExM2ZhYjIzZTRiZjNlODVmNDY4MDAxZWEzNTFmM2ZjMDQzMTIyZjkwMzJhODU4ODg3NTE4ZDgxMTUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtU3RhdGUiXX0seyJpZCI6InNvdXJjZS1MNCIsImZpcnN0Ijo0LCJsYXN0Ijo0LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1TdGF0ZS5yZWFkIl19LHsiaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjEyLCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQ291bnRlciJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0IjoxMywibGFzdCI6MTMsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUNvdW50ZXIuaW5jcmVtZW50Il19LHsiaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjE0LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQ291bnRlci52YWx1ZSJdfSx7ImlkIjoic291cmNlLUwyMSIsImZpcnN0IjoyMSwibGFzdCI6MjMsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUNvdW50ZXJzIl19LHsiaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtX0luaXRpYWwiXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo2LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1fSW5pdGlhbC5yZWFkIl19LHsiaWQiOiJzb3VyY2UtTDciLCJmaXJzdCI6NywibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLV9VcGRhdGVkIl19LHsiaWQiOiJzb3VyY2UtTDkiLCJmaXJzdCI6OSwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLV9VcGRhdGVkLnJlYWQiXX0seyJpZCI6InNvdXJjZS1MMTAiLCJmaXJzdCI6MTAsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTUiLCJmaXJzdCI6MTUsImxhc3QiOjE5LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1fQ291bnRlciJdfSx7ImlkIjoic291cmNlLUwxNiIsImZpcnN0IjoxNiwibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIjc3ltYm9sLV9Db3VudGVyLmluY3JlbWVudCJdfSx7ImlkIjoic291cmNlLUwxNyIsImZpcnN0IjoxNywibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUwxOCIsImZpcnN0IjoxOCwibGFzdCI6MTksImJhY2tsaW5rcyI6WyIjc3ltYm9sLV9Db3VudGVyLnZhbHVlIl19LHsiaWQiOiJzb3VyY2UtTDE5IiwiZmlyc3QiOjE5LCJsYXN0IjoxOSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19XX0
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYWU3YzZmNmU4Y2I5ODA1MDVhMzhmMGQxZTU3YmE1ZjhhOWQxNGEyZjEyNGM2MDQwNzM1Mzc4Y2IxM2EyODczMSIsImZvcm1hdHRlZFNoYTI1NiI6ImNiOTYwN2Q3MjZhNWFlOThkZjU1YWY2ZjgyZjFjNWM2Y2JhOTdiMzc1N2JiOTI1OGUyODU0NzZkZmFjMDhiOGEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtU3RhdGUiXX0seyJpZCI6InNvdXJjZS1MNCIsImZpcnN0Ijo0LCJsYXN0Ijo0LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1TdGF0ZS5yZWFkIl19LHsiaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjE3LCJsYXN0IjoyMCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQ291bnRlciJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0IjoxOCwibGFzdCI6MTgsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUNvdW50ZXIuaW5jcmVtZW50Il19LHsiaWQiOiJzb3VyY2UtTDE0IiwiZmlyc3QiOjE5LCJsYXN0IjoxOSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQ291bnRlci52YWx1ZSJdfSx7ImlkIjoic291cmNlLUwyMSIsImZpcnN0IjozMCwibGFzdCI6MzMsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUNvdW50ZXJzIl19LHsiaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NiwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLV9Jbml0aWFsIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NywibGFzdCI6OSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtX0luaXRpYWwucmVhZCJdfSx7ImlkIjoic291cmNlLUw3IiwiZmlyc3QiOjgsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw4IiwiZmlyc3QiOjExLCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtX1VwZGF0ZWQiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0IjoxMiwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyIjc3ltYm9sLV9VcGRhdGVkLnJlYWQiXX0seyJpZCI6InNvdXJjZS1MMTAiLCJmaXJzdCI6MTMsImxhc3QiOjEzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTUiLCJmaXJzdCI6MjEsImxhc3QiOjI4LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1fQ291bnRlciJdfSx7ImlkIjoic291cmNlLUwxNiIsImZpcnN0IjoyMiwibGFzdCI6MjQsImJhY2tsaW5rcyI6WyIjc3ltYm9sLV9Db3VudGVyLmluY3JlbWVudCJdfSx7ImlkIjoic291cmNlLUwxNyIsImZpcnN0IjoyMywibGFzdCI6MjMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUwxOCIsImZpcnN0IjoyNSwibGFzdCI6MjcsImJhY2tsaW5rcyI6WyIjc3ltYm9sLV9Db3VudGVyLnZhbHVlIl19LHsiaWQiOiJzb3VyY2UtTDE5IiwiZmlyc3QiOjI2LCJsYXN0IjoyNiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19XX0
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
It sets `_state` to a [`_Updated`](counters.md#symbol-_Updated) with `count` from [`_state.read`](counters.md#symbol-State.read) plus `1`. [source](counters.md#source-L17)
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
