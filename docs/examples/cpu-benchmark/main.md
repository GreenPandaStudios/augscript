---
title: "main.aug · CPU benchmark"
generated: true
source: "benchmarks/cpu/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[CPU benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMWU3MjBiYmIwYjMyNjhmNjE0NDc5ODdlMzg5YjQzMDYzMmYyM2QxNzM2N2I4OWY2ZDBjMTY2MjRmMTYyMjRkMyIsImZvcm1hdHRlZFNoYTI1NiI6ImM4MjQzY2VmZjg0Y2VmYWMwYWIyNGZkMTVmYmNmNDUwZDZlNjI5ZDkwZDFjMTgxZjMwNjg4N2E5YmUxNWE2MmIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDkiLCJmaXJzdCI6MywibGFzdCI6OSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwzIiwiZmlyc3QiOjMsImxhc3QiOjMsImJhY2tsaW5rcyI6WyJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
// A loop-carried dependency prevents removal of the computation.
int state = 123
int index = 0
while index < 2000000:
    int product = state * 48271
    state = product - product / 2147483647 * 2147483647
    index = index + 1
print(value=state)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMWU3MjBiYmIwYjMyNjhmNjE0NDc5ODdlMzg5YjQzMDYzMmYyM2QxNzM2N2I4OWY2ZDBjMTY2MjRmMTYyMjRkMyIsImZvcm1hdHRlZFNoYTI1NiI6IjI4YThmNTI3ZjA2YzdiMTk0NWYxMjdiYjRhYzY5NjMzMzgxODc2Y2M0MjYzODkzN2UzMGNkMGNkMTJlM2U2MTAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDkiLCJmaXJzdCI6MywibGFzdCI6MTAsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMyIsImZpcnN0IjozLCJsYXN0IjozLCJiYWNrbGlua3MiOlsibWFpbi1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
// A loop-carried dependency prevents removal of the computation.
int state = 123
int index = 0
while index < 2000000 {
    int product = state * 48271
    state = product - product / 2147483647 * 2147483647
    index = index + 1
}
print(value=state)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `state` to `123`. It sets `index` to `0`. While `index` is less than `2000000`, it sets `product` to `state` times `48271`; then it sets `state` to `product` minus ((`product` divided by `2147483647`) times `2147483647`); then it increases `index` by `1`. After the loop, it prints `state`. [source](main.md#source-L3-L9)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
