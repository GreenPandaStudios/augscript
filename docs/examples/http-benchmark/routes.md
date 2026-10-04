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
endpoint GET "/bench" as reply():
    return Reply(id=7, message="hello")
```

```aug [Braces]
// aug-spec: "routes.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Reply(int id, string message)
endpoint GET "/bench" as reply() {
    return Reply(id=7, message="hello")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

Plain handler results default to HTTP 200 unless another status is declared. HttpResponse values choose their own status. Unhandled request failures return HTTP 500 and cancel the request tasks.

### `Reply` · immutable record · [source](routes.md#code) {#symbol-Reply}

It takes `id` as an integer, kept read-only and `message` as a string, kept read-only.

### `reply` · [source](routes.md#code) {#symbol-reply}

`reply` handles `GET /bench`. It returns a [`Reply`](routes.md#symbol-Reply) with `id` `7` and `message` `"hello"`. [source](routes.md#code)

::: details Checked interface

```text
reply() returns Reply
```

:::

::::

:::::
