---
title: "package/@greenpandastudios/aug-blake3@0.2.0/api.aug diagrams"
generated: true
source: "examples/native-blake3/.aug-spec/packages/@greenpandastudios/aug-blake3/0.2.0/api.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@greenpandastudios/aug-blake3@0.2.0/api.aug diagrams

[Hashing with Rust BLAKE3](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](api.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_hash {#sequence-_hash}

::: spec-paragraph specification-paragraph-1
[Source](api.md#source-L4)
:::

It is private to its defining scope.

It takes `input` as `Bytes`.

It returns `string`. Failures can raise [`HashError`](contracts.md#symbol-HashError).

Native implementation: `@greenpandastudios/aug-blake3@0.2.0`, `1.8.7`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `3bf8dea97cde70a03021bf77ea08314d6d37fe7b4935ff16030b2ab929c21279`). It calls `aug_blake3_hash_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. August copies the returned buffer, then calls `aug_blake3_text_release_v1` to release it. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

May leave with checked errors: HashError. Native implementation; only the declared contract is known. [Explanation](api.md).

### hash {#sequence-hash}

::: spec-paragraph specification-paragraph-2
[Source](api.md#source-L6)
:::

Return a lowercase 64-character BLAKE3 digest, computed by the Rust crate.

It takes `input` as `Bytes`.

Failures can raise [`HashError`](contracts.md#symbol-HashError).

```mermaid
sequenceDiagram
    participant p0 as hash

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _hash(input=input) · native boundary
    p0-->>p0: _hash result: string
    Note over p0: Return _hash(input)； required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: HashError
```

## Called contracts

- [\_hash](api-diagrams.md#sequence-_hash) — package/@greenpandastudios/aug-blake3@0.2.0/api.aug
