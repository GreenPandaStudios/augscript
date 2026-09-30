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

The result is `string`.

<a id="symbol-Counter"></a>
### `Counter` · class · [source](counter.md#code)

Implements [`ICounter`](counter.md#symbol-ICounter). The caller supplies `value` as `int`, stored mutably.

<a id="symbol-Counter._label"></a>
#### `Counter._label` · [source](counter.md#code)

Private to its defining scope. The result is `string`. It returns the value from [`_prefix`](counter.md#symbol-_prefix).

<a id="symbol-Counter.label"></a>
#### `Counter.label` · [source](counter.md#code)

The result is `string`. It returns the value from [`Counter._label`](counter.md#symbol-Counter._label) on `self`.

<a id="symbol-_prefix"></a>
### `_prefix` · [source](counter.md#code)

Private to its defining scope. The result is `string`. It returns `"count"`.

::::

:::::
