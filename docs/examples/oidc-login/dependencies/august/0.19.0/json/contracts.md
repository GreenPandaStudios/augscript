---
title: "august/0.19.0/json/contracts.aug · OpenID Connect login application"
generated: true
source: "examples/oidc-login/.aug-spec/august/0.19.0/json/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `august/0.19.0/json/contracts.aug`

[OpenID Connect login application](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C value pure _aug_json_parse(string input) returns Json unless JsonError
/** Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError. */
parse(string input) returns Json unless JsonError:
    unsafe:
        return _aug_json_parse(input)
```

```aug [Braces]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

<a id="symbol-parse"></a>
### `parse` · [source](contracts.md#code)

Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError. The caller supplies `input` as `string`. The result is `Json`. It can fail with `JsonError`. Within an unsafe block, it returns the value from [`_aug_json_parse`](contracts.md#symbol-_aug_json_parse) (`input`).

Native operations must satisfy their declared C contracts.

<a id="symbol-_aug_json_parse"></a>
### `_aug_json_parse` · [source](contracts.md#code)

Private to its defining scope. The caller supplies `input` as `string`. The result is `Json`. It can fail with `JsonError`. Native C implementation; only its declared contract is visible here.

::::

:::::
