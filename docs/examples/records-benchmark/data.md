---
title: "data.aug · Record allocation benchmark"
generated: true
source: "benchmarks/records/data.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `data.aug`

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
// aug-spec: "data.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Item(int id, string name)
```

```aug [Braces]
// aug-spec: "data.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Item(int id, string name)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Item` · immutable record · [source](data.md#code) {#symbol-Item}

It takes `id` as an integer, kept read-only and `name` as a string, kept read-only.

::::

:::::
