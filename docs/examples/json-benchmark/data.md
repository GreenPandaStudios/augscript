---
title: "data.aug · JSON benchmark"
generated: true
source: "benchmarks/json/data.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `data.aug`

[JSON benchmark](index.md) · Source and specification

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
record Payload(int id, string message, List<int> values)
```

```aug [Braces]
// aug-spec: "data.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Payload(int id, string message, List<int> values)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Payload"></a>
### `Payload` · immutable record · [source](data.md#code)

The caller supplies `id` as `int`, stored read-only, `message` as `string`, stored read-only, and `values` as `List<int>`, stored read-only.

::::

:::::
