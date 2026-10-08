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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNjY1YTA0NDE0OTg0NTRlMWRkNzg4MjM3NjYzNDg2ZGM2NTQyMzM4YjhjZTgwNjlkYjFlNWI2ZTE5ODU3ZjVjMiIsImZvcm1hdHRlZFNoYTI1NiI6IjZmNjEzZWYyYzU4NDk2Njg0MmQwMDcxYzJmZGFmZjIyY2ZhZjgxYjIwNzdlZDYzYTU5M2M5OGFkYTM4MGIyODQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import reply from routes
serve reply on port 0
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNjY1YTA0NDE0OTg0NTRlMWRkNzg4MjM3NjYzNDg2ZGM2NTQyMzM4YjhjZTgwNjlkYjFlNWI2ZTE5ODU3ZjVjMiIsImZvcm1hdHRlZFNoYTI1NiI6IjZmNjEzZWYyYzU4NDk2Njg0MmQwMDcxYzJmZGFmZjIyY2ZhZjgxYjIwNzdlZDYzYTU5M2M5OGFkYTM4MGIyODQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import reply from routes
serve reply on port 0
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### HTTP configuration

Listen on `127.0.0.1`. Limit request bodies to 1048576 bytes and buffered responses to 4194304 bytes.

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It serves [`reply`](routes.md#symbol-reply) on port `0`. [source](main.md#source-L3)
:::

### Dependencies

It uses [`reply`](routes.md#symbol-reply) from `routes`.

::::

:::::
