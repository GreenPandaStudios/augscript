---
title: "operations.aug · Task scheduling benchmark"
generated: true
source: "benchmarks/tasks/operations.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `operations.aug`

[Task scheduling benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`operations.aug`](operations.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZDdlY2ExZWQyY2ZhNDlmYjA4NjBjY2Q3NzRiMzg1MGMwZWNiM2JiMzUzMmM2YjM3NjAwZTI1ZWVhYzY4OWY1ZiIsImZvcm1hdHRlZFNoYTI1NiI6IjZlYjk3ZDQ1NTUxZmQxMTc5NDMyYmRlZjkwYmRhYzk4Yzk2ZmZlZGZjOTM1ZjA5ZDIzYzRkNGM1NjAyYzI4MTQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MywiYmFja2xpbmtzIjpbIm9wZXJhdGlvbnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtY29tcHV0ZSJdfSx7ImlkIjoic291cmNlLUwzIiwiZmlyc3QiOjMsImxhc3QiOjMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
compute(int value) returns int:
    return value * 3 + 1
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZDdlY2ExZWQyY2ZhNDlmYjA4NjBjY2Q3NzRiMzg1MGMwZWNiM2JiMzUzMmM2YjM3NjAwZTI1ZWVhYzY4OWY1ZiIsImZvcm1hdHRlZFNoYTI1NiI6IjdhODg0ZWFlNDEyZDdiNzhiYmNhZTEwOTkyNTllZGZhZGNhMjgxNjUyZTAxMTU3YzllY2JlYzcxZTk0NmExZDMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NCwiYmFja2xpbmtzIjpbIm9wZXJhdGlvbnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtY29tcHV0ZSJdfSx7ImlkIjoic291cmNlLUwzIiwiZmlyc3QiOjMsImxhc3QiOjMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
compute(int value) returns int {
    return value * 3 + 1
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](operations-diagrams.md)

### `compute` · [source](operations.md#source-L2) {#symbol-compute}

::: spec-paragraph specification-paragraph-1
It takes `value` as an integer. It returns (`value` times `3`) plus `1`. [source](operations.md#source-L3)
:::

::: details Checked interface

```text
compute(int value) returns int
```

It takes `value` as an integer.

:::

::::

:::::
