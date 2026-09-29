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

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `parse` {#symbol-parse}

[source](contracts.md#code)

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Json`.

Possible failures: `JsonError`. The caller must catch or propagate them.

**Author documentation**

Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError.

**Behavior when execution reaches this operation**

- Enter an unsafe boundary. Native calls use their declared contracts; their foreign implementation is outside this specification:
  - Return the result of call [`_aug_json_parse`](contracts.md#symbol-_aug_json_parse) with `input` set to `input` and finish this operation.

### `_aug_json_parse` {#symbol-_aug_json_parse}

[source](contracts.md#code)

Private to its defining scope.

**Inputs and dependencies**

- `input`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: `Json`.

Possible failures: `JsonError`. The caller must catch or propagate them.

Native C operation. Use the declared inputs, result, effects, errors, and author documentation as its boundary contract.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
