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

### HTTP configuration

Listen on `127.0.0.1`. Limit request bodies to 1048576 bytes and buffered responses to 4194304 bytes.

### Startup

- Serve [`reply`](routes.md#symbol-reply) on port `0`.

### Dependencies

- [`Reply`](routes.md#symbol-Reply).
- [`reply`](routes.md#symbol-reply) (no caller inputs) → [`Reply`](routes.md#symbol-Reply) from `routes`.

::::

:::::
