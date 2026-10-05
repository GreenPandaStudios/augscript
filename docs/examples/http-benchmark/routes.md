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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMzQxYzMzM2EyODJmZGQ2YWNiNDVkNjBjODQ0MDM5NTU2MzkwNGFmZWIwMjc2YjNkZGQ0Mzc4OGNmZWY2ZGEzMiIsImZvcm1hdHRlZFNoYTI1NiI6ImM2OTQxMDBiNDUyODY3ZTliNDAzNDI3ZDkxODgxYWZkMDdkODY1MmY2NThiYmU0ODc4NGUyNzFjOTVlYThlNTMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtUmVwbHkiXX0seyJpZCI6InNvdXJjZS1MMyIsImZpcnN0IjozLCJsYXN0Ijo0LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1yZXBseSJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "routes.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Reply(int id, string message)
endpoint GET "/bench" as reply():
    return Reply(id=7, message="hello")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMzQxYzMzM2EyODJmZGQ2YWNiNDVkNjBjODQ0MDM5NTU2MzkwNGFmZWIwMjc2YjNkZGQ0Mzc4OGNmZWY2ZGEzMiIsImZvcm1hdHRlZFNoYTI1NiI6ImZlZDM5MmQ2MDkyYWJjYWZlOTQ4YzM4ZWVlYmZlMDBjZjQ2NTBiMmQwMDJhNzY2ZjU4NzU3YWQ0YzBhMDk2ZTkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtUmVwbHkiXX0seyJpZCI6InNvdXJjZS1MMyIsImZpcnN0IjozLCJsYXN0Ijo1LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1yZXBseSJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
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

### `Reply` · immutable record · [source](routes.md#source-L2) {#symbol-Reply}

It takes `id` as an integer, kept read-only and `message` as a string, kept read-only.

### `reply` · [source](routes.md#source-L3) {#symbol-reply}

::: spec-paragraph specification-paragraph-1
`reply` handles `GET /bench`. It returns a [`Reply`](routes.md#symbol-Reply) with `id` `7` and `message` `"hello"`. [source](routes.md#source-L4)
:::

::: details Checked interface

```text
reply() returns Reply
```

:::

::::

:::::
