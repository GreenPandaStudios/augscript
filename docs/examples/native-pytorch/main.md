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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNGQyZWU3ZWY5ODc5YWVjNDcyNDM4MGY4NTA4YjZiNmYyZmUxYWFhZTVmYTIxNmEwZWM1NmRiY2ZiN2NjZjg0ZSIsImZvcm1hdHRlZFNoYTI1NiI6IjA1ODhiZTg5OWVkOGI0YzZiM2MwZmZiNzdkYjRjNWQ0MzQyOTUwY2E5NDlkODZmNTM5NTc3MjczNzU4ZjZhNjQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6NywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1LUw4IiwiZmlyc3QiOjQsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#e2b74b1968fb11972e260ef3796a1cd849c1f702"
try:
    print(value=calculate())
catch TensorError error:
    print(value=error.message)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNGQyZWU3ZWY5ODc5YWVjNDcyNDM4MGY4NTA4YjZiNmYyZmUxYWFhZTVmYTIxNmEwZWM1NmRiY2ZiN2NjZjg0ZSIsImZvcm1hdHRlZFNoYTI1NiI6ImI1MGM5NDJlMzlkZDNjYzI1YTJhZjhmODcyYTEwNzAxMGE4ZjM4M2M4NTY0ZGZmMzA0Zjk4NGIzM2M3OWE0M2MiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1LUw4IiwiZmlyc3QiOjQsImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#e2b74b1968fb11972e260ef3796a1cd849c1f702"
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
It prints [`calculate`](tensors.md#symbol-calculate). If this work raises [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/contracts.md#symbol-TensorError) as `error`, it prints `error.message`. [source](main.md#source-L5-L8)
:::

### Dependencies

It uses [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/contracts.md#symbol-TensorError) (`message`) from `https://github.com/GreenPandaStudios/aug-pytorch#e2b74b1968fb11972e260ef3796a1cd849c1f702`. It uses [`calculate`](tensors.md#symbol-calculate) from `tensors`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
