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

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import hashText from hashing
import HashError from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.1"
try:
    print(value=hashText(value="abc"))
catch HashError error:
    print(value=error.message)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import hashText from hashing
import HashError from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.1"
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

### Startup

It prints [`hashText`](hashing.md#symbol-hashText) with `value` `"abc"`. If this work raises [`HashError`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.1/contracts.md#symbol-HashError) as `error`, it prints `error.message`.

### Dependencies

It uses [`HashError`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.1/contracts.md#symbol-HashError) (`message`) from `https://github.com/GreenPandaStudios/aug-blake3#v0.1.1`. It uses [`hashText`](hashing.md#symbol-hashText) from `hashing`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
