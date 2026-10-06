---
title: "main.aug · Private state and helpers"
generated: true
source: "examples/visibility/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Private state and helpers](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`counter.aug`](counter.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMzg2ODA0MWJjNmQzZDBmNmJjODFiZDBlMTg1NTUyYWU0YTRkMTc1NTRhMjQyNTZlOTI2ZTFkMGY4MWM4YzNjOCIsImZvcm1hdHRlZFNoYTI1NiI6IjA4OTg1MWIwOGFmYWE4ZjFmNDAyMDA4YjNhYThhZDA3NTcyMDJmN2Y4NWFlZWUyYmI2MmExZmQxMTkxMzkzODAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwzLUw4IiwiZmlyc3QiOjMsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Counter from counter
counter = Counter(value=1)
print(value=counter.label())
borrow counter:
    counter.value = 2
print(value=counter.value)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMzg2ODA0MWJjNmQzZDBmNmJjODFiZDBlMTg1NTUyYWU0YTRkMTc1NTRhMjQyNTZlOTI2ZTFkMGY4MWM4YzNjOCIsImZvcm1hdHRlZFNoYTI1NiI6ImM1ZWU4NGVlMGE4ZWM3M2JhNGFjZjBlOTExNTY5ODZlNTg0MjgzMzUxZDBhNGMxOGQ5MWFiZGE5Y2U3YWM5Y2EiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwzLUw4IiwiZmlyc3QiOjMsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Counter from counter
counter = Counter(value=1)
print(value=counter.label())
borrow counter {
    counter.value = 2
}
print(value=counter.value)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It sets `counter` to a [`Counter`](counter.md#symbol-Counter) with `value` `1`. It prints [`counter.label`](counter.md#symbol-Counter.label). With temporary permission to change `counter`, it sets `counter.value` to `2`. It prints `counter.value`. [source](main.md#source-L3-L8)
:::

### Dependencies

It uses [`Counter`](counter.md#symbol-Counter) ([`label`](counter.md#symbol-Counter.label) and `value`) from `counter`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
