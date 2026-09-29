---
title: "domain/models.aug · Modules and composition"
generated: true
source: "examples/approved-design/domain/models.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `domain/models.aug`

[Modules and composition](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`counters.aug`](../counters.md)
- [`domain/app.aug`](app.md)
- [`domain/export.aug`](export.md)
- [`domain/models.aug`](models.md)
- [`domain/numbers.aug`](numbers.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
/** Immutable fruit data, with public construction labels and structural equality. */
record Fruit(int code, string name)
```

```aug [Braces]
/** Immutable fruit data, with public construction labels and structural equality. */
record Fruit(int code, string name)
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `Fruit` {#symbol-Fruit}

[source](models.md#code)

Immutable record.

**Author documentation**

Immutable fruit data, with public construction labels and structural equality.

**Inputs and dependencies**

- `code`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `code`. The field is read-only after initialization.
- `name`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `name`. The field is read-only after initialization.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
