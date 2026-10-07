---
title: "compression.aug · Compression with zlib"
generated: true
source: "examples/native-zlib/compression.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `compression.aug`

[Compression with zlib](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`compression.aug`](compression.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMzE4YTUyNmFlYzFhMmVkODViNDVlNzFlMmQwZDc2MmJiZGY5MTE3ZDU4ZDNjMmFiY2E2NmIxN2E0MWI1NDUxZSIsImZvcm1hdHRlZFNoYTI1NiI6IjgzMmFmYjY5MTQ3YjEyYjRiZjY1ODRmMDNiMzhkNmJhNzUxNmM5N2E4ZTNhZjMxZTNjMTI5ZTRkOGI0ZTViNTkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6NywiYmFja2xpbmtzIjpbImNvbXByZXNzaW9uLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLXJvdW5kVHJpcCJdfSx7ImlkIjoic291cmNlLUw2LUw4IiwiZmlyc3QiOjUsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0Ijo4LCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC1yb3VuZFRyaXAiXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MTAsImxhc3QiOjEzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTMtTDE1IiwiZmlyc3QiOjExLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19XX0
// aug-spec: "compression.aug.md" explains this file. Read it before changes; refresh with aug spec.
import CompressionError and compress and decompress from "https://github.com/GreenPandaStudios/aug-zlib#fce52e3bf536a304fab82d1d4b95ae425c027be1"
/** Compress text with zlib, then restore its bytes within a fixed output limit. */
roundTrip() returns Bytes unless CompressionError:
    Bytes input = "The world runs on language".bytes()
    Bytes compressed = compress(input)
    return decompress(input=compressed, maximumOutput=4096)
test roundTrip:
    when "compression":
        it "preserves_the_original_bytes":
            Bytes restored = roundTrip()
            assert(restored.text() == "The world runs on language")
            assert(restored.length() == 26)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMzE4YTUyNmFlYzFhMmVkODViNDVlNzFlMmQwZDc2MmJiZGY5MTE3ZDU4ZDNjMmFiY2E2NmIxN2E0MWI1NDUxZSIsImZvcm1hdHRlZFNoYTI1NiI6IjM4ZmJhNDgxY2VmN2IwYjliYzE5OTIwZjMxNTRkYWYwOGNiZGQzMDNlN2Q1OTgyYmY5MzBjOGY1ZTEwMDc1OTUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OCwiYmFja2xpbmtzIjpbImNvbXByZXNzaW9uLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLXJvdW5kVHJpcCJdfSx7ImlkIjoic291cmNlLUw2LUw4IiwiZmlyc3QiOjUsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0Ijo5LCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC1yb3VuZFRyaXAiXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MTEsImxhc3QiOjE1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMTMtTDE1IiwiZmlyc3QiOjEyLCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19XX0
// aug-spec: "compression.aug.md" explains this file. Read it before changes; refresh with aug spec.
import CompressionError and compress and decompress from "https://github.com/GreenPandaStudios/aug-zlib#fce52e3bf536a304fab82d1d4b95ae425c027be1"
/** Compress text with zlib, then restore its bytes within a fixed output limit. */
roundTrip() returns Bytes unless CompressionError {
    Bytes input = "The world runs on language".bytes()
    Bytes compressed = compress(input)
    return decompress(input=compressed, maximumOutput=4096)
}
test roundTrip {
    when "compression" {
        it "preserves_the_original_bytes" {
            Bytes restored = roundTrip()
            assert(restored.text() == "The world runs on language")
            assert(restored.length() == 26)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](compression-diagrams.md)

### `roundTrip` · [source](compression.md#source-L5) {#symbol-roundTrip}

::: spec-paragraph specification-paragraph-1
Compress text with zlib, then restore its bytes within a fixed output limit. It sets `input` of type `Bytes` to the UTF-8 bytes of `"The world runs on language"`. It sets `compressed` of type `Bytes` to [`compress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.2.0/api.md#symbol-compress) with `input`. It returns [`decompress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.2.0/api.md#symbol-decompress) with `input` from `compressed` and `maximumOutput` `4096`. [source](compression.md#source-L6-L8)
:::

::: details Checked interface

```text
roundTrip() returns Bytes unless CompressionError
```

Failures can raise [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.2.0/contracts.md#symbol-CompressionError).

:::

### `test roundTrip` · [source](compression.md#source-L10) {#symbol-test-20-roundTrip}

Tests [`roundTrip`](compression.md#symbol-roundTrip). Each case gets fresh setup and dependencies.

#### `compression`

::: spec-paragraph specification-paragraph-2
##### `preserves_the_original_bytes` · [source](compression.md#source-L12)
:::

::: spec-paragraph specification-paragraph-3
It gets `restored` of type `Bytes` from [`roundTrip`](compression.md#symbol-roundTrip). The test requires `restored.text` equals `"The world runs on language"`. The test requires the byte length of `restored` equals `26`. [source](compression.md#source-L13-L15)
:::

### Dependencies

It uses [`compress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.2.0/api.md#symbol-compress), [`decompress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.2.0/api.md#symbol-decompress), and [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.2.0/contracts.md#symbol-CompressionError) from `https://github.com/GreenPandaStudios/aug-zlib#fce52e3bf536a304fab82d1d4b95ae425c027be1`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
