---
title: "august/0.19.0/json/contracts.aug · JSON benchmark"
generated: true
source: "benchmarks/json/.aug-spec/august/0.19.0/json/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
---

# `august/0.19.0/json/contracts.aug`

[JSON benchmark](../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`_aug_json_parse`](contracts.md#symbol-_aug_json_parse) is a function returning `Json`.
- [`parse`](contracts.md#symbol-parse) is a function returning `Json`.

### `parse` {#symbol-parse}

[source](contracts.md#code)

**Inputs**

- `input` (`string`) — required labeled input.

Returns: `Json`.

Can fail with `JsonError`. Callers must catch or propagate these errors.

**What it does**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return call [`_aug_json_parse`](contracts.md#symbol-_aug_json_parse) with `input` = `input`.

**Author documentation**

Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError.

### `_aug_json_parse` {#symbol-_aug_json_parse}

[source](contracts.md#code)

Private to its defining scope.

**Inputs**

- `input` (`string`) — required labeled input.

Returns: `Json`.

Can fail with `JsonError`. Callers must catch or propagate these errors.

Native C operation. Its declared inputs, result, effects, and errors are the visible contract. The C implementation is outside this specification.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
