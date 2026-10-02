---
title: "main.aug · List traversal benchmark"
generated: true
source: "benchmarks/list/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[List traversal benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 100000
own List<int> values = []
int index = 0
while index < iterations:
    values.append(value=index * 3)
    index = index + 1
int checksum = 0
for value in values:
    checksum = checksum + value
print(value=checksum)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 100000
own List<int> values = []
int index = 0
while index < iterations {
    values.append(value=index * 3)
    index = index + 1
}
int checksum = 0
for value in values {
    checksum = checksum + value
}
print(value=checksum)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `iterations` to `100000`. It stores a list with no items in owned `values` (`List<int>`). It sets `index` to `0`. While `index` is less than `iterations`, it appends `index` times `3` to `values`; then it increases `index` by `1`.

After the loop, it sets `checksum` to `0`. For each `value` in a snapshot of `values`, it increases `checksum` by `value`. After the loop, it prints `checksum`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
