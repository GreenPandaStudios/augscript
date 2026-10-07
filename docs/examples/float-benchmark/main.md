---
title: "main.aug · Floating-point benchmark"
generated: true
source: "benchmarks/float/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Floating-point benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZTY1MWE4NGU0OGQ0NmVlOGZlMDkxMWE2MGViNTk1OTk1OTQxYjNlN2IwNmNkYjA0YzZlODMzZTM4YzRkYmQzZCIsImZvcm1hdHRlZFNoYTI1NiI6IjY5NzhiMjExYTM3MWZjMTE1ZmNhYjE2YjNjNGEzZTFlMmQ1OWY2YzUxNTZiYTgxNDg1NWIwYjQ2NmNlYzUyODAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDItTDgiLCJmaXJzdCI6MiwibGFzdCI6OCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5LUwxMCIsImZpcnN0Ijo5LCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwyIiwiZmlyc3QiOjIsImxhc3QiOjIsImJhY2tsaW5rcyI6WyJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 1000000
float sum = 0.0
int index = 0
while index < iterations:
    int remainder = index - index / 8 * 8
    sum = sum + remainder * 0.125 + 0.5
    index = index + 1
print(value=sum == 937500.0)
print(value=iterations)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZTY1MWE4NGU0OGQ0NmVlOGZlMDkxMWE2MGViNTk1OTk1OTQxYjNlN2IwNmNkYjA0YzZlODMzZTM4YzRkYmQzZCIsImZvcm1hdHRlZFNoYTI1NiI6IjhkZjZhYzk0ZmJiYTE3NmMyNDBmOWRmNzMwMjgwMDZhY2I0MzdiNzJkYjYyNjdlMjE3ZDBmNTU2NGRmOGMyNWIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDItTDgiLCJmaXJzdCI6MiwibGFzdCI6OSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5LUwxMCIsImZpcnN0IjoxMCwibGFzdCI6MTEsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMiIsImZpcnN0IjoyLCJsYXN0IjoyLCJiYWNrbGlua3MiOlsibWFpbi1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 1000000
float sum = 0.0
int index = 0
while index < iterations {
    int remainder = index - index / 8 * 8
    sum = sum + remainder * 0.125 + 0.5
    index = index + 1
}
print(value=sum == 937500.0)
print(value=iterations)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `1000000`. It sets `sum` to `0.0`. It sets `index` to `0`. While `index` is less than `iterations`, it sets `remainder` to `index` minus ((`index` divided by `8`) times `8`); then it sets `sum` to (`sum` plus (`remainder` times `0.125`)) plus `0.5`; then it increases `index` by `1`. [source](main.md#source-L2-L8)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it prints `sum` equals `937500.0`. It prints `iterations`. [source](main.md#source-L9-L10)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
