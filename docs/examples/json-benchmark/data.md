---
title: "data.aug · JSON benchmark"
generated: true
source: "benchmarks/json/data.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `data.aug`

[JSON benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`data.aug`](data.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
record Payload(int id, string message, List<int> values)
```

```aug [Braces]
record Payload(int id, string message, List<int> values)
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `Payload` {#symbol-Payload}

[source](data.md#code)

Immutable record.

**Inputs and dependencies**

- `id`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `id`. The field is read-only after initialization.
- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `message`. The field is read-only after initialization.
- `values`: `List<int>`. The caller supplies this labeled input. Read reference values without copying them. Store it as `values`. The field is read-only after initialization.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
