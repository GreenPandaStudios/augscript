---
title: "main.aug · Read access and mutable borrows"
generated: true
source: "examples/ownership/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Read access and mutable borrows](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`counter.aug`](counter.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZTE4OGEyYTdjNjA5MGU5NmM3OGE0ZTQwYjc3NzFjOWM1ZjQxMTJhMzk1ZjlmODQxZDY1NGRkNTRlZGJhOWFhMiIsImZvcm1hdHRlZFNoYTI1NiI6IjU5YjkwODEyMjc4ODc2ZmIzMmMzYjM3MGVmZTgxNWJhNmM5OGY2NThiYmUwNWMxNjg2ZWE3MmZhZjljZjQyOWYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwzLUw1IiwiZmlyc3QiOjMsImxhc3QiOjUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Counter from counter
own Counter counter = Counter(value=1)
counter.increment()
print(value=counter.read())
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZTE4OGEyYTdjNjA5MGU5NmM3OGE0ZTQwYjc3NzFjOWM1ZjQxMTJhMzk1ZjlmODQxZDY1NGRkNTRlZGJhOWFhMiIsImZvcm1hdHRlZFNoYTI1NiI6IjU5YjkwODEyMjc4ODc2ZmIzMmMzYjM3MGVmZTgxNWJhNmM5OGY2NThiYmUwNWMxNjg2ZWE3MmZhZjljZjQyOWYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwzLUw1IiwiZmlyc3QiOjMsImxhc3QiOjUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Counter from counter
own Counter counter = Counter(value=1)
counter.increment()
print(value=counter.read())
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It creates [`Counter`](counter.md#symbol-Counter) with `value` `1` and stores the result in owned `counter` ([`Counter`](counter.md#symbol-Counter)). It calls [`counter.increment`](counter.md#symbol-Counter.increment). It prints [`counter.read`](counter.md#symbol-Counter.read). [source](main.md#source-L3-L5)
:::

### Dependencies

It uses [`Counter`](counter.md#symbol-Counter) ([`increment`](counter.md#symbol-Counter.increment) and [`read`](counter.md#symbol-Counter.read)) from `counter`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
