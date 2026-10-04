---
title: "main.aug · A finite benchmark"
generated: true
source: "examples/benchmark/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[A finite benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It stores a context-typed empty collection with no items in owned `values` (`Map<int,int>`). It stores a context-typed empty collection with no items in owned `unique` (`Set<int>`). It sets `index` to `0`. While `index` is less than `20000`, it stores `index` times `3` in `values` under `index`; then it adds `index` to `unique`; then it increases `index` by `1`.

After the loop, it sets `checksum` to `0`. For each `key` and `value` in a snapshot of `values`, if whether `unique` contains `key` returns true, it increases `checksum` by `value`. After the loop, it prints `checksum`. It prints the number of elements in `values` equals the number of elements in `unique`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
