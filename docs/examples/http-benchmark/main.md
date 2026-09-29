---
title: "main.aug · HTTP benchmark"
generated: true
source: "benchmarks/http/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[HTTP benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`routes.aug`](routes.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import reply from routes
serve reply on port 0
```

```aug [Braces]
import reply from routes
serve reply on port 0
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`reply`](routes.md#symbol-reply)

Available from `routes`.

Result: [`Reply`](routes.md#symbol-Reply).

HTTP route: `GET` `/bench`. Return status 200 on success. An unhandled request failure returns status 500 and cancels its request tasks.

### HTTP configuration

Listen on `127.0.0.1`. Limit request bodies to 1048576 bytes and buffered responses to 4194304 bytes.

### Startup, in source order

- Serve [`reply`](routes.md#symbol-reply) on port `0`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
