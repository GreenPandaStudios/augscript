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

Returns `int`.

<a id="symbol-Counter"></a>
### `Counter` · interface · [source](counters.md#code)

A mutable counter with an explicit transition contract.

<a id="symbol-Counter.increment"></a>
#### `Counter.increment` · [source](counters.md#code)

Changes `self`.

<a id="symbol-Counter.value"></a>
#### `Counter.value` · [source](counters.md#code)

Returns `int`.

<a id="symbol-Counters"></a>
### `Counters` · [source](counters.md#code)

The complete counter composition; its mutable state belongs to each scope.

Provides these dependencies before startup:

- Provide [`_Initial`](counters.md#symbol-_Initial) for `State`. Share one instance.
- Provide [`_Counter`](counters.md#symbol-_Counter) for `Counter`. Share one instance per scope. Allow shared mutation. Needs `State`.

<a id="symbol-_Initial"></a>
### `_Initial` · class · [source](counters.md#code)

Implements [`State`](counters.md#symbol-State). Private to this file.

<a id="symbol-_Initial.read"></a>
#### `_Initial.read` · [source](counters.md#code)

Returns `int`.

- Return `0`.

<a id="symbol-_Updated"></a>
### `_Updated` · class · [source](counters.md#code)

Implements [`State`](counters.md#symbol-State). Private to this file.

**Inputs:** Take `count` (`int`); store read-only.

<a id="symbol-_Updated.read"></a>
#### `_Updated.read` · [source](counters.md#code)

Returns `int`.

- Return `count`.

<a id="symbol-_Counter"></a>
### `_Counter` · class · [source](counters.md#code)

Implements [`Counter`](counters.md#symbol-Counter). Private to this file.

**Inputs:** Resolve [`State`](counters.md#symbol-State) as `initial`; store mutably and privately as `_state`.

<a id="symbol-_Counter.increment"></a>
#### `_Counter.increment` · [source](counters.md#code)

Changes `self`.

- Set `_state` to a new [`_Updated`](counters.md#symbol-_Updated) with `count` as the result of [`State.read`](counters.md#symbol-State.read) on `_state` plus `1`.

<a id="symbol-_Counter.value"></a>
#### `_Counter.value` · [source](counters.md#code)

Returns `int`.

- Return the result of [`State.read`](counters.md#symbol-State.read) on `_state`.

::::

:::::
