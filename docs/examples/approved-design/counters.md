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

```aug [Indentation]
// aug-spec: "counters.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Reading state has no mutation effect. */
interface State:
    read() returns int
_Initial() implements State:
    read() returns int:
        return 0
_Updated(int count) implements State:
    read() returns int:
        return count
/** A mutable counter with an explicit transition contract. */
interface Counter:
    increment() changes self
    value() returns int
_Counter(resolve mutable State initial to _state) implements Counter:
    increment() changes self:
        _state to _Updated(count=_state.read() + 1)
    value() returns int:
        return _state.read()
/** The complete counter composition; its mutable state belongs to each scope. */
composition Counters:
    implement State with _Initial
    implement Counter with _Counter scoped mutable
```

```aug [Braces]
// aug-spec: "counters.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Reading state has no mutation effect. */
interface State {
    read() returns int
}
_Initial() implements State {
    read() returns int {
        return 0
    }
}
_Updated(int count) implements State {
    read() returns int {
        return count
    }
}
/** A mutable counter with an explicit transition contract. */
interface Counter {
    increment() changes self
    value() returns int
}
_Counter(resolve mutable State initial to _state) implements Counter {
    increment() changes self {
        _state to _Updated(count=_state.read() + 1)
    }
    value() returns int {
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

### `State` · interface · [source](counters.md#code) {#symbol-State}

Reading state has no mutation effect.

#### `State.read` · [source](counters.md#code) {#symbol-State.read}

It returns `int`.

### `Counter` · interface · [source](counters.md#code) {#symbol-Counter}

A mutable counter with an explicit transition contract.

#### `Counter.increment` · [source](counters.md#code) {#symbol-Counter.increment}

It may change `self`.

#### `Counter.value` · [source](counters.md#code) {#symbol-Counter.value}

It returns `int`.

### `Counters` · [source](counters.md#code) {#symbol-Counters}

The complete counter composition; its mutable state belongs to each scope.

These providers are registered before startup. `State` is provided by [`_Initial`](counters.md#symbol-_Initial). The same instance is shared. `Counter` is provided by [`_Counter`](counters.md#symbol-_Counter). Each scope shares one instance. Shared mutation is allowed. It requires bindings for `State`.

### `_Initial` · class · [source](counters.md#code) {#symbol-_Initial}

It implements [`State`](counters.md#symbol-State). It is private to this file.

#### `_Initial.read` · [source](counters.md#code) {#symbol-_Initial.read}

It returns `0`.

### `_Updated` · class · [source](counters.md#code) {#symbol-_Updated}

It implements [`State`](counters.md#symbol-State). It is private to this file. It takes `count` as an integer, kept read-only.

#### `_Updated.read` · [source](counters.md#code) {#symbol-_Updated.read}

It returns `count`.

### `_Counter` · class · [source](counters.md#code) {#symbol-_Counter}

It implements [`Counter`](counters.md#symbol-Counter). It is private to this file. The `_state` dependency is injected as [`State`](counters.md#symbol-State) and stored mutably and privately.

#### `_Counter.increment` · [source](counters.md#code) {#symbol-_Counter.increment}

It may change `self`. It sets `_state` to a [`_Updated`](counters.md#symbol-_Updated) with `count` from [`_state.read`](counters.md#symbol-State.read) plus `1`.

#### `_Counter.value` · [source](counters.md#code) {#symbol-_Counter.value}

It returns [`_state.read`](counters.md#symbol-State.read).

::::

:::::
