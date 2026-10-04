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
    _label():
        return _prefix()
    label():
        return self._label()
_prefix():
    return "count"
```

```aug [Braces]
// aug-spec: "counter.aug.md" explains this file. Read it before changes; refresh with aug spec.
interface ICounter {
    label() returns string
}
Counter(mutable int value) implements ICounter {
    _label() {
        return _prefix()
    }
    label() {
        return self._label()
    }
}
_prefix() {
    return "count"
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `ICounter` · interface · [source](counter.md#code) {#symbol-ICounter}

#### `ICounter.label` · [source](counter.md#code) {#symbol-ICounter.label}

It returns `string`.

### `Counter` · class · [source](counter.md#code) {#symbol-Counter}

It implements [`ICounter`](counter.md#symbol-ICounter). It takes `value` as an integer, kept mutable.

#### `Counter._label` · [source](counter.md#code) {#symbol-Counter._label}

It is private to its defining scope. It returns [`_prefix`](counter.md#symbol-_prefix). [source](counter.md#code)

::: details Checked interface

```text
_label() returns string
```

:::

#### `Counter.label` · [source](counter.md#code) {#symbol-Counter.label}

It returns [`self._label`](counter.md#symbol-Counter._label). [source](counter.md#code)

::: details Checked interface

```text
label() returns string
```

:::

### `_prefix` · [source](counter.md#code) {#symbol-_prefix}

It is private to its defining scope. It returns `"count"`. [source](counter.md#code)

::: details Checked interface

```text
_prefix() returns string
```

:::

::::

:::::
