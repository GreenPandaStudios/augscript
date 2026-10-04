---
title: "main.aug · Compression with zlib"
generated: true
source: "examples/native-zlib/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Compression with zlib](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`compression.aug`](compression.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMjkzNzI2Y2E2MmU0ZmZjYmIwYTQzZmNiMTg1MWQxZTQwYjQ1MDhhMDFkYjIwMjU0NGQ3ZTc3MmJkZWVhOWE1ZSIsImZvcm1hdHRlZFNoYTI1NiI6IjFiMmY3Mjg0ZWRiZWUzYTI3ZGEzOTQ3YTQ4ZDczYjk0NzhiNjY1MWIzNDZiNTU3YmEyZDcwOTI5MjE0MGJjOTgiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUtTDEwIiwiZmlyc3QiOjQsImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import roundTrip from compression
import CompressionError from "https://github.com/GreenPandaStudios/aug-zlib#v0.1.5"
try:
    print(value=roundTrip().text())
catch CompressionError error:
    print(value=error.message)
catch ConversionError error:
    print(value="Invalid UTF-8")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMjkzNzI2Y2E2MmU0ZmZjYmIwYTQzZmNiMTg1MWQxZTQwYjQ1MDhhMDFkYjIwMjU0NGQ3ZTc3MmJkZWVhOWE1ZSIsImZvcm1hdHRlZFNoYTI1NiI6ImMyZDlkOGM2ZTVjMDcxNGZlN2IyYzJhZmVkNTc3OGFiYjM5MGVhZTVmM2EwMTI4Y2ZiMGEyODM4MWFmZmEzMTAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUtTDEwIiwiZmlyc3QiOjQsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import roundTrip from compression
import CompressionError from "https://github.com/GreenPandaStudios/aug-zlib#v0.1.5"
try {
    print(value=roundTrip().text())
}
catch CompressionError error {
    print(value=error.message)
}
catch ConversionError error {
    print(value="Invalid UTF-8")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

::: spec-paragraph specification-paragraph-1
It prints `text` on [`roundTrip`](compression.md#symbol-roundTrip). If this work raises [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/contracts.md#symbol-CompressionError) as `error`, it prints `error.message`. If this work raises `ConversionError`, it prints `"Invalid UTF-8"`. [source](main.md#source-L5-L10)
:::

### Dependencies

It uses [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/contracts.md#symbol-CompressionError) (`message`) from `https://github.com/GreenPandaStudios/aug-zlib#v0.1.5`. It uses [`roundTrip`](compression.md#symbol-roundTrip) from `compression`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
