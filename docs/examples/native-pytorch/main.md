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

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.5"
try:
    print(value=calculate())
catch TensorError error:
    print(value=error.message)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import calculate from tensors
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.5"
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

### Startup

It prints [`calculate`](tensors.md#symbol-calculate). If this work raises [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.5/contracts.md#symbol-TensorError) as `error`, it prints `error.message`.

### Dependencies

It uses [`TensorError`](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.5/contracts.md#symbol-TensorError) (`message`) from `https://github.com/GreenPandaStudios/aug-pytorch#v0.1.5`. It uses [`calculate`](tensors.md#symbol-calculate) from `tensors`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
