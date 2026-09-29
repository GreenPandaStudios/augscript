---
title: "counters.aug · Modules and composition"
generated: true
source: "examples/approved-design/counters.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`State`](counters.md#symbol-State) is an interface.
- [`_Initial`](counters.md#symbol-_Initial) is a class implementing `State`.
- [`_Updated`](counters.md#symbol-_Updated) is a class implementing `State`.
- [`Counter`](counters.md#symbol-Counter) is an interface.
- [`_Counter`](counters.md#symbol-_Counter) is a class implementing `Counter`.
- [`Counters`](counters.md#symbol-Counters) declares 2 providers.

### `State` {#symbol-State}

[source](counters.md#code)

Interface.

**Author documentation**

Reading state has no mutation effect.

#### `State.read` {#symbol-State.read}

[source](counters.md#code)

Returns: `int`.

Interface contract. A selected implementation supplies the behavior.

### `Counter` {#symbol-Counter}

[source](counters.md#code)

Interface.

**Author documentation**

A mutable counter with an explicit transition contract.

#### `Counter.increment` {#symbol-Counter.increment}

[source](counters.md#code)

Returns: no value.

May change: `self`.

Interface contract. A selected implementation supplies the behavior.

#### `Counter.value` {#symbol-Counter.value}

[source](counters.md#code)

Returns: `int`.

Interface contract. A selected implementation supplies the behavior.

### `Counters` {#symbol-Counters}

[source](counters.md#code)

**Author documentation**

The complete counter composition; its mutable state belongs to each scope.

This composition declares these providers before startup:

- Provide [`_Initial`](counters.md#symbol-_Initial) when `State` is requested. Reuse one instance.
- Provide [`_Counter`](counters.md#symbol-_Counter) when `Counter` is requested. Reuse one instance per explicit scope. Permit explicit shared mutation. Required dependencies: `State`.

### `_Initial` {#symbol-_Initial}

[source](counters.md#code)

Behavioral class, private to this file.

Satisfies [`State`](counters.md#symbol-State).

#### `_Initial.read` {#symbol-_Initial.read}

[source](counters.md#code)

Returns: `int`.

**What it does**

- Return `0`.

### `_Updated` {#symbol-_Updated}

[source](counters.md#code)

Behavioral class, private to this file.

Satisfies [`State`](counters.md#symbol-State).

**Inputs**

- `count` (`int`) — required labeled input — stored as `count` and read-only after initialization.

#### `_Updated.read` {#symbol-_Updated.read}

[source](counters.md#code)

Returns: `int`.

**What it does**

- Return `count`.

### `_Counter` {#symbol-_Counter}

[source](counters.md#code)

Behavioral class, private to this file.

Satisfies [`Counter`](counters.md#symbol-Counter).

**Inputs**

- `initial` ([`State`](counters.md#symbol-State)) — injected; callers omit it — stored as `_state` (private) and mutable.

#### `_Counter.increment` {#symbol-_Counter.increment}

[source](counters.md#code)

Returns: no value.

May change: `self`.

**What it does**

- Set `_state` to call [`_Updated`](counters.md#symbol-_Updated) with `count` = (call [`State.read`](counters.md#symbol-State.read) on `_state` plus `1`).

#### `_Counter.value` {#symbol-_Counter.value}

[source](counters.md#code)

Returns: `int`.

**What it does**

- Return call [`State.read`](counters.md#symbol-State.read) on `_state`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
