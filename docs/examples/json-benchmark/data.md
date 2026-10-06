---
title: "data.aug · JSON benchmark"
generated: true
source: "benchmarks/json/data.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `data.aug`

[JSON benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`data.aug`](data.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiODY3MmU4NTJiM2QzODVlY2Q3YjYxMjZlMmJlZTUzNmY4M2UxMDA2OGU4YzJjMDc1YjA5OWYyNDNkNThmYzY1OSIsImZvcm1hdHRlZFNoYTI1NiI6ImVlMTBlYjZlMTQzNTA4MGM4MzQ1NjNkODY4Zjc4MzJlYjRlOGRhN2Y1MTU4N2MyYWVhM2RlZmVjYTI2NDVmYTYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbImRhdGEtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtUGF5bG9hZCJdfV19
// aug-spec: "data.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Payload(int id, string message, List<int> values)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiODY3MmU4NTJiM2QzODVlY2Q3YjYxMjZlMmJlZTUzNmY4M2UxMDA2OGU4YzJjMDc1YjA5OWYyNDNkNThmYzY1OSIsImZvcm1hdHRlZFNoYTI1NiI6ImVlMTBlYjZlMTQzNTA4MGM4MzQ1NjNkODY4Zjc4MzJlYjRlOGRhN2Y1MTU4N2MyYWVhM2RlZmVjYTI2NDVmYTYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbImRhdGEtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtUGF5bG9hZCJdfV19
// aug-spec: "data.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Payload(int id, string message, List<int> values)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](data-diagrams.md)

### `Payload` · immutable record · [source](data.md#source-L2) {#symbol-Payload}

It takes `id` as an integer, kept read-only, `message` as a string, kept read-only, and `values` as `List<int>`, kept read-only.

::::

:::::
