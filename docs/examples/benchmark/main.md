---
title: "main.aug · A finite benchmark"
generated: true
source: "examples/benchmark/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[A finite benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMWM4NDMwNzE1MDZjNThlOWFmYjY2NjViNzQyZGNlMWI3YjJhYTIzOGM0NzBmOTE5YjYzNjAxNTg4M2IwNmQ2MiIsImZvcm1hdHRlZFNoYTI1NiI6ImM0OGZkMTgyZjc0NTA3NmUxYzY3NzEzNmMwNTY2MjhjOTI5ZWVkOTQ4NDVjYWYyZjMwNjU2MTIzZjI3MzExYjUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwzLUwxMCIsImZpcnN0IjozLCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMTEtTDE4IiwiZmlyc3QiOjEwLCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
// A deterministic native workload: arithmetic and 20,000 hash entries.
own Map<int,int> values = {}
own Set<int> unique = {}
int index = 0
while index < 20000:
    values.set(key=index, value=index * 3)
    unique.add(value=index)
    index = index + 1
int checksum = 0
for (key, value) in values:
    if unique.contains(value=key):
        checksum = checksum + value
print(value=checksum)
print(value=values.length() == unique.length())
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMWM4NDMwNzE1MDZjNThlOWFmYjY2NjViNzQyZGNlMWI3YjJhYTIzOGM0NzBmOTE5YjYzNjAxNTg4M2IwNmQ2MiIsImZvcm1hdHRlZFNoYTI1NiI6IjM4Nzc5NjEzMmQ0NzAxNGEyM2JjOWJiYmJiZjE1Mzc3NGZkNTI3ODViMzIxNDVmYjNkYmRkMDQyNGExMDAwYTQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwzLUwxMCIsImZpcnN0IjozLCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDExLUwxOCIsImZpcnN0IjoxMSwibGFzdCI6MTgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
// A deterministic native workload: arithmetic and 20,000 hash entries.
own Map<int,int> values = {}
own Set<int> unique = {}
int index = 0
while index < 20000 {
    values.set(key=index, value=index * 3)
    unique.add(value=index)
    index = index + 1
}
int checksum = 0
for (key, value) in values {
    if unique.contains(value=key) {
        checksum = checksum + value
    }
}
print(value=checksum)
print(value=values.length() == unique.length())
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It stores a context-typed empty collection with no items in owned `values` (`Map<int,int>`). It stores a context-typed empty collection with no items in owned `unique` (`Set<int>`). It sets `index` to `0`. While `index` is less than `20000`, it stores `index` times `3` in `values` under `index`; then it adds `index` to `unique`; then it increases `index` by `1`. [source](main.md#source-L3-L10)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it sets `checksum` to `0`. For each `key` and `value` in a snapshot of `values`, if whether `unique` contains `key` returns true, it increases `checksum` by `value`. After the loop, it prints `checksum`. It prints the number of elements in `values` equals the number of elements in `unique`. [source](main.md#source-L11-L18)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
