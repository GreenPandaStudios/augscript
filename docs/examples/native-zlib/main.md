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

```aug [Indentation]
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

```aug [Braces]
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

It prints `text` on [`roundTrip`](compression.md#symbol-roundTrip). If this work raises [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/contracts.md#symbol-CompressionError) as `error`, it prints `error.message`. If this work raises `ConversionError`, it prints `"Invalid UTF-8"`.

### Dependencies

It uses [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/contracts.md#symbol-CompressionError) (`message`) from `https://github.com/GreenPandaStudios/aug-zlib#v0.1.5`. It uses [`roundTrip`](compression.md#symbol-roundTrip) from `compression`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
