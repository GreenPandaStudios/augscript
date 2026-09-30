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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

It sets `values` of type `Map<int,int>` to a context-typed empty collection with no items. `values` of type `Map<int,int>` owns this value. It sets `unique` of type `Set<int>` to a context-typed empty collection with no items. `unique` of type `Set<int>` owns this value. It sets `index` of type `int` to `0`.

While `index` is less than `20000`, it calls `set` on `values` (`key` set to `index` and `value` set to `index` times `3`); then it calls `add` on `unique` (`value` set to `index`); then it increases `index` by `1`. It sets `checksum` of type `int` to `0`.

For each `key` and `value` in a snapshot of `values`, it follows these steps. If the value from `contains` on `unique` (`value` set to `key`) is true, it increases `checksum` by `value`.

Repeat these steps for each remaining item in the snapshot. It calls `print` (`value` set to `checksum`). It calls `print` (`value` set to the number of elements in `values` equals the number of elements in `unique`).

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`Map<int, int>.length`: Read the number of elements. `Map<int, int>.set`: Insert or replace an entry with exclusive mutable access. `Set<int>.add`: Insert a unique element with exclusive mutable access. `Set<int>.contains`: Test structural or identity equality with a stored element. `Set<int>.length`: Read the number of elements. `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
