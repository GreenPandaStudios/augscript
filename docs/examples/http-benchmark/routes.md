---
title: "routes.aug · HTTP benchmark"
generated: true
source: "benchmarks/http/routes.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `routes.aug`

[HTTP benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`routes.aug`](routes.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
record Reply(int id, string message)
endpoint GET "/bench" as reply() returns Reply:
    return Reply(id=7, message="hello")
```

```aug [Braces]
record Reply(int id, string message)
endpoint GET "/bench" as reply() returns Reply {
    return Reply(id=7, message="hello")
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `Reply` {#symbol-Reply}

[source](routes.md#code)

Immutable record.

**Inputs and dependencies**

- `id`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `id`. The field is read-only after initialization.
- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `message`. The field is read-only after initialization.

### `reply` {#symbol-reply}

[source](routes.md#code)

Result: [`Reply`](routes.md#symbol-Reply).

HTTP route: `GET` `/bench`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

**Behavior when execution reaches this operation**

- Return the result of call [`Reply`](routes.md#symbol-Reply) with `id` set to `7`; `message` set to `"hello"` and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
