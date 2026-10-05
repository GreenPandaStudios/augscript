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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMzU4MjRkZTZlNjcwZTI0Yzk1YTBiNjBmZTVkNjEyOTM4ZTQ2Y2ZiYzFiZjZlMjJkMjc2MDhjNzI2YTBmYjBiOSIsImZvcm1hdHRlZFNoYTI1NiI6ImYxMGI2ZDJjNjM3ZWVjMDUyN2MwNzhiMmEzM2RlODllNGM0YTBiYzRlMWU4NzlhNmYzZGIwYjJlYmE3YjhkM2MiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSXRlbSJdfV19
// aug-spec: "data.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Item(int id, string name)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMzU4MjRkZTZlNjcwZTI0Yzk1YTBiNjBmZTVkNjEyOTM4ZTQ2Y2ZiYzFiZjZlMjJkMjc2MDhjNzI2YTBmYjBiOSIsImZvcm1hdHRlZFNoYTI1NiI6ImYxMGI2ZDJjNjM3ZWVjMDUyN2MwNzhiMmEzM2RlODllNGM0YTBiYzRlMWU4NzlhNmYzZGIwYjJlYmE3YjhkM2MiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSXRlbSJdfV19
// aug-spec: "data.aug.md" explains this file. Read it before changes; refresh with aug spec.
record Item(int id, string name)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Item` · immutable record · [source](data.md#source-L2) {#symbol-Item}

It takes `id` as an integer, kept read-only and `name` as a string, kept read-only.

::::

:::::
