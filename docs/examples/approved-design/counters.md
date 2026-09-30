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

<a id="symbol-State"></a>
### `State` · interface · [source](counters.md#code)

Reading state has no mutation effect.

<a id="symbol-State.read"></a>
#### `State.read` · [source](counters.md#code)

It returns `int`.

<a id="symbol-Counter"></a>
### `Counter` · interface · [source](counters.md#code)

A mutable counter with an explicit transition contract.

<a id="symbol-Counter.increment"></a>
#### `Counter.increment` · [source](counters.md#code)

It may change `self`.

<a id="symbol-Counter.value"></a>
#### `Counter.value` · [source](counters.md#code)

It returns `int`.

<a id="symbol-Counters"></a>
### `Counters` · [source](counters.md#code)

The complete counter composition; its mutable state belongs to each scope.

These providers are registered before startup. `State` is provided by [`_Initial`](counters.md#symbol-_Initial). The same instance is shared. `Counter` is provided by [`_Counter`](counters.md#symbol-_Counter). Each scope shares one instance. Shared mutation is allowed. It requires bindings for `State`.

<a id="symbol-_Initial"></a>
### `_Initial` · class · [source](counters.md#code)

It implements [`State`](counters.md#symbol-State). It is private to this file.

<a id="symbol-_Initial.read"></a>
#### `_Initial.read` · [source](counters.md#code)

It returns `0`.

<a id="symbol-_Updated"></a>
### `_Updated` · class · [source](counters.md#code)

It implements [`State`](counters.md#symbol-State). It is private to this file. It takes `count` as an integer, kept read-only.

<a id="symbol-_Updated.read"></a>
#### `_Updated.read` · [source](counters.md#code)

It returns `count`.

<a id="symbol-_Counter"></a>
### `_Counter` · class · [source](counters.md#code)

It implements [`Counter`](counters.md#symbol-Counter). It is private to this file. The `_state` dependency is injected as [`State`](counters.md#symbol-State) and stored mutably and privately.

<a id="symbol-_Counter.increment"></a>
#### `_Counter.increment` · [source](counters.md#code)

It may change `self`. It sets `_state` to a [`_Updated`](counters.md#symbol-_Updated) with `count` from [`_state.read`](counters.md#symbol-State.read) plus `1`.

<a id="symbol-_Counter.value"></a>
#### `_Counter.value` · [source](counters.md#code)

It returns [`_state.read`](counters.md#symbol-State.read).

::::

:::::
