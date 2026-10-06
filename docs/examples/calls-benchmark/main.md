---
title: "main.aug · Function-call benchmark"
generated: true
source: "benchmarks/calls/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Function-call benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`operations.aug`](operations.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYTU4OGZlYjQ4NjU3MmJmNmYxOTgyNWIyMjA3ZmVjZDliNDk0MTdhOGFhMDI0ZWUyYzc5OGE4MWE5MjJhYjc4NSIsImZvcm1hdHRlZFNoYTI1NiI6ImI4OTY5NDgwOWMwOWU2OWU2NTdiZDQ1NjFlYmU0MWFmNzVkY2RmNWQ5YmNiOGYwNmY1NjE2ZmQ5ZjI2ZTBlYzMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwzLUw4IiwiZmlyc3QiOjMsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjksImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import step from operations
int iterations = 200000
int state = 123
int index = 0
while index < iterations:
    state = step(value=state)
    index = index + 1
print(value=state)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYTU4OGZlYjQ4NjU3MmJmNmYxOTgyNWIyMjA3ZmVjZDliNDk0MTdhOGFhMDI0ZWUyYzc5OGE4MWE5MjJhYjc4NSIsImZvcm1hdHRlZFNoYTI1NiI6IjQxZDM5YTc3MDA0ZDE5ZDIwZGFlZWI5YTI2MDdhMmE0ODk2OWQ5ZTgzMDI2MzUyZTg5YWUzMjIwYWI3OWVlZWYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwzLUw4IiwiZmlyc3QiOjMsImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjEwLCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import step from operations
int iterations = 200000
int state = 123
int index = 0
while index < iterations {
    state = step(value=state)
    index = index + 1
}
print(value=state)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `200000`. It sets `state` to `123`. It sets `index` to `0`. While `index` is less than `iterations`, it sets `state` to [`step`](operations.md#symbol-step) with `value` from `state`; then it increases `index` by `1`. [source](main.md#source-L3-L8)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it prints `state`. [source](main.md#source-L9)
:::

### Dependencies

It uses [`step`](operations.md#symbol-step) from `operations`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
