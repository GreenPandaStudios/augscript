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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import reply from routes
serve reply on port 0
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

It serves [`reply`](routes.md#symbol-reply) on port `0`.

### Dependencies

It uses [`reply`](routes.md#symbol-reply) from `routes`. These links explain the full dependency contracts.

::::

:::::
