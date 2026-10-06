---
title: "main.aug · List traversal benchmark"
generated: true
source: "benchmarks/list/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[List traversal benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNzIwOGMyYzNiYzBjZGFiZDdlMWJhMjU3M2IwYmJlNjJlMzE5M2I3MzE4NzMzMTQ0ZDI2MzY4MTRkYjNjMTQ0MyIsImZvcm1hdHRlZFNoYTI1NiI6IjQ1ZWFhMDljMWMzYjA1MjUwNzIxYTNjN2UzZWE0YzU5MDcyY2M2MWRhZjQ0YjIwZDc1ZTBlNjJkZjNkZWM3YjYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwyLUw3IiwiZmlyc3QiOjIsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw4LUwxMSIsImZpcnN0Ijo4LCJsYXN0IjoxMSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 100000
own List<int> values = []
int index = 0
while index < iterations:
    values.append(value=index * 3)
    index = index + 1
int checksum = 0
for value in values:
    checksum = checksum + value
print(value=checksum)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNzIwOGMyYzNiYzBjZGFiZDdlMWJhMjU3M2IwYmJlNjJlMzE5M2I3MzE4NzMzMTQ0ZDI2MzY4MTRkYjNjMTQ0MyIsImZvcm1hdHRlZFNoYTI1NiI6ImEzYWNmMTE0M2M4OThjY2VlM2NjNGM4MjY1Yzg4MjA5NjYyODczNzg5MjNlYzEzYzIzMTFiNGMyM2E3Mjg3ZTEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwyLUw3IiwiZmlyc3QiOjIsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw4LUwxMSIsImZpcnN0Ijo5LCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 100000
own List<int> values = []
int index = 0
while index < iterations {
    values.append(value=index * 3)
    index = index + 1
}
int checksum = 0
for value in values {
    checksum = checksum + value
}
print(value=checksum)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `100000`. It stores a list with no items in owned `values` (`List<int>`). It sets `index` to `0`. While `index` is less than `iterations`, it appends `index` times `3` to `values`; then it increases `index` by `1`. [source](main.md#source-L2-L7)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it sets `checksum` to `0`. For each `value` in a snapshot of `values`, it increases `checksum` by `value`. After the loop, it prints `checksum`. [source](main.md#source-L8-L11)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
