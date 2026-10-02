---
title: "main.aug · Record allocation benchmark"
generated: true
source: "benchmarks/records/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Record allocation benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`data.aug`](data.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Item from data
int iterations = 50000
own List<Item> values = []
int index = 0
while index < iterations:
    values.append(value=Item(id=index, name="August"))
    index = index + 1
int checksum = 0
for item in values:
    checksum = checksum + item.id
print(value=checksum)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Item from data
int iterations = 50000
own List<Item> values = []
int index = 0
while index < iterations {
    values.append(value=Item(id=index, name="August"))
    index = index + 1
}
int checksum = 0
for item in values {
    checksum = checksum + item.id
}
print(value=checksum)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `iterations` to `50000`. It sets `values` of type `List<Item>` to a list with no items. `values` of type `List<Item>` owns this value. It sets `index` to `0`.

While `index` is less than `iterations`, it appends an [`Item`](data.md#symbol-Item) with `id` from `index` and `name` `"August"` to `values`; then it increases `index` by `1`. After the loop, it sets `checksum` to `0`. For each `item` in a snapshot of `values`, it increases `checksum` by `item.id`. After the loop, it prints `checksum`.

### Dependencies

It uses [`Item`](data.md#symbol-Item) (`id`) from `data`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
