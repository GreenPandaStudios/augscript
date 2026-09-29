---
title: "math.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/math.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `math.aug`

[Labeled calls and injection](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`console.aug`](console.md)
- [`greeter.aug`](greeter.md)
- [`logger.aug`](logger.md)
- [`math.aug`](math.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
increment(int value) returns int:
    return value + 1
```

```aug [Braces]
increment(int value) returns int {
    return value + 1
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`increment`](math.md#symbol-increment) is a function returning `int`.

### `increment` {#symbol-increment}

[source](math.md#code)

**Inputs**

- `value` (`int`) — required labeled input.

Returns: `int`.

**What it does**

- Return `value` plus `1`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
