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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Reply`](routes.md#symbol-Reply) is an immutable record.
- [`reply`](routes.md#symbol-reply) handles `GET` `/bench` returning `Reply`.

### `Reply` {#symbol-Reply}

[source](routes.md#code)

Immutable record.

**Inputs**

- `id` (`int`) — required labeled input — stored as `id` and read-only after initialization.
- `message` (`string`) — required labeled input — stored as `message` and read-only after initialization.

### `reply` {#symbol-reply}

[source](routes.md#code)

Returns: [`Reply`](routes.md#symbol-Reply).

HTTP route: `GET` `/bench`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

**What it does**

- Return call [`Reply`](routes.md#symbol-Reply) with `id` = `7`; `message` = `"hello"`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
