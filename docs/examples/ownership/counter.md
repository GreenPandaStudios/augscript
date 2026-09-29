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

<a id="symbol-Counter"></a>
### `Counter` · class · [source](counter.md#code)

Implements [`ICounter`](counter.md#symbol-ICounter).

**Inputs:** Take `value` (`int`); store mutably.

<a id="symbol-Counter.increment"></a>
#### `Counter.increment` · [source](counter.md#code)

Changes `self`.

- Mutably borrow `self` for this block:
  - Set `value` to `value` plus `1`.

<a id="symbol-Counter.read"></a>
#### `Counter.read` · [source](counter.md#code)

Returns `int`.

- Return `value`.

<a id="symbol-ICounter"></a>
### `ICounter` · interface · [source](counter.md#code)

<a id="symbol-ICounter.increment"></a>
#### `ICounter.increment` · [source](counter.md#code)

Changes `self`.

<a id="symbol-ICounter.read"></a>
#### `ICounter.read` · [source](counter.md#code)

Returns `int`.

::::

:::::
