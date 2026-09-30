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
// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

It implements [`ICounter`](counter.md#symbol-ICounter). It takes `value` as an integer, kept mutable.

<a id="symbol-Counter.increment"></a>
#### `Counter.increment` · [source](counter.md#code)

It may change `self`. With temporary permission to change `self`, it increases `value` by `1`.

<a id="symbol-Counter.read"></a>
#### `Counter.read` · [source](counter.md#code)

It returns `value`.

<a id="symbol-ICounter"></a>
### `ICounter` · interface · [source](counter.md#code)

<a id="symbol-ICounter.increment"></a>
#### `ICounter.increment` · [source](counter.md#code)

It may change `self`.

<a id="symbol-ICounter.read"></a>
#### `ICounter.read` · [source](counter.md#code)

It returns `int`.

::::

:::::
