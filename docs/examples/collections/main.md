---
title: "main.aug · Lists, tuples, sets, and maps"
generated: true
source: "examples/collections/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Lists, tuples, sets, and maps](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZmNkMjMzZDYxN2Y5M2E3ZDZiNTE3OTJiMWI4MmExODI5ZTdiYzI2MzdhZjEzNzBkMjUxYWU4NDIyMTdhMzY1YiIsImZvcm1hdHRlZFNoYTI1NiI6IjMyNTJhOWZhNzdmNTE4YWM4MjgxOTVlYWUxMThhYjU4OGYyYzdlNzAwN2JkZDZiNjNhMjZlOWNjMzdkN2NlNGMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMi1MMTkiLCJmaXJzdCI6MiwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5LUwxNCIsImZpcnN0Ijo4LCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE1LUwxOCIsImZpcnN0IjoxMywibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
try:
    numbers = List<int>(2, 4)
    borrow numbers:
        numbers.append(value=6)
    print(value=numbers.length())
    print(value=numbers.get(index=1))
    scores = Map<string, int>()
    borrow scores:
        scores.set(value=42, key="ada")
    print(value=scores.contains(key="ada"))
    print(value=scores.get(key="ada"))
    print(value=scores.length())
catch IndexError error:
    print(value="unexpected index failure")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZmNkMjMzZDYxN2Y5M2E3ZDZiNTE3OTJiMWI4MmExODI5ZTdiYzI2MzdhZjEzNzBkMjUxYWU4NDIyMTdhMzY1YiIsImZvcm1hdHRlZFNoYTI1NiI6ImU3ZWZiMDM0YjgxYmU0Mjg4ZGI4ZjlkYmZhYjgzZDJlNWFjMTQ2OGUzMWEwOGEyMmVjMzY0ZjFiNWU1ODRmMjYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MTksImJhY2tsaW5rcyI6WyJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMi1MMTkiLCJmaXJzdCI6MiwibGFzdCI6MTksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5LUwxNCIsImZpcnN0Ijo5LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE1LUwxOCIsImZpcnN0IjoxNSwibGFzdCI6MTgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
try {
    numbers = List<int>(2, 4)
    borrow numbers {
        numbers.append(value=6)
    }
    print(value=numbers.length())
    print(value=numbers.get(index=1))
    scores = Map<string, int>()
    borrow scores {
        scores.set(value=42, key="ada")
    }
    print(value=scores.contains(key="ada"))
    print(value=scores.get(key="ada"))
    print(value=scores.length())
}
catch IndexError error {
    print(value="unexpected index failure")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It sets `numbers` to a list of `int` containing `2`, `4`. With temporary permission to change `numbers`, it appends `6` to `numbers`. It prints the number of elements in `numbers`. It prints the item at index `1` in `numbers`. [source](main.md#source-L2-L19)
:::

::: spec-paragraph specification-paragraph-2
It sets `scores` to an empty map from `string` to `int`. With temporary permission to change `scores`, it stores `42` in `scores` under `"ada"`. It prints whether `scores` contains the key `"ada"`. It prints the value under `"ada"` in `scores`. [source](main.md#source-L9-L14)
:::

::: spec-paragraph specification-paragraph-3
It prints the number of elements in `scores`. If this work raises `IndexError`, it prints `"unexpected index failure"`. [source](main.md#source-L15-L18)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
