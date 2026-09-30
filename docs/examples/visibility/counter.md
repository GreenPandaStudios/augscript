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
// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

<a id="symbol-ICounter"></a>
### `ICounter` · interface · [source](counter.md#code)

<a id="symbol-ICounter.label"></a>
#### `ICounter.label` · [source](counter.md#code)

It returns `string`.

<a id="symbol-Counter"></a>
### `Counter` · class · [source](counter.md#code)

It implements [`ICounter`](counter.md#symbol-ICounter). It takes `value` as an integer, kept mutable.

<a id="symbol-Counter._label"></a>
#### `Counter._label` · [source](counter.md#code)

It is private to its defining scope. It returns [`_prefix`](counter.md#symbol-_prefix).

<a id="symbol-Counter.label"></a>
#### `Counter.label` · [source](counter.md#code)

It returns [`self._label`](counter.md#symbol-Counter._label).

<a id="symbol-_prefix"></a>
### `_prefix` · [source](counter.md#code)

It is private to its defining scope. It returns `"count"`.

::::

:::::
