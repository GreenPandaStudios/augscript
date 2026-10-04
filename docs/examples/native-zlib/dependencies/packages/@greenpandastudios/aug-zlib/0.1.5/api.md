---
title: "packages/@greenpandastudios/aug-zlib/0.1.5/api.aug · Compression with zlib"
generated: true
source: "examples/native-zlib/.aug-spec/packages/@greenpandastudios/aug-zlib/0.1.5/api.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-zlib/0.1.5/api.aug`

[Compression with zlib](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import CompressionError from contracts
extern C _compress(Bytes input) returns Bytes unless CompressionError
extern C _decompress(Bytes input, int maximumOutput) returns Bytes unless CompressionError
/** Compress bytes with the standard zlib framing. */
compress(Bytes input) returns Bytes:
    unsafe:
        return _compress(input)
/** Decompress at most maximumOutput bytes (maximum 256 MiB). */
decompress(Bytes input, int maximumOutput) returns Bytes:
    unsafe:
        return _decompress(input, maximumOutput)
test compress:
    when "compression":
        it "preserves_bytes":
            Bytes input = "The world runs on language".bytes()
            Bytes packed = compress(input)
            Bytes restored = decompress(input=packed, maximumOutput=4096)
            assert(restored.text() == "The world runs on language")
        it "checks_output_limit":
            Bytes packed = compress(input="length limit".bytes())
            bool rejected = false
            try:
                decompress(input=packed, maximumOutput=1)
            catch CompressionError error:
                rejected = true
            assert(rejected)
```

```aug [Braces]
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import CompressionError from contracts
extern C _compress(Bytes input) returns Bytes unless CompressionError
extern C _decompress(Bytes input, int maximumOutput) returns Bytes unless CompressionError
/** Compress bytes with the standard zlib framing. */
compress(Bytes input) returns Bytes {
    unsafe {
        return _compress(input)
    }
}
/** Decompress at most maximumOutput bytes (maximum 256 MiB). */
decompress(Bytes input, int maximumOutput) returns Bytes {
    unsafe {
        return _decompress(input, maximumOutput)
    }
}
test compress {
    when "compression" {
        it "preserves_bytes" {
            Bytes input = "The world runs on language".bytes()
            Bytes packed = compress(input)
            Bytes restored = decompress(input=packed, maximumOutput=4096)
            assert(restored.text() == "The world runs on language")
        }
        it "checks_output_limit" {
            Bytes packed = compress(input="length limit".bytes())
            bool rejected = false
            try {
                decompress(input=packed, maximumOutput=1)
            }
            catch CompressionError error {
                rejected = true
            }
            assert(rejected)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `compress` · [source](api.md#code) {#symbol-compress}

Compress bytes with the standard zlib framing. It takes `input` as `Bytes`. Within an unsafe block, it returns [`_compress`](api.md#symbol-_compress) with `input`. Native operations must satisfy their declared C contracts. [source](api.md#code)

::: details Checked interface

```text
compress(Bytes input) returns Bytes unless CompressionError
```

It takes `input` as `Bytes`. Failures can raise [`CompressionError`](contracts.md#symbol-CompressionError).

:::

### `decompress` · [source](api.md#code) {#symbol-decompress}

Decompress at most maximumOutput bytes (maximum 256 MiB). It takes `input` as `Bytes` and `maximumOutput` as an integer. Within an unsafe block, it returns [`_decompress`](api.md#symbol-_decompress) with `input` and `maximumOutput`. Native operations must satisfy their declared C contracts. [source](api.md#code)

::: details Checked interface

```text
decompress(Bytes input, int maximumOutput) returns Bytes unless CompressionError
```

It takes `input` as `Bytes` and `maximumOutput` as an integer. Failures can raise [`CompressionError`](contracts.md#symbol-CompressionError).

:::

### `_compress` · [source](api.md#code) {#symbol-_compress}

It is private to its defining scope. It takes `input` as `Bytes`. It returns `Bytes`. Failures can raise [`CompressionError`](contracts.md#symbol-CompressionError).

Native implementation: `@greenpandastudios/aug-zlib@0.1.5`, `1.3.2`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `c3d4b36eadcccd13caff71597ed77a8e7307f0cfe3d13660a8e9127efe942b3d`). It calls `aug_zlib_compress_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. August copies the returned buffer, then calls `aug_zlib_release_v1` to release it. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_decompress` · [source](api.md#code) {#symbol-_decompress}

It is private to its defining scope. It takes `input` as `Bytes` and `maximumOutput` as an integer. It returns `Bytes`. Failures can raise [`CompressionError`](contracts.md#symbol-CompressionError).

Native implementation: `@greenpandastudios/aug-zlib@0.1.5`, `1.3.2`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `c3d4b36eadcccd13caff71597ed77a8e7307f0cfe3d13660a8e9127efe942b3d`). It calls `aug_zlib_decompress_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. August copies the returned buffer, then calls `aug_zlib_release_v1` to release it. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `test compress` · [source](api.md#code) {#symbol-test-20-compress}

Tests [`compress`](api.md#symbol-compress). Each case gets fresh setup and dependencies.

#### `compression`

##### `preserves_bytes` · [source](api.md#code)

It sets `input` of type `Bytes` to `bytes` on `"The world runs on language"`. It sets `packed` of type `Bytes` to [`compress`](api.md#symbol-compress) with `input`. It sets `restored` of type `Bytes` to [`decompress`](api.md#symbol-decompress) with `input` from `packed` and `maximumOutput` `4096`. The test requires `restored.text` equals `"The world runs on language"`. [source](api.md#code)

##### `checks_output_limit` · [source](api.md#code)

It sets `packed` of type `Bytes` to [`compress`](api.md#symbol-compress) with `input` from `bytes` on `"length limit"`. It sets `rejected` to `false`. [source](api.md#code)

It tries to call [`decompress`](api.md#symbol-decompress) with `input` from `packed` and `maximumOutput` `1`. If this work raises [`CompressionError`](contracts.md#symbol-CompressionError), it sets `rejected` to `true`. The test requires `rejected` is true. [source](api.md#code)

### Dependencies

It uses [`CompressionError`](contracts.md#symbol-CompressionError) from `contracts`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
