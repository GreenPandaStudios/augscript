---
title: "counter.aug · Private state and helpers"
generated: true
source: "examples/visibility/counter.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `counter.aug`

[Private state and helpers](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`counter.aug`](counter.md)

:::

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`ICounter`](counter.md#symbol-ICounter) is an interface.
- [`Counter`](counter.md#symbol-Counter) is a class implementing `ICounter`.
- [`_prefix`](counter.md#symbol-_prefix) is a function returning `string`.

### `ICounter` {#symbol-ICounter}

[source](counter.md#code)

Interface.

#### `ICounter.label` {#symbol-ICounter.label}

[source](counter.md#code)

Returns: `string`.

Interface contract. A selected implementation supplies the behavior.

### `Counter` {#symbol-Counter}

[source](counter.md#code)

Behavioral class.

Satisfies [`ICounter`](counter.md#symbol-ICounter).

**Inputs**

- `value` (`int`) — required labeled input — stored as `value` and mutable.

#### `Counter._label` {#symbol-Counter._label}

[source](counter.md#code)

Private to its defining scope.

Returns: `string`.

**What it does**

- Return call [`_prefix`](counter.md#symbol-_prefix).

#### `Counter.label` {#symbol-Counter.label}

[source](counter.md#code)

Returns: `string`.

**What it does**

- Return call [`Counter._label`](counter.md#symbol-Counter._label) on `self`.

### `_prefix` {#symbol-_prefix}

[source](counter.md#code)

Private to its defining scope.

Returns: `string`.

**What it does**

- Return `"count"`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
