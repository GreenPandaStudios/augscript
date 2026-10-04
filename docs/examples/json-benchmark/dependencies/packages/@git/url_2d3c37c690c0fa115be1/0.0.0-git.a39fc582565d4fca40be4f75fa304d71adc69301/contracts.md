---
title: "packages/@git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug · JSON benchmark"
generated: true
source: "benchmarks/json/.aug-spec/packages/@git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug`

[JSON benchmark](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
extern C value pure _aug_json_parse(string input) returns Json unless JsonError
/** Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError. */
parse(string input) returns Json unless JsonError:
    unsafe:
        return _aug_json_parse(input)
```

```aug [Braces]
extern C value pure _aug_json_parse(string input) returns Json unless JsonError
/** Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError. */
parse(string input) returns Json unless JsonError {
    unsafe {
        return _aug_json_parse(input)
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `parse` · [source](contracts.md#code) {#symbol-parse}

Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError. It takes `input` as a string.

Within an unsafe block, it returns [`_aug_json_parse`](contracts.md#symbol-_aug_json_parse) with `input`. Native operations must satisfy their declared C contracts. [source](contracts.md#code)

::: details Checked interface

```text
parse(string input) returns Json unless JsonError
```

It takes `input` as a string. Failures can raise `JsonError`.

:::

### `_aug_json_parse` · [source](contracts.md#code) {#symbol-_aug_json_parse}

It is private to its defining scope. It takes `input` as a string. It returns `Json`. Failures can raise `JsonError`.

Native C implementation; only its declared contract is visible here.

::::

:::::
