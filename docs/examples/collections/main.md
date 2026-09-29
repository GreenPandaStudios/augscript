---
title: "main.aug · Lists, tuples, sets, and maps"
generated: true
source: "examples/collections/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[Lists, tuples, sets, and maps](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
try:
    numbers = List<int>(2, 4)
    borrow numbers:
        numbers.append(value=6)
    print(value=numbers.length())
    print(value=numbers.get(index=1))
    scores = Map<string, int>()
    borrow scores:
        scores.set(value=42, key="ada")
    print(value=scores.contains(key="ada"))
    print(value=scores.get(key="ada"))
    print(value=scores.length())
catch IndexError error:
    print(value="unexpected index failure")
```

```aug [Braces]
try {
    numbers = List<int>(2, 4)
    borrow numbers {
        numbers.append(value=6)
    }
    print(value=numbers.length())
    print(value=numbers.get(index=1))
    scores = Map<string, int>()
    borrow scores {
        scores.set(value=42, key="ada")
    }
    print(value=scores.contains(key="ada"))
    print(value=scores.get(key="ada"))
    print(value=scores.length())
}
catch IndexError error {
    print(value="unexpected index failure")
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Built-in operations used by this file

#### `List<int>.append`

Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here.

Inputs: `value`: `int`.

Result: `void`.

Changes the receiver under exclusive mutable access.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `List<int>.get`

Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.

Inputs: `index`: `int`.

Result: `int`.

Possible failures: `IndexError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `List<int>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<string, int>.contains`

Check for a key, including entries whose value is null.

Inputs: `key`: `string`.

Result: `bool`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<string, int>.get`

Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.

Inputs: `key`: `string`.

Result: `optional int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<string, int>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<string, int>.set`

Insert or replace an entry with exclusive mutable access.

Inputs: `key`: `string`; `value`: `int`.

Result: `void`.

Changes the receiver under exclusive mutable access.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Startup, in source order

- Try these operations:
  - Set `numbers` to the result of call `List` with type arguments `int` with `2`; `4`.
  - Grant exclusive mutable access to `numbers` for this block, then end the borrow:
    - Call `append` on `numbers` with `value` set to `6`.
  - Call `print` with `value` set to the result of call `length` on `numbers`.
  - Call `print` with `value` set to the result of call `get` on `numbers` with `index` set to `1`.
  - Set `scores` to the result of call `Map` with type arguments `string`, `int`.
  - Grant exclusive mutable access to `scores` for this block, then end the borrow:
    - Call `set` on `scores` with `value` set to `42`; `key` set to `"ada"`.
  - Call `print` with `value` set to the result of call `contains` on `scores` with `key` set to `"ada"`.
  - Call `print` with `value` set to the result of call `get` on `scores` with `key` set to `"ada"`.
  - Call `print` with `value` set to the result of call `length` on `scores`.
- If they fail with `IndexError`, name the failure `error` and recover:
  - Call `print` with `value` set to `"unexpected index failure"`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
