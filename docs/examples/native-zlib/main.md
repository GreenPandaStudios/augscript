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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYjM1NGQxNWFjMzZlNThmYjUyM2NlMTM3NTljMzMyZWUyZWI4YThkMzM4YzEyZjg2ODdjZDMxNWRkZWFjYmQwYyIsImZvcm1hdHRlZFNoYTI1NiI6IjU2MWRhY2FmY2M0ZWY4NTQ2ODgwMjgzNTA0ODA1OWU4OWJiZDFlZjcxMTkwOTIxMGJjZDlmYmJhNTdhNmRhNzciLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1LUwxMCIsImZpcnN0Ijo0LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import roundTrip from compression
import CompressionError from "https://github.com/GreenPandaStudios/aug-zlib#fce52e3bf536a304fab82d1d4b95ae425c027be1"
try:
    print(value=roundTrip().text())
catch CompressionError error:
    print(value=error.message)
catch ConversionError error:
    print(value="Invalid UTF-8")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYjM1NGQxNWFjMzZlNThmYjUyM2NlMTM3NTljMzMyZWUyZWI4YThkMzM4YzEyZjg2ODdjZDMxNWRkZWFjYmQwYyIsImZvcm1hdHRlZFNoYTI1NiI6IjFhY2FkMDI1OTA3MTZkYTY3MTc3ZjZhNTA4ZDVkNzg4YjA4NDNkNjNjODBmN2I2OWQyMmZmNmRkZGRjZjc2MjkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MNS1MMTAiLCJmaXJzdCI6NCwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import roundTrip from compression
import CompressionError from "https://github.com/GreenPandaStudios/aug-zlib#fce52e3bf536a304fab82d1d4b95ae425c027be1"
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

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It prints `text` on [`roundTrip`](compression.md#symbol-roundTrip). If this work raises [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.2.0/contracts.md#symbol-CompressionError) as `error`, it prints `error.message`. If this work raises `ConversionError`, it prints `"Invalid UTF-8"`. [source](main.md#source-L5-L10)
:::

### Dependencies

It uses [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.2.0/contracts.md#symbol-CompressionError) (`message`) from `https://github.com/GreenPandaStudios/aug-zlib#fce52e3bf536a304fab82d1d4b95ae425c027be1`. It uses [`roundTrip`](compression.md#symbol-roundTrip) from `compression`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
