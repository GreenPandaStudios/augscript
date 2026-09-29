---
title: "main.aug · A finite benchmark"
generated: true
source: "examples/benchmark/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[A finite benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
// A deterministic native workload: arithmetic and 20,000 hash entries.
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
// A deterministic native workload: arithmetic and 20,000 hash entries.
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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Run 8 other startup steps in source order.

### Startup, in source order

- Set `values` of type `Map<int,int>` to a context-typed empty collection with no items.
- This variable owns the value.
- Set `unique` of type `Set<int>` to a context-typed empty collection with no items.
- This variable owns the value.
- Set `index` of type `int` to `0`.
- While `index` is less than `20000`, repeat:
  - Call `set` on `values` with `key` = `index`; `value` = (`index` times `3`).
  - Call `add` on `unique` with `value` = `index`.
  - Set `index` to `index` plus `1`.
  - Check the condition again before the next iteration.
- Set `checksum` of type `int` to `0`.
- For each `key` and `value` in a snapshot of `values`, in iteration order:
  - If call `contains` on `unique` with `value` = `key` is true:
    - Set `checksum` to `checksum` plus `value`.
- Call `print` with `value` = `checksum`.
- Call `print` with `value` = (call `length` on `values` equals call `length` on `unique`).

### Built-in operations used by this file

- `Map<int, int>.length` (no inputs) → `int`: Read the number of elements.
- `Map<int, int>.set` (`key`: `int`, `value`: `int`) → `void`: Insert or replace an entry with exclusive mutable access. Changes the receiver.
- `Set<int>.add` (`value`: `int`) → `void`: Insert a unique element with exclusive mutable access. Changes the receiver.
- `Set<int>.contains` (`value`: `int`) → `bool`: Test structural or identity equality with a stored element.
- `Set<int>.length` (no inputs) → `int`: Read the number of elements.
- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
