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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNzhlNzM3YmE1MTdjOWE5MGM0MDhiYjUyZDg2ZmU1YmJhMjljNWRjODQ1NGU3ZGUwMDJiNDEwM2JkYzQxOTAzMSIsImZvcm1hdHRlZFNoYTI1NiI6ImMzNDRhYzE0OTdiMWJkNmY1MTJkYWNkNTQ4YjEwN2EzZGVkMmYxNWZjNzg0ODNiODNiZTRjYWY4MTI4NmIzNGMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6NywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1LUw4IiwiZmlyc3QiOjQsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#e87f57af25ac17662c6299224815d3fd1464ad3e"
try:
    print(value=calculate())
catch TensorError error:
    print(value=error.message)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNzhlNzM3YmE1MTdjOWE5MGM0MDhiYjUyZDg2ZmU1YmJhMjljNWRjODQ1NGU3ZGUwMDJiNDEwM2JkYzQxOTAzMSIsImZvcm1hdHRlZFNoYTI1NiI6ImEwODQzNTQ4NTUyYzEzOTM3Nzk0OWNhM2UzOTU1MDBjMjRkZDg0YmJmMTYwMWY4M2E5ZGU3OWM3ZjVkMGY0M2IiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1LUw4IiwiZmlyc3QiOjQsImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#e87f57af25ac17662c6299224815d3fd1464ad3e"
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

It uses [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/contracts.md#symbol-TensorError) (`message`) from `https://github.com/GreenPandaStudios/aug-pytorch#e87f57af25ac17662c6299224815d3fd1464ad3e`. It uses [`calculate`](tensors.md#symbol-calculate) from `tensors`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
