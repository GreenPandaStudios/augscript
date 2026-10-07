---
title: "main.aug · Checked failures"
generated: true
source: "examples/errors/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Checked failures](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`errors.aug`](errors.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZDZiOTU4YTE2NDMzZTRmM2Y4NDlhNTNjMmZiMWVkZTYyZGE1OWQ5Njk5ZDRjZTYxZGRmZTk5NzFkM2ZlZmM5YiIsImZvcm1hdHRlZFNoYTI1NiI6IjM2NzUyMTUzNWI0OTk0NzRhZTcyZTE4N2I5NzQ0MmIyM2QzMDA1NjFhZjlmZmQ5YzBhOThmMWZjZWI3NjhjZGQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDgiLCJmaXJzdCI6MywibGFzdCI6NiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjQsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1lMDlkNTZlMzUyZGIiXX0seyJpZCI6InNvdXJjZS1MMyIsImZpcnN0IjozLCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsibWFpbi1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import load from errors
try:
    print(value=load(fail=true))
catch FileError error:
    print(value="caught FileError")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZDZiOTU4YTE2NDMzZTRmM2Y4NDlhNTNjMmZiMWVkZTYyZGE1OWQ5Njk5ZDRjZTYxZGRmZTk5NzFkM2ZlZmM5YiIsImZvcm1hdHRlZFNoYTI1NiI6IjRjODU1MDg4ZDAwYWI2YjBlM2EzYjI0ZTJlNDFmYjhjYmVjZGEyMTYyMmE4NWRiNzM3OGIwNjE5YTNkNzFkYjUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDgiLCJmaXJzdCI6MywibGFzdCI6OCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjQsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1lMDlkNTZlMzUyZGIiXX0seyJpZCI6InNvdXJjZS1MMyIsImZpcnN0IjozLCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsibWFpbi1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import load from errors
try {
    print(value=load(fail=true))
}
catch FileError error {
    print(value="caught FileError")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It prints [`load`](errors.md#symbol-load) with `fail` `true`. If this work raises `FileError`, it prints `"caught FileError"`. [source](main.md#source-L3-L8)
:::

### Dependencies

It uses [`load`](errors.md#symbol-load) from `errors`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
