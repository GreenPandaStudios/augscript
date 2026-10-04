---
title: "errors.aug · Checked failures"
generated: true
source: "examples/errors/errors.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `errors.aug`

[Checked failures](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`errors.aug`](errors.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYzIzNDNlMjEzODA1YjMwMTZmZDg5ZTE4MDM3YzcyNTlhOTRlYmI5ZGUzOTk2Y2RkZmMyMzNlOTg3YjRiZmVjZCIsImZvcm1hdHRlZFNoYTI1NiI6ImRjNzJmZTU5M2VlMDQ4MWUwMWJiYWQwOGU2NDUxODhjY2RjYzg1OWVmYjdkNzFhMmVmMzY3MGEzOWJmODcyNmYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtbG9hZCJdfSx7ImlkIjoic291cmNlLUwzLUw2IiwiZmlyc3QiOjMsImxhc3QiOjUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "errors.aug.md" explains this file. Read it before changes; refresh with aug spec.
load(bool fail):
    if fail:
        throw FileError()
    return "loaded"
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYzIzNDNlMjEzODA1YjMwMTZmZDg5ZTE4MDM3YzcyNTlhOTRlYmI5ZGUzOTk2Y2RkZmMyMzNlOTg3YjRiZmVjZCIsImZvcm1hdHRlZFNoYTI1NiI6ImNkYTY1NmVmM2M3ODA5Yjg5ZjM1OGRmOWIxMjE4ZmFlYjM3NDkwYzUyNzVjODRmODhiMWFlNTA5NTdkNzk5NzciLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtbG9hZCJdfSx7ImlkIjoic291cmNlLUwzLUw2IiwiZmlyc3QiOjMsImxhc3QiOjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "errors.aug.md" explains this file. Read it before changes; refresh with aug spec.
load(bool fail) {
    if fail {
        throw FileError()
    }
    return "loaded"
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `load` · [source](errors.md#source-L2) {#symbol-load}

::: spec-paragraph specification-paragraph-1
It takes `fail` as a boolean. It checks that `fail` is false. It raises a `FileError` at the first failed check. It returns `"loaded"`. [source](errors.md#source-L3-L6)
:::

::: details Checked interface

```text
load(bool fail) returns string unless FileError
```

It takes `fail` as a boolean. Failures can raise `FileError`.

:::

::::

:::::
