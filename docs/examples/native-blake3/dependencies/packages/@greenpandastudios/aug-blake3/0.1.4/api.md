---
title: "packages/@greenpandastudios/aug-blake3/0.1.4/api.aug · Hashing with Rust BLAKE3"
generated: true
source: "examples/native-blake3/.aug-spec/packages/@greenpandastudios/aug-blake3/0.1.4/api.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-blake3/0.1.4/api.aug`

[Hashing with Rust BLAKE3](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import HashError from contracts
extern C _hash(Bytes input) returns string unless HashError
/** Return a lowercase 64-character BLAKE3 digest, computed by the Rust crate. */
hash(Bytes input) returns string:
    unsafe:
        return _hash(input)
test hash:
    when "vectors":
        it "hashes_abc":
            Bytes input = "abc".bytes()
            assert(
                hash(input) == "6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85"
            )
```

```aug [Braces]
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import HashError from contracts
extern C _hash(Bytes input) returns string unless HashError
/** Return a lowercase 64-character BLAKE3 digest, computed by the Rust crate. */
hash(Bytes input) returns string {
    unsafe {
        return _hash(input)
    }
}
test hash {
    when "vectors" {
        it "hashes_abc" {
            Bytes input = "abc".bytes()
            assert(
                hash(input) == "6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85"
            )
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `hash` · [source](api.md#code) {#symbol-hash}

Return a lowercase 64-character BLAKE3 digest, computed by the Rust crate. It takes `input` as `Bytes`. Failures can raise [`HashError`](contracts.md#symbol-HashError).

Within an unsafe block, it returns [`_hash`](api.md#symbol-_hash) with `input`. Native operations must satisfy their declared C contracts.

### `_hash` · [source](api.md#code) {#symbol-_hash}

It is private to its defining scope. It takes `input` as `Bytes`. It returns `string`. Failures can raise [`HashError`](contracts.md#symbol-HashError).

Native implementation: `@greenpandastudios/aug-blake3@0.1.4`, `1.8.7`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `3bf8dea97cde70a03021bf77ea08314d6d37fe7b4935ff16030b2ab929c21279`). It calls `aug_blake3_hash_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. August copies the returned buffer, then calls `aug_blake3_text_release_v1` to release it. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `test hash` · [source](api.md#code) {#symbol-test-20-hash}

Tests [`hash`](api.md#symbol-hash). Each case gets fresh setup and dependencies.

#### `vectors`

##### `hashes_abc` · [source](api.md#code)

It sets `input` of type `Bytes` to `bytes` on `"abc"`. The test requires [`hash`](api.md#symbol-hash) with `input` equals `"6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85"`.

### Dependencies

It uses [`HashError`](contracts.md#symbol-HashError) from `contracts`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
