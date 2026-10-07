---
title: "main.aug · GPU workers"
generated: true
source: "examples/native-gpu/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[GPU workers](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`compute.aug`](compute.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOTkzYzM2ODkwZTM5NTIyZmI3NzkzYzM4YjZkOGVmYmQ0NTY1MjAwNmJmNjI0YjMwMTM5ZGFmNmE3M2E4ZDYyNiIsImZvcm1hdHRlZFNoYTI1NiI6Ijc4NTBlNzlmNjZkZjhmMzI0OGM1MjMyZjQ2YTBmOTJlMDI0NDI0M2M5ZThkNmM4MDUzZmY3Mzc2Yjk0YzhjNTgiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUtTDE4IiwiZmlyc3QiOjQsImxhc3QiOjE3LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE4IiwiZmlyc3QiOjE3LCJsYXN0IjoxNywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUw3IiwiZmlyc3QiOjYsImxhc3QiOjYsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1jMmQ3OTcwY2NkOGYiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0Ijo3LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktYzJkNzk3MGNjZDhmIl19LHsiaWQiOiJzb3VyY2UtTDE1IiwiZmlyc3QiOjE0LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTBiYTRmY2NlYWE4YSJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjQsImxhc3QiOjE3LCJiYWNrbGlua3MiOlsibWFpbi1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from compute
import GpuError from "https://github.com/GreenPandaStudios/aug-gpu#ebc288b8d88b30213715bdbcd3d4647ff81a5462"
try:
    scope:
        first = start worker calculate(left=[1.0, 2.0, 3.0], right=[4.0, 5.0, 6.0])
        second = start worker calculate(left=[10.0, 20.0], right=[1.0, 2.0])
        (firstResult, secondResult) = wait for first and second
        for value in firstResult:
            print(value)
        for value in secondResult:
            print(value)
catch GpuError error:
    print(value=error.explain())
    exit(status=1)
catch ConcurrencyError error:
    print(value="Worker capacity is exhausted")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOTkzYzM2ODkwZTM5NTIyZmI3NzkzYzM4YjZkOGVmYmQ0NTY1MjAwNmJmNjI0YjMwMTM5ZGFmNmE3M2E4ZDYyNiIsImZvcm1hdHRlZFNoYTI1NiI6IjdkYWZmYWIwMjg0OTdkN2FmZmFhY2MzZGY3NzEzYzRiOTBlYmJkNmQwY2I0YTlhMTdlZmJiZTY2ODEyYjllN2IiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUtTDE4IiwiZmlyc3QiOjQsImxhc3QiOjIzLCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE4IiwiZmlyc3QiOjIyLCJsYXN0IjoyMiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfSx7ImlkIjoic291cmNlLUw3IiwiZmlyc3QiOjYsImxhc3QiOjYsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1jMmQ3OTcwY2NkOGYiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0Ijo3LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktYzJkNzk3MGNjZDhmIl19LHsiaWQiOiJzb3VyY2UtTDE1IiwiZmlyc3QiOjE4LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTBiYTRmY2NlYWE4YSJdfSx7ImlkIjoic291cmNlLUw1IiwiZmlyc3QiOjQsImxhc3QiOjIzLCJiYWNrbGlua3MiOlsibWFpbi1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from compute
import GpuError from "https://github.com/GreenPandaStudios/aug-gpu#ebc288b8d88b30213715bdbcd3d4647ff81a5462"
try {
    scope {
        first = start worker calculate(left=[1.0, 2.0, 3.0], right=[4.0, 5.0, 6.0])
        second = start worker calculate(left=[10.0, 20.0], right=[1.0, 2.0])
        (firstResult, secondResult) = wait for first and second
        for value in firstResult {
            print(value)
        }
        for value in secondResult {
            print(value)
        }
    }
}
catch GpuError error {
    print(value=error.explain())
    exit(status=1)
}
catch ConcurrencyError error {
    print(value="Worker capacity is exhausted")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
Within a task and ownership scope, it sets `first` to a worker task running [`calculate`](compute.md#symbol-calculate) with `left` from a list containing `1.0`, `2.0`, `3.0` and `right` from a list containing `4.0`, `5.0`, `6.0` with copies of its inputs on a separate heap. It sets `second` to a worker task running [`calculate`](compute.md#symbol-calculate) with `left` from a list containing `10.0`, `20.0` and `right` from a list containing `1.0`, `2.0` with copies of its inputs on a separate heap. It reads the result of waiting for `first` and `second` in input order; propagate failures once and binds `[0]` as `firstResult` and `[1]` as `secondResult`. [source](main.md#source-L5-L18)
:::

::: spec-paragraph specification-paragraph-2
For each `value` in a snapshot of `firstResult`, it prints `value`. After the loop, for each `value` in a snapshot of `secondResult`, it prints `value`. On leaving this scope, join its child tasks and release its local values. If this work raises [`GpuError`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/contracts.md#symbol-GpuError) as `error`, it prints [`error.explain`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/contracts.md#symbol-GpuError.explain); then it calls `exit` with `status` `1`. [source](main.md#source-L5-L18)
:::

::: spec-paragraph specification-paragraph-3
If this work raises `ConcurrencyError`, it prints `"Worker capacity is exhausted"`. [source](main.md#source-L18)
:::

### Dependencies

It uses [`GpuError`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/contracts.md#symbol-GpuError) ([`explain`](dependencies/packages/%40greenpandastudios/aug-gpu/0.2.0/contracts.md#symbol-GpuError.explain)) from `https://github.com/GreenPandaStudios/aug-gpu#ebc288b8d88b30213715bdbcd3d4647ff81a5462`. It uses [`calculate`](compute.md#symbol-calculate) from `compute`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
