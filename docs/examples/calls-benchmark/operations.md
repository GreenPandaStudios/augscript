---
title: "operations.aug · Function-call benchmark"
generated: true
source: "benchmarks/calls/operations.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `operations.aug`

[Function-call benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`operations.aug`](operations.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMjkxNjk5NzJiYjkzMDBlNGEwZTgzOTdmMWQ1OTkwODYxOTI4YTBhMDY0YzBlMThlYWQ3YzhiZTMyZWNlNzg0ZiIsImZvcm1hdHRlZFNoYTI1NiI6IjE5NWY0YjBmOTJjOTc3NTE0OWNjMGVjMGZjZTk3OTVmNDgxYjY3YWQ2MmIxOGZhOWJlM2I2ZDhmNzI2YWU5NGYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NCwiYmFja2xpbmtzIjpbIm9wZXJhdGlvbnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtc3RlcCJdfSx7ImlkIjoic291cmNlLUwzLUw0IiwiZmlyc3QiOjMsImxhc3QiOjQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
step(int value) returns int:
    int product = value * 48271 + 1
    return product - product / 2147483647 * 2147483647
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMjkxNjk5NzJiYjkzMDBlNGEwZTgzOTdmMWQ1OTkwODYxOTI4YTBhMDY0YzBlMThlYWQ3YzhiZTMyZWNlNzg0ZiIsImZvcm1hdHRlZFNoYTI1NiI6ImYyNWYyZjJjOTlkOWEyNTEzMTlkNzY3YzRiMzhkZmQyODUwZWNlMDgwMTExYmJhZTAxOTJjZTlmZGM0MTRkYWIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NSwiYmFja2xpbmtzIjpbIm9wZXJhdGlvbnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtc3RlcCJdfSx7ImlkIjoic291cmNlLUwzLUw0IiwiZmlyc3QiOjMsImxhc3QiOjQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
step(int value) returns int {
    int product = value * 48271 + 1
    return product - product / 2147483647 * 2147483647
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](operations-diagrams.md)

### `step` · [source](operations.md#source-L2) {#symbol-step}

::: spec-paragraph specification-paragraph-1
It takes `value` as an integer. It sets `product` to (`value` times `48271`) plus `1`. It returns `product` minus ((`product` divided by `2147483647`) times `2147483647`). [source](operations.md#source-L3-L4)
:::

::: details Checked interface

```text
step(int value) returns int
```

It takes `value` as an integer.

:::

::::

:::::
