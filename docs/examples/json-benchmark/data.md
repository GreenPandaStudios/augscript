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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Payload`](data.md#symbol-Payload) is an immutable record.

### `Payload` {#symbol-Payload}

[source](data.md#code)

Immutable record.

**Inputs**

- `id` (`int`) — required labeled input — stored as `id` and read-only after initialization.
- `message` (`string`) — required labeled input — stored as `message` and read-only after initialization.
- `values` (`List<int>`) — required labeled input — stored as `values` and read-only after initialization.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
