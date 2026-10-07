---
title: "main.aug · Checked-error benchmark"
generated: true
source: "benchmarks/errors/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Checked-error benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`operations.aug`](operations.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNjRiMGRlNzFkOGYyYTFmMWM2YTVlNGY2YTYwOTU4NTAwZTg1Y2Y2MzgyMGVhMWExYjZkYmMxN2JkYzJmNDRmYSIsImZvcm1hdHRlZFNoYTI1NiI6IjQ1YmVmNDViYzhiNDgwZWFhNGRkMjgzODhkY2E1OTg2MTliNDQ1OTE1MGQ2ZGQ5YjlhYTkwMDNkYzliOTM3NDAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDYiLCJmaXJzdCI6MywibGFzdCI6NiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw3LUwxMyIsImZpcnN0Ijo3LCJsYXN0IjoxMywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoxNCwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo5LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOTRjNjNmZjFmODM5Il19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import validate from operations
int iterations = 20000
int index = 0
int checksum = 0
int failures = 0
while index < iterations:
    try:
        checksum = checksum + validate(value=index)
    catch FileError error:
        failures = failures + 1
    index = index + 1
print(value=checksum)
print(value=failures)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNjRiMGRlNzFkOGYyYTFmMWM2YTVlNGY2YTYwOTU4NTAwZTg1Y2Y2MzgyMGVhMWExYjZkYmMxN2JkYzJmNDRmYSIsImZvcm1hdHRlZFNoYTI1NiI6IjdhNWZjMTY3MThhMTA0YWI3NTY4YmYxOTlmYTE3NzNlMzRmMjUxYzMxOWY0NzllYzYzZmFmNDE1MzY4MDRkNmMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDYiLCJmaXJzdCI6MywibGFzdCI6NiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw3LUwxMyIsImZpcnN0Ijo3LCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoxNywibGFzdCI6MTcsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo5LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktOTRjNjNmZjFmODM5Il19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import validate from operations
int iterations = 20000
int index = 0
int checksum = 0
int failures = 0
while index < iterations {
    try {
        checksum = checksum + validate(value=index)
    }
    catch FileError error {
        failures = failures + 1
    }
    index = index + 1
}
print(value=checksum)
print(value=failures)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `20000`. It sets `index`, `checksum`, and `failures` separately, each to `0`. [source](main.md#source-L3-L6)
:::

::: spec-paragraph specification-paragraph-2
While `index` is less than `iterations`, it tries to increase `checksum` by [`validate`](operations.md#symbol-validate) with `value` from `index`. If this work raises `FileError`, it increases `failures` by `1`. It increases `index` by `1`. After the loop, it prints `checksum`. [source](main.md#source-L7-L13)
:::

::: spec-paragraph specification-paragraph-3
It prints `failures`. [source](main.md#source-L14)
:::

### Dependencies

It uses [`validate`](operations.md#symbol-validate) from `operations`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
