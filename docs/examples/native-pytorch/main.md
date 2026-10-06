---
title: "main.aug · CPU tensors with PyTorch"
generated: true
source: "examples/native-pytorch/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[CPU tensors with PyTorch](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`tensors.aug`](tensors.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNGFlMjAyZDQwNjEyNTgxNmE2OGM5MDdkZjllNTc4OTIyYjg4ZWNhYTZmNGJhZDE4MzExZTc1NDQ0NzY1ZTNiNyIsImZvcm1hdHRlZFNoYTI1NiI6ImQwZmJjMTBkNDQxNmZkYjI1ZjQ3MzQ4ZjM2M2E2Y2Q2YjdhMzI1ZjNlZTg0N2E4MTllZmQzOTc0ZWUxMWFjNTgiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6NywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1LUw4IiwiZmlyc3QiOjQsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.6"
try:
    print(value=calculate())
catch TensorError error:
    print(value=error.message)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNGFlMjAyZDQwNjEyNTgxNmE2OGM5MDdkZjllNTc4OTIyYjg4ZWNhYTZmNGJhZDE4MzExZTc1NDQ0NzY1ZTNiNyIsImZvcm1hdHRlZFNoYTI1NiI6ImI5MDMzYmVlYTc1ZjU5ZTQ2Y2NiMjNhYzY5NjZhM2ZlODM4YzhjNDkyYmQyMTMzZTBhODliZmJhYjk1ZGYwY2IiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1LUw4IiwiZmlyc3QiOjQsImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.6"
try {
    print(value=calculate())
}
catch TensorError error {
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
It prints [`calculate`](tensors.md#symbol-calculate). If this work raises [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.6/contracts.md#symbol-TensorError) as `error`, it prints `error.message`. [source](main.md#source-L5-L8)
:::

### Dependencies

It uses [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.6/contracts.md#symbol-TensorError) (`message`) from `https://github.com/GreenPandaStudios/aug-pytorch#v0.1.6`. It uses [`calculate`](tensors.md#symbol-calculate) from `tensors`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
