---
title: "main.aug · Map deletion benchmark"
generated: true
source: "benchmarks/map-churn/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Map deletion benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 4000
own Map<int,int> entries = {}
int index = 0
while index < iterations:
    entries.set(key=index, value=index * 3)
    index = index + 1
index = 0
while index < iterations:
    entries.take(key=index)
    index = index + 2
index = 0
while index < iterations:
    entries.set(key=index, value=index * 7)
    index = index + 1
int checksum = 0
int position = 1
for (key, value) in entries:
    checksum = checksum + key * position + value
    position = position + 1
print(value=checksum)
print(value=entries.length())
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 4000
own Map<int,int> entries = {}
int index = 0
while index < iterations {
    entries.set(key=index, value=index * 3)
    index = index + 1
}
index = 0
while index < iterations {
    entries.take(key=index)
    index = index + 2
}
index = 0
while index < iterations {
    entries.set(key=index, value=index * 7)
    index = index + 1
}
int checksum = 0
int position = 1
for (key, value) in entries {
    checksum = checksum + key * position + value
    position = position + 1
}
print(value=checksum)
print(value=entries.length())
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `iterations` to `4000`. It stores a context-typed empty collection with no items in owned `entries` (`Map<int,int>`). It sets `index` to `0`. While `index` is less than `iterations`, it stores `index` times `3` in `entries` under `index`; then it increases `index` by `1`. [source](main.md#code)

After the loop, it sets `index` to `0`. While `index` is less than `iterations`, it removes the key `index` from `entries`; then it increases `index` by `2`. After the loop, it sets `index` to `0`. While `index` is less than `iterations`, it stores `index` times `7` in `entries` under `index`; then it increases `index` by `1`. [source](main.md#code)

After the loop, it sets `checksum` to `0`. It sets `position` to `1`. For each `key` and `value` in a snapshot of `entries`, it sets `checksum` to (`checksum` plus (`key` times `position`)) plus `value`; then it increases `position` by `1`. After the loop, it prints `checksum`. [source](main.md#code)

It prints the number of elements in `entries`. [source](main.md#code)

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
