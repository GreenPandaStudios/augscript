---
title: "main.aug · String processing benchmark"
generated: true
source: "benchmarks/strings/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[String processing benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMDgwMWRmMGE2ODRhN2JkY2Q3NDczNTY5ODU5ZGFkNzBmYzlkMTEzMGFkYjEzOWM1MmEwMzQwOGM0OGU2ZjEzYiIsImZvcm1hdHRlZFNoYTI1NiI6ImU5ZjRiOTg0MGQxZTE0YmY3MmM0YWFkMTE4MWJhMjg5ZTA4YTI2NGE3MDljN2ZiNWY3OTQwYjE5M2YzNDM2N2YiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDItTDkiLCJmaXJzdCI6MiwibGFzdCI6OSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5LUwxMCIsImZpcnN0Ijo5LCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwyIiwiZmlyc3QiOjIsImxhc3QiOjIsImJhY2tsaW5rcyI6WyJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 20000
int index = 0
int checksum = 0
while index < iterations:
    parts = "August,clear,local,checked".split(separator=",")
    for part in parts:
        checksum = checksum + part.length()
    index = index + 1
print(value=checksum)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMDgwMWRmMGE2ODRhN2JkY2Q3NDczNTY5ODU5ZGFkNzBmYzlkMTEzMGFkYjEzOWM1MmEwMzQwOGM0OGU2ZjEzYiIsImZvcm1hdHRlZFNoYTI1NiI6ImE5ZmRiZWZjYzMxZTMxYjM5ZjJjZTc1ZDkxMWY1NjY1ODBkNTVkN2Q0ODRkNDdkMWZhNjY0YWY5ZjIxZTZjMWMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDItTDkiLCJmaXJzdCI6MiwibGFzdCI6MTEsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MOS1MMTAiLCJmaXJzdCI6MTAsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 20000
int index = 0
int checksum = 0
while index < iterations {
    parts = "August,clear,local,checked".split(separator=",")
    for part in parts {
        checksum = checksum + part.length()
    }
    index = index + 1
}
print(value=checksum)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `20000`. It sets `index` and `checksum` separately, each to `0`. While `index` is less than `iterations`, it sets `parts` to `split` on `"August,clear,local,checked"` with `separator` `","`. For each `part` in a snapshot of `parts`, it increases `checksum` by the byte length of `part`. [source](main.md#source-L2-L9)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it increases `index` by `1`. After the loop, it prints `checksum`. [source](main.md#source-L9-L10)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
