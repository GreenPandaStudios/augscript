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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Fruit`](models.md#symbol-Fruit) is an immutable record.

### `Fruit` {#symbol-Fruit}

[source](models.md#code)

Immutable record.

**Author documentation**

Immutable fruit data, with public construction labels and structural equality.

**Inputs**

- `code` (`int`) — required labeled input — stored as `code` and read-only after initialization.
- `name` (`string`) — required labeled input — stored as `name` and read-only after initialization.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
