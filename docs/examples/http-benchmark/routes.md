---
title: "routes.aug · HTTP benchmark"
generated: true
source: "benchmarks/http/routes.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `routes.aug`

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
// aug-spec: "routes.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Reply(int id, string message)
endpoint GET "/bench" as reply() returns Reply:
    return Reply(id=7, message="hello")
```

```aug [Braces]
// aug-spec: "routes.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Reply(int id, string message)
endpoint GET "/bench" as reply() returns Reply {
    return Reply(id=7, message="hello")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Reply"></a>
### `Reply` · immutable record · [source](routes.md#code)

The caller supplies `id` as `int`, stored read-only and `message` as `string`, stored read-only.

<a id="symbol-reply"></a>
### `reply` · [source](routes.md#code)

The result is [`Reply`](routes.md#symbol-Reply). This handles `GET` requests at `/bench`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks. It returns a new [`Reply`](routes.md#symbol-Reply) (`id` set to `7` and `message` set to `"hello"`).

::::

:::::
