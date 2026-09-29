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

```aug [Indentation]
Counter(mutable int value) implements ICounter:
    increment() changes self:
        borrow self:
            value = value + 1
    read() returns int:
        return value
interface ICounter:
    increment() changes self
    read() returns int
```

```aug [Braces]
Counter(mutable int value) implements ICounter {
    increment() changes self {
        borrow self {
            value = value + 1
        }
    }
    read() returns int {
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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Counter`](counter.md#symbol-Counter) is a class implementing `ICounter`.
- [`ICounter`](counter.md#symbol-ICounter) is an interface.

### `Counter` {#symbol-Counter}

[source](counter.md#code)

Behavioral class.

Satisfies [`ICounter`](counter.md#symbol-ICounter).

**Inputs**

- `value` (`int`) — required labeled input — stored as `value` and mutable.

#### `Counter.increment` {#symbol-Counter.increment}

[source](counter.md#code)

Returns: no value.

May change: `self`.

**What it does**

- Grant exclusive mutable access to `self` for this block, then end the borrow:
  - Set `value` to `value` plus `1`.

#### `Counter.read` {#symbol-Counter.read}

[source](counter.md#code)

Returns: `int`.

**What it does**

- Return `value`.

### `ICounter` {#symbol-ICounter}

[source](counter.md#code)

Interface.

#### `ICounter.increment` {#symbol-ICounter.increment}

[source](counter.md#code)

Returns: no value.

May change: `self`.

Interface contract. A selected implementation supplies the behavior.

#### `ICounter.read` {#symbol-ICounter.read}

[source](counter.md#code)

Returns: `int`.

Interface contract. A selected implementation supplies the behavior.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
