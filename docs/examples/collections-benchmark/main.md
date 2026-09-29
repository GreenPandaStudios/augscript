---
title: "main.aug · Map and Set benchmark"
generated: true
source: "benchmarks/collections/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Map and Set benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

- Set `values` of type `Map<int,int>` to a context-typed empty collection with no items.
- `values` of type `Map<int,int>` owns this value.
- Set `unique` of type `Set<int>` to a context-typed empty collection with no items.
- `unique` of type `Set<int>` owns this value.
- Set `index` of type `int` to `0`.
- While `index` is less than `20000`:
  - Call `set` on `values` with `key` as `index`, `value` as `index` times `3`.
  - Call `add` on `unique` with `value` as `index`.
  - Set `index` to `index` plus `1`.
- Set `checksum` of type `int` to `0`.
- For each `key` and `value` in a snapshot of `values`:
  - If the result of `contains` on `unique` with `value` as `key` is true:
    - Set `checksum` to `checksum` plus `value`.
- Call `print` with `value` as `checksum`.
- Call `print` with `value` as the result of `length` on `values` equals the result of `length` on `unique`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Map<int, int>.length`: Read the number of elements.
- `Map<int, int>.set`: Insert or replace an entry with exclusive mutable access.
- `Set<int>.add`: Insert a unique element with exclusive mutable access.
- `Set<int>.contains`: Test structural or identity equality with a stored element.
- `Set<int>.length`: Read the number of elements.
- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
