---
title: "main.aug · Hashing with Rust BLAKE3"
generated: true
source: "examples/native-blake3/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Hashing with Rust BLAKE3](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`hashing.aug`](hashing.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMThlZDMxMzVjNjM1OGYzMDMyZDVmYTE4YjUyZmVmMGRkMjIxYjViNDQxMDJiOWYxMzMwM2NhODRhYWIxOWEzMiIsImZvcm1hdHRlZFNoYTI1NiI6ImI0ZjQzODBkMzgwNWExODgzZjVmYWQ2NzBhMmMyYTBlYTE5MTA0NmIyYTY1YzQxOThhNGZlMmFmMDEzNzNkMzAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6NywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1LUw4IiwiZmlyc3QiOjQsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import hashText from hashing
import HashError from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.5"
try:
    print(value=hashText(value="abc"))
catch HashError error:
    print(value=error.message)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMThlZDMxMzVjNjM1OGYzMDMyZDVmYTE4YjUyZmVmMGRkMjIxYjViNDQxMDJiOWYxMzMwM2NhODRhYWIxOWEzMiIsImZvcm1hdHRlZFNoYTI1NiI6IjE1NjEwZGQ5YzNiMzE4ZTJkOWNiNDE0ODNmZmJjMmEwZWE5ZjQ0ZjExNDkzNjY0YzM3MjExZTMyOTE5MzdhYTUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1LUw4IiwiZmlyc3QiOjQsImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import hashText from hashing
import HashError from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.5"
try {
    print(value=hashText(value="abc"))
}
catch HashError error {
    print(value=error.message)
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It prints [`hashText`](hashing.md#symbol-hashText) with `value` `"abc"`. If this work raises [`HashError`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.5/contracts.md#symbol-HashError) as `error`, it prints `error.message`. [source](main.md#source-L5-L8)
:::

### Dependencies

It uses [`HashError`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.5/contracts.md#symbol-HashError) (`message`) from `https://github.com/GreenPandaStudios/aug-blake3#v0.1.5`. It uses [`hashText`](hashing.md#symbol-hashText) from `hashing`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
