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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Run startup operations with checked error recovery.

### Startup, in source order

- Try these operations:
  - Set `numbers` to a list of `int` containing `2`, `4`.
  - Grant exclusive mutable access to `numbers` for this block, then end the borrow:
    - Call `append` on `numbers` with `value` = `6`.
  - Call `print` with `value` = call `length` on `numbers`.
  - Call `print` with `value` = call `get` on `numbers` with `index` = `1`.
  - Set `scores` to an empty map from `string` to `int`.
  - Grant exclusive mutable access to `scores` for this block, then end the borrow:
    - Call `set` on `scores` with `value` = `42`; `key` = `"ada"`.
  - Call `print` with `value` = call `contains` on `scores` with `key` = `"ada"`.
  - Call `print` with `value` = call `get` on `scores` with `key` = `"ada"`.
  - Call `print` with `value` = call `length` on `scores`.
- If they fail with `IndexError`, name the failure `error` and recover:
  - Call `print` with `value` = `"unexpected index failure"`.

### Built-in operations used by this file

- `List<int>.append` (`value`: `int`) → `void`: Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here. Changes the receiver.
- `List<int>.get` (`index`: `int`) → `int`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. Can fail with `IndexError`.
- `List<int>.length` (no inputs) → `int`: Read the number of elements.
- `Map<string, int>.contains` (`key`: `string`) → `bool`: Check for a key, including entries whose value is null.
- `Map<string, int>.get` (`key`: `string`) → `optional int`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.
- `Map<string, int>.length` (no inputs) → `int`: Read the number of elements.
- `Map<string, int>.set` (`key`: `string`, `value`: `int`) → `void`: Insert or replace an entry with exclusive mutable access. Changes the receiver.
- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
