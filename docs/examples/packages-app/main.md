---
title: "main.aug · Use a package"
generated: true
source: "examples/packages/app/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Use a package](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOWJhY2Y5ZDljMGU5ZjBjZTgwNjYwMzIzZGU3ZjkzOGY4Yjc2NzU5MGZiYmQ3OGQzYTJjZmEwYmU5NDUwOGE3ZSIsImZvcm1hdHRlZFNoYTI1NiI6ImVlNGI3MzUzYmZhZjFhZGVlNTAxOGZhMjE2ZDk0ZTcyMzE2NjUzNDEzZDQ4Y2NlYTNlNWI3ZDA1N2ZhMDYwOGMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import add from math
print(value=add(left=20, right=22))
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOWJhY2Y5ZDljMGU5ZjBjZTgwNjYwMzIzZGU3ZjkzOGY4Yjc2NzU5MGZiYmQ3OGQzYTJjZmEwYmU5NDUwOGE3ZSIsImZvcm1hdHRlZFNoYTI1NiI6ImVlNGI3MzUzYmZhZjFhZGVlNTAxOGZhMjE2ZDk0ZTcyMzE2NjUzNDEzZDQ4Y2NlYTNlNWI3ZDA1N2ZhMDYwOGMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import add from math
print(value=add(left=20, right=22))
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It prints [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) with `left` `20` and `right` `22`. [source](main.md#source-L3)
:::

### Dependencies

It uses [`add`](dependencies/packages/%40example/aug-math/0.1.0/arithmetic.md#symbol-add) from `math`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
