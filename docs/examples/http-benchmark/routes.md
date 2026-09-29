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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Reply"></a>
### `Reply` · immutable record · [source](routes.md#code)

**Inputs:** Take `id` (`int`); store read-only. Take `message` (`string`); store read-only.

<a id="symbol-reply"></a>
### `reply` · [source](routes.md#code)

Returns [`Reply`](routes.md#symbol-Reply).

HTTP route: `GET` `/bench`. Use status 200 when the handler returns a body; a returned HttpResponse can set its own status. An unhandled request failure returns status 500 and cancels its request tasks.

- Return a new [`Reply`](routes.md#symbol-Reply) with `id` as `7`, `message` as `"hello"`.

::::

:::::
