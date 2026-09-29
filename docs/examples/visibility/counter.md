---
title: "counter.aug · Private state and helpers"
generated: true
source: "examples/visibility/counter.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `counter.aug`

[Private state and helpers](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`counter.aug`](counter.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
interface ICounter:
    label() returns string
Counter(mutable int value) implements ICounter:
    _label() returns string:
        return _prefix()
    label() returns string:
        return self._label()
_prefix() returns string:
    return "count"
```

```aug [Braces]
interface ICounter {
    label() returns string
}
Counter(mutable int value) implements ICounter {
    _label() returns string {
        return _prefix()
    }
    label() returns string {
        return self._label()
    }
}
_prefix() returns string {
    return "count"
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `ICounter` {#symbol-ICounter}

[source](counter.md#code)

Interface.

#### `ICounter.label` {#symbol-ICounter.label}

[source](counter.md#code)

Result: `string`.

Interface contract. A selected implementation supplies the behavior.

### `Counter` {#symbol-Counter}

[source](counter.md#code)

Behavioral class.

Satisfies [`ICounter`](counter.md#symbol-ICounter).

**Inputs and dependencies**

- `value`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `value`. The field can change with mutable access.

#### `Counter._label` {#symbol-Counter._label}

[source](counter.md#code)

Private to its defining scope.

Result: `string`.

**Behavior when execution reaches this operation**

- Return the result of call [`_prefix`](counter.md#symbol-_prefix) and finish this operation.

#### `Counter.label` {#symbol-Counter.label}

[source](counter.md#code)

Result: `string`.

**Behavior when execution reaches this operation**

- Return the result of call [`Counter._label`](counter.md#symbol-Counter._label) on `self` and finish this operation.

### `_prefix` {#symbol-_prefix}

[source](counter.md#code)

Private to its defining scope.

Result: `string`.

**Behavior when execution reaches this operation**

- Return `"count"` and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
