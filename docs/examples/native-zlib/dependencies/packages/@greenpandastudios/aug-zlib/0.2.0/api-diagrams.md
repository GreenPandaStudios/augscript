---
title: "package/@greenpandastudios/aug-zlib@0.2.0/api.aug diagrams"
generated: true
source: "examples/native-zlib/.aug-spec/packages/@greenpandastudios/aug-zlib/0.2.0/api.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@greenpandastudios/aug-zlib@0.2.0/api.aug diagrams

[Compression with zlib](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](api.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_compress {#sequence-_compress}

::: spec-paragraph specification-paragraph-1
[Source](api.md#source-L4)
:::

It is private to its defining scope.

It takes `input` as `Bytes`.

It returns `Bytes`. Failures can raise [`CompressionError`](contracts.md#symbol-CompressionError).

Native implementation: `@greenpandastudios/aug-zlib@0.2.0`, `1.3.2`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `c3d4b36eadcccd13caff71597ed77a8e7307f0cfe3d13660a8e9127efe942b3d`). It calls `aug_zlib_compress_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. August copies the returned buffer, then calls `aug_zlib_release_v1` to release it. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

May leave with checked errors: CompressionError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_decompress {#sequence-_decompress}

::: spec-paragraph specification-paragraph-2
[Source](api.md#source-L5)
:::

It is private to its defining scope.

It takes `input` as `Bytes` and `maximumOutput` as an integer.

It returns `Bytes`. Failures can raise [`CompressionError`](contracts.md#symbol-CompressionError).

Native implementation: `@greenpandastudios/aug-zlib@0.2.0`, `1.3.2`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `c3d4b36eadcccd13caff71597ed77a8e7307f0cfe3d13660a8e9127efe942b3d`). It calls `aug_zlib_decompress_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. August copies the returned buffer, then calls `aug_zlib_release_v1` to release it. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

May leave with checked errors: CompressionError. Native implementation; only the declared contract is known. [Explanation](api.md).

### compress {#sequence-compress}

::: spec-paragraph specification-paragraph-3
[Source](api.md#source-L7)
:::

Compress bytes with the standard zlib framing.

It takes `input` as `Bytes`.

Failures can raise [`CompressionError`](contracts.md#symbol-CompressionError).

```mermaid
sequenceDiagram
    participant p0 as compress

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _compress(input=input) · native boundary
    p0-->>p0: _compress result: Bytes
    Note over p0: Return _compress(input)； required cleanup runs before<br/>exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: CompressionError
```

### decompress {#sequence-decompress}

::: spec-paragraph specification-paragraph-4
[Source](api.md#source-L11)
:::

Decompress at most maximumOutput bytes (maximum 256 MiB).

It takes `input` as `Bytes` and `maximumOutput` as an integer.

Failures can raise [`CompressionError`](contracts.md#symbol-CompressionError).

```mermaid
sequenceDiagram
    participant p0 as decompress

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _decompress(input=input, maximumOutput=maximumOutput) ·<br/>native boundary
    p0-->>p0: _decompress result: Bytes
    Note over p0: Return _decompress(input, maximumOutput)； required<br/>cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: CompressionError
```

## Called contracts

- [\_compress](api-diagrams.md#sequence-_compress) — package/@greenpandastudios/aug-zlib@0.2.0/api.aug
- [\_decompress](api-diagrams.md#sequence-_decompress) — package/@greenpandastudios/aug-zlib@0.2.0/api.aug
