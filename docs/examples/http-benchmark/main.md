---
title: "main.aug · HTTP benchmark"
generated: true
source: "benchmarks/http/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[HTTP benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`routes.aug`](routes.md)

:::

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Serve 1 HTTP route.

### HTTP configuration

Listen on `127.0.0.1`. Limit request bodies to 1048576 bytes and buffered responses to 4194304 bytes.

### Startup, in source order

- Serve [`reply`](routes.md#symbol-reply) on port `0`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`reply`](routes.md#symbol-reply)

Function from `routes`.

- [`reply`](routes.md#symbol-reply) (no caller inputs) → [`Reply`](routes.md#symbol-Reply).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
