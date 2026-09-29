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

<a id="symbol-parse"></a>
### `parse` · [source](contracts.md#code)

Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError.

**Inputs:** Take `input` (`string`).

Returns `Json`. Can fail with `JsonError`.

- Use native code with its declared contract:
  - Return the result of [`_aug_json_parse`](contracts.md#symbol-_aug_json_parse) with `input`.

<a id="symbol-_aug_json_parse"></a>
### `_aug_json_parse` · [source](contracts.md#code)

Private to its defining scope.

**Inputs:** Take `input` (`string`).

Returns `Json`. Can fail with `JsonError`.

Native C implementation; only its declared contract is visible here.

::::

:::::
