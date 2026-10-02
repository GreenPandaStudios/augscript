---
title: "hashing.aug · Hashing with Rust BLAKE3"
generated: true
source: "examples/native-blake3/hashing.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `hashing.aug`

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
// aug-spec: "hashing.aug.md" explains this file. Read it before changes; refresh with aug spec.
import HashError and hash from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.4"
/** Hash UTF-8 text with the real Rust BLAKE3 implementation. */
hashText(string value) returns string unless HashError:
    return hash(input=value.bytes())
test hashText:
    when "vectors":
        it "matches_the_published_abc_vector":
            assert(
                hashText(value="abc") == "6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85"
            )
```

```aug [Braces]
// aug-spec: "hashing.aug.md" explains this file. Read it before changes; refresh with aug spec.
import HashError and hash from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.4"
/** Hash UTF-8 text with the real Rust BLAKE3 implementation. */
hashText(string value) returns string unless HashError {
    return hash(input=value.bytes())
}
test hashText {
    when "vectors" {
        it "matches_the_published_abc_vector" {
            assert(
                hashText(value="abc") == "6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85"
            )
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `hashText` · [source](hashing.md#code) {#symbol-hashText}

Hash UTF-8 text with the real Rust BLAKE3 implementation. It takes `value` as a string. Failures can raise [`HashError`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.4/contracts.md#symbol-HashError). It returns [`hash`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.4/api.md#symbol-hash) with `input` from the UTF-8 bytes of `value`.

### `test hashText` · [source](hashing.md#code) {#symbol-test-20-hashText}

Tests [`hashText`](hashing.md#symbol-hashText). Each case gets fresh setup and dependencies.

#### `vectors`

##### `matches_the_published_abc_vector` · [source](hashing.md#code)

The test requires [`hashText`](hashing.md#symbol-hashText) with `value` `"abc"` equals `"6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85"`.

### Dependencies

It uses [`hash`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.4/api.md#symbol-hash) and [`HashError`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.4/contracts.md#symbol-HashError) from `https://github.com/GreenPandaStudios/aug-blake3#v0.1.4`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
