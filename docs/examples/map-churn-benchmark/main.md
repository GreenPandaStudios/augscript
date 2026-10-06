---
title: "main.aug · Map deletion benchmark"
generated: true
source: "benchmarks/map-churn/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Map deletion benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNzZlOWVlYmRlNWJlZmE4NDVkYzhkNTQ1ZTgwNmY5ODdhZDQ4ZTcyMmMwYjljOWI2NGNmN2ViYTJhZDY1NGNmNyIsImZvcm1hdHRlZFNoYTI1NiI6ImRlZDEyOWZlMDRkYWYwODY0MzY5Y2VkMzgyMjQxMTRjYjQyNmNjYmM3MDU0NjNmYzNkMThiMDgyZDgyYzk4MjUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwyLUw3IiwiZmlyc3QiOjIsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw4LUwxNSIsImZpcnN0Ijo4LCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE2LUwyMSIsImZpcnN0IjoxNiwibGFzdCI6MjEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUwyMiIsImZpcnN0IjoyMiwibGFzdCI6MjIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 4000
own Map<int,int> entries = {}
int index = 0
while index < iterations:
    entries.set(key=index, value=index * 3)
    index = index + 1
index = 0
while index < iterations:
    entries.take(key=index)
    index = index + 2
index = 0
while index < iterations:
    entries.set(key=index, value=index * 7)
    index = index + 1
int checksum = 0
int position = 1
for (key, value) in entries:
    checksum = checksum + key * position + value
    position = position + 1
print(value=checksum)
print(value=entries.length())
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNzZlOWVlYmRlNWJlZmE4NDVkYzhkNTQ1ZTgwNmY5ODdhZDQ4ZTcyMmMwYjljOWI2NGNmN2ViYTJhZDY1NGNmNyIsImZvcm1hdHRlZFNoYTI1NiI6IjU2ODU5Nzg0NDBjNmI2OTYwYzNjNDY0NTYxYmMzMzQ1NDQzYjM5NzFjNmQ2M2Y2M2I1YzQ4OThjODMxNTQ2MWEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwyLUw3IiwiZmlyc3QiOjIsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw4LUwxNSIsImZpcnN0Ijo5LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE2LUwyMSIsImZpcnN0IjoxOSwibGFzdCI6MjUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUwyMiIsImZpcnN0IjoyNiwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNCJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 4000
own Map<int,int> entries = {}
int index = 0
while index < iterations {
    entries.set(key=index, value=index * 3)
    index = index + 1
}
index = 0
while index < iterations {
    entries.take(key=index)
    index = index + 2
}
index = 0
while index < iterations {
    entries.set(key=index, value=index * 7)
    index = index + 1
}
int checksum = 0
int position = 1
for (key, value) in entries {
    checksum = checksum + key * position + value
    position = position + 1
}
print(value=checksum)
print(value=entries.length())
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `4000`. It stores a context-typed empty collection with no items in owned `entries` (`Map<int,int>`). It sets `index` to `0`. While `index` is less than `iterations`, it stores `index` times `3` in `entries` under `index`; then it increases `index` by `1`. [source](main.md#source-L2-L7)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it sets `index` to `0`. While `index` is less than `iterations`, it removes the key `index` from `entries`; then it increases `index` by `2`. After the loop, it sets `index` to `0`. While `index` is less than `iterations`, it stores `index` times `7` in `entries` under `index`; then it increases `index` by `1`. [source](main.md#source-L8-L15)
:::

::: spec-paragraph specification-paragraph-3
After the loop, it sets `checksum` to `0`. It sets `position` to `1`. For each `key` and `value` in a snapshot of `entries`, it sets `checksum` to (`checksum` plus (`key` times `position`)) plus `value`; then it increases `position` by `1`. After the loop, it prints `checksum`. [source](main.md#source-L16-L21)
:::

::: spec-paragraph specification-paragraph-4
It prints the number of elements in `entries`. [source](main.md#source-L22)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
