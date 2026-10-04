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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiODVlOWUxZTI0MjllYzU2NWU3Y2M1ZDhkY2YxMTA1Y2JkMTRiOTYwNTk3MjQ1NGEwYzhkODliNDVlMzJlNjUzMyIsImZvcm1hdHRlZFNoYTI1NiI6ImFiYWRmNGNlYWY1ODFkMGRkNGZlOGQwZDUxNjcwYTkxMTE0ZTIzNTMzYWNjMmJiY2QyN2Y3NzRmMDk0YmE0YTAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtaGFzaFRleHQiXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo1LCJsYXN0Ijo1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0Ijo2LCJsYXN0IjoxMSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC1oYXNoVGV4dCJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0Ijo4LCJsYXN0IjoxMSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDExIiwiZmlyc3QiOjksImxhc3QiOjExLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX1dfQ
// aug-spec: "hashing.aug.md" explains this file. Read it before changes; refresh with aug spec.
import HashError and hash from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.5"
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiODVlOWUxZTI0MjllYzU2NWU3Y2M1ZDhkY2YxMTA1Y2JkMTRiOTYwNTk3MjQ1NGEwYzhkODliNDVlMzJlNjUzMyIsImZvcm1hdHRlZFNoYTI1NiI6Ijg1YjY4Nzk1OGE0ZTliZDM1ZjkyYmVjMTBiMzE2YzI3YzBiOWEzYTc1NDVlNThkOWI5ZDJkMTEyM2QzMjQ4NjkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6NiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtaGFzaFRleHQiXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo1LCJsYXN0Ijo1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0Ijo3LCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC1oYXNoVGV4dCJdfSx7ImlkIjoic291cmNlLUwxMCIsImZpcnN0Ijo5LCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDExIiwiZmlyc3QiOjEwLCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19XX0
// aug-spec: "hashing.aug.md" explains this file. Read it before changes; refresh with aug spec.
import HashError and hash from "https://github.com/GreenPandaStudios/aug-blake3#v0.1.5"
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

### `hashText` · [source](hashing.md#source-L5) {#symbol-hashText}

::: spec-paragraph specification-paragraph-1
Hash UTF-8 text with the real Rust BLAKE3 implementation. It takes `value` as a string. It returns [`hash`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.5/api.md#symbol-hash) with `input` from the UTF-8 bytes of `value`. [source](hashing.md#source-L6)
:::

::: details Checked interface

```text
hashText(string value) returns string unless HashError
```

It takes `value` as a string. Failures can raise [`HashError`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.5/contracts.md#symbol-HashError).

:::

### `test hashText` · [source](hashing.md#source-L8) {#symbol-test-20-hashText}

Tests [`hashText`](hashing.md#symbol-hashText). Each case gets fresh setup and dependencies.

#### `vectors`

::: spec-paragraph specification-paragraph-2
##### `matches_the_published_abc_vector` · [source](hashing.md#source-L10)
:::

::: spec-paragraph specification-paragraph-3
The test requires [`hashText`](hashing.md#symbol-hashText) with `value` `"abc"` equals `"6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85"`. [source](hashing.md#source-L11)
:::

### Dependencies

It uses [`hash`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.5/api.md#symbol-hash) and [`HashError`](dependencies/packages/%40greenpandastudios/aug-blake3/0.1.5/contracts.md#symbol-HashError) from `https://github.com/GreenPandaStudios/aug-blake3#v0.1.5`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
