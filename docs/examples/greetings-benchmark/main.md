---
title: "main.aug · A million greetings"
generated: true
source: "benchmarks/greetings/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[A million greetings](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiM2NjMmU0NGUzYTBlYWUyZjU0ZTU0MTk1YjVjNTIzMjhhMjFlOGIxMDgxMmUyYzczYmRlNGMyNTg3ZWZkZGI3MyIsImZvcm1hdHRlZFNoYTI1NiI6ImRjMjEzYWYzNGJhY2I0YzllNTYwMWQ1OWE4YzY0YzY3NjhhYzBlZDMzYWVlYTI3YmJiMWQ0NWIzYWFkN2IwNzIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwyLUw1IiwiZmlyc3QiOjIsImxhc3QiOjUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
greetings = 0
while greetings < 1000000:
    print(value="Hello, August! 👋")
    greetings = greetings + 1
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiM2NjMmU0NGUzYTBlYWUyZjU0ZTU0MTk1YjVjNTIzMjhhMjFlOGIxMDgxMmUyYzczYmRlNGMyNTg3ZWZkZGI3MyIsImZvcm1hdHRlZFNoYTI1NiI6ImU4YzQ5MDc3OWFhY2UxMjczYTVhM2FlY2NiZTBmYTk2NDNiZDdhMzhjYzE0YTAwM2UxMjU0YjViNmMxMjU3MjEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwyLUw1IiwiZmlyc3QiOjIsImxhc3QiOjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
greetings = 0
while greetings < 1000000 {
    print(value="Hello, August! 👋")
    greetings = greetings + 1
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It sets `greetings` to `0`. While `greetings` is less than `1000000`, it prints `"Hello, August! 👋"`; then it increases `greetings` by `1`. [source](main.md#source-L2-L5)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
