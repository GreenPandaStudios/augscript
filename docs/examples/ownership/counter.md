---
title: "counter.aug · Read access and mutable borrows"
generated: true
source: "examples/ownership/counter.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `counter.aug`

[Read access and mutable borrows](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`counter.aug`](counter.md)

:::

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `Counter` {#symbol-Counter}

[source](counter.md#code)

Behavioral class.

Satisfies [`ICounter`](counter.md#symbol-ICounter).

**Inputs and dependencies**

- `value`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `value`. The field can change with mutable access.

#### `Counter.increment` {#symbol-Counter.increment}

[source](counter.md#code)

Result: finish without a result.

Changes: `self`.

**Behavior when execution reaches this operation**

- Grant exclusive mutable access to `self` for this block, then end the borrow:
  - Set `value` to (`value` plus `1`).

#### `Counter.read` {#symbol-Counter.read}

[source](counter.md#code)

Result: `int`.

**Behavior when execution reaches this operation**

- Return `value` and finish this operation.

### `ICounter` {#symbol-ICounter}

[source](counter.md#code)

Interface.

#### `ICounter.increment` {#symbol-ICounter.increment}

[source](counter.md#code)

Result: finish without a result.

Changes: `self`.

Interface contract. A selected implementation supplies the behavior.

#### `ICounter.read` {#symbol-ICounter.read}

[source](counter.md#code)

Result: `int`.

Interface contract. A selected implementation supplies the behavior.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
