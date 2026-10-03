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

```aug [Indentation]
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

```aug [Braces]
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

### `roundTrip` · [source](compression.md#code) {#symbol-roundTrip}

Compress text with zlib, then restore its bytes within a fixed output limit. Failures can raise [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/contracts.md#symbol-CompressionError).

It sets `input` of type `Bytes` to the UTF-8 bytes of `"The world runs on language"`. It sets `compressed` of type `Bytes` to [`compress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api.md#symbol-compress) with `input`. It returns [`decompress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api.md#symbol-decompress) with `input` from `compressed` and `maximumOutput` `4096`.

### `test roundTrip` · [source](compression.md#code) {#symbol-test-20-roundTrip}

Tests [`roundTrip`](compression.md#symbol-roundTrip). Each case gets fresh setup and dependencies.

#### `compression`

##### `preserves_the_original_bytes` · [source](compression.md#code)

It gets `restored` of type `Bytes` from [`roundTrip`](compression.md#symbol-roundTrip). The test requires `restored.text` equals `"The world runs on language"`. The test requires the byte length of `restored` equals `26`.

### Dependencies

It uses [`compress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api.md#symbol-compress), [`decompress`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/api.md#symbol-decompress), and [`CompressionError`](dependencies/packages/%40greenpandastudios/aug-zlib/0.1.5/contracts.md#symbol-CompressionError) from `https://github.com/GreenPandaStudios/aug-zlib#v0.1.5`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
