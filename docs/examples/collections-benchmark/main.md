---
title: "main.aug · Map and Set benchmark"
generated: true
source: "benchmarks/collections/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[Map and Set benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
own Map<int,int> values = {}
own Set<int> unique = {}
int index = 0
while index < 20000:
    values.set(key=index, value=index * 3)
    unique.add(value=index)
    index = index + 1
int checksum = 0
for (key, value) in values:
    if unique.contains(value=key):
        checksum = checksum + value
print(value=checksum)
print(value=values.length() == unique.length())
```

```aug [Braces]
own Map<int,int> values = {}
own Set<int> unique = {}
int index = 0
while index < 20000 {
    values.set(key=index, value=index * 3)
    unique.add(value=index)
    index = index + 1
}
int checksum = 0
for (key, value) in values {
    if unique.contains(value=key) {
        checksum = checksum + value
    }
}
print(value=checksum)
print(value=values.length() == unique.length())
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Built-in operations used by this file

#### `Map<int, int>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<int, int>.set`

Insert or replace an entry with exclusive mutable access.

Inputs: `key`: `int`; `value`: `int`.

Result: `void`.

Changes the receiver under exclusive mutable access.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Set<int>.add`

Insert a unique element with exclusive mutable access.

Inputs: `value`: `int`.

Result: `void`.

Changes the receiver under exclusive mutable access.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Set<int>.contains`

Test structural or identity equality with a stored element.

Inputs: `value`: `int`.

Result: `bool`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Set<int>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Startup, in source order

- Set `values` of type `Map<int,int>` to a context-typed empty collection with no items. This variable owns the value.
- Set `unique` of type `Set<int>` to a context-typed empty collection with no items. This variable owns the value.
- Set `index` of type `int` to `0`.
- While (`index` is less than `20000`) is true, repeat:
  - Call `set` on `values` with `key` set to `index`; `value` set to (`index` times `3`).
  - Call `add` on `unique` with `value` set to `index`.
  - Set `index` to (`index` plus `1`).
  - Check the condition again before the next iteration.
- Set `checksum` of type `int` to `0`.
- For each `key` and `value` in a snapshot of `values`, in iteration order:
  - If the result of call `contains` on `unique` with `value` set to `key` is true:
    - Set `checksum` to (`checksum` plus `value`).
- Call `print` with `value` set to `checksum`.
- Call `print` with `value` set to (the result of call `length` on `values` equals the result of call `length` on `unique`).


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
