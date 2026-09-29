---
title: "main.aug · A native C boundary"
generated: true
source: "examples/ffi/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[A native C boundary](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`native.aug`](native.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import announce from native
announce()
```

```aug [Braces]
import announce from native
announce()
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Run 1 other startup step in source order.

### Startup, in source order

- Call [`announce`](native.md#symbol-announce).

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`announce`](native.md#symbol-announce)

Function from `native`.

- [`announce`](native.md#symbol-announce) (no caller inputs) → `void`; uses `C.puts`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
