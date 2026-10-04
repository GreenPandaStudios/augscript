---
title: "main.aug · Task scheduling benchmark"
generated: true
source: "benchmarks/tasks/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Task scheduling benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`operations.aug`](operations.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNmIwODAxYjU1YWVhNmExNmI1NWVjMGI4YjYwNDVmZmYwZDUzOTg4ZjU0YWNkYzhjYWE2ZDgxZGFhNDU3MWUwZiIsImZvcm1hdHRlZFNoYTI1NiI6IjMxM2IwZmZlOTU4ZjI5ZjhlNjZmOGYxZTc0YWU1OWQ4ZWMwMGViMDQxY2ZlMTdiMTgzNTc5ODA2MDhhZTc0NDUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDEyIiwiZmlyc3QiOjMsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MNi1MMTIiLCJmaXJzdCI6NiwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0IjoxMywibGFzdCI6MTMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import compute from operations
int iterations = 2000
int index = 0
int checksum = 0
while index < iterations:
    scope:
        first = start compute(value=index)
        second = start compute(value=index + 1)
        (left, right) = wait for first and second
        checksum = checksum + left + right
    index = index + 1
print(value=checksum)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNmIwODAxYjU1YWVhNmExNmI1NWVjMGI4YjYwNDVmZmYwZDUzOTg4ZjU0YWNkYzhjYWE2ZDgxZGFhNDU3MWUwZiIsImZvcm1hdHRlZFNoYTI1NiI6ImExYzFlNjAxNzU3ZWRhNGMyNjJlMWJhMDdjOTc3Y2QxOWMyMTZlMWE4NGI0YzUzNzBjM2U3ZTkyMWMzNWVhOGQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDEyIiwiZmlyc3QiOjMsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MNi1MMTIiLCJmaXJzdCI6NiwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxMyIsImZpcnN0IjoxNSwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import compute from operations
int iterations = 2000
int index = 0
int checksum = 0
while index < iterations {
    scope {
        first = start compute(value=index)
        second = start compute(value=index + 1)
        (left, right) = wait for first and second
        checksum = checksum + left + right
    }
    index = index + 1
}
print(value=checksum)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `2000`. It sets `index` and `checksum` separately, each to `0`. While `index` is less than `iterations`, within a task and ownership scope, it sets `first` to a child task running [`compute`](operations.md#symbol-compute) with `value` from `index` with its inputs captured now. It sets `second` to a child task running [`compute`](operations.md#symbol-compute) with `value` from `index` plus `1` with its inputs captured now. [source](main.md#source-L3-L12)
:::

::: spec-paragraph specification-paragraph-2
It splits the result of waiting for `first` and `second` in input order; propagate failures into `left` and `right` in order. It sets `checksum` to (`checksum` plus `left`) plus `right`. On leaving this scope, join its child tasks and release its local values. It increases `index` by `1`. [source](main.md#source-L6-L12)
:::

::: spec-paragraph specification-paragraph-3
After the loop, it prints `checksum`. [source](main.md#source-L13)
:::

### Dependencies

It uses [`compute`](operations.md#symbol-compute) from `operations`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
