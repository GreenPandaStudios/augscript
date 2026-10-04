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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYTg5OTMyZGU5NmEyMTFlYWU4NDkxNzA5ODY5NGQwYTg1ODM2YjRkZWMxNmU2ZTYyODg5OWM2YjhhMzM5MThlMyIsImZvcm1hdHRlZFNoYTI1NiI6IjliNWQ0ZTQ1ODkwZGMxNjk3N2FjZjg5Y2YzNGExNzQxNWZmODFjZmQyOWJkNzY3ZjQ0ZmMwODE3ZTY4ZTg4ZmIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtcm91bmRUcmlwIl19LHsiaWQiOiJzb3VyY2UtTDYtTDgiLCJmaXJzdCI6NSwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjgsImxhc3QiOjEzLCJiYWNrbGlua3MiOlsiI3N5bWJvbC10ZXN0LTIwLXJvdW5kVHJpcCJdfSx7ImlkIjoic291cmNlLUwxMiIsImZpcnN0IjoxMCwibGFzdCI6MTMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxMy1MMTUiLCJmaXJzdCI6MTEsImxhc3QiOjEzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX1dfQ
// aug-spec: "compression.aug.md" explains this file. Read it before changes; refresh with aug spec.
import CompressionError and compress and decompress from "https://github.com/GreenPandaStudios/aug-zlib#v0.1.5"
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYTg5OTMyZGU5NmEyMTFlYWU4NDkxNzA5ODY5NGQwYTg1ODM2YjRkZWMxNmU2ZTYyODg5OWM2YjhhMzM5MThlMyIsImZvcm1hdHRlZFNoYTI1NiI6IjY3N2M5MjllZDBmMDA3ZmRiNjY4ZWQ2NzA2ZDVjNDI3YmM3MjliNzY5ZWQ4NWVhN2E3NDdjZGRmNjVkM2Q0NTAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtcm91bmRUcmlwIl19LHsiaWQiOiJzb3VyY2UtTDYtTDgiLCJmaXJzdCI6NSwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDEwIiwiZmlyc3QiOjksImxhc3QiOjE3LCJiYWNrbGlua3MiOlsiI3N5bWJvbC10ZXN0LTIwLXJvdW5kVHJpcCJdfSx7ImlkIjoic291cmNlLUwxMiIsImZpcnN0IjoxMSwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxMy1MMTUiLCJmaXJzdCI6MTIsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX1dfQ
// aug-spec: "compression.aug.md" explains this file. Read it before changes; refresh with aug spec.
import CompressionError and compress and decompress from "https://github.com/GreenPandaStudios/aug-zlib#v0.1.5"
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

### `roundTrip` · [source](compression.md#source-L5) {#symbol-roundTrip}

::: spec-paragraph specification-paragraph-1
Compress text with zlib, then restore its bytes within a fixed output limit. It sets `input` of type `Bytes` to the UTF-8 bytes of `"The world runs on language"`. It sets `compressed` of type `Bytes` to [`compress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api.md#symbol-compress) with `input`. It returns [`decompress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api.md#symbol-decompress) with `input` from `compressed` and `maximumOutput` `4096`. [source](compression.md#source-L6-L8)
:::

::: details Checked interface

```text
roundTrip() returns Bytes unless CompressionError
```

Failures can raise [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/contracts.md#symbol-CompressionError).

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

It uses [`compress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api.md#symbol-compress), [`decompress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api.md#symbol-decompress), and [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/contracts.md#symbol-CompressionError) from `https://github.com/GreenPandaStudios/aug-zlib#v0.1.5`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
