---
title: "domain/models.aug · Modules and composition"
generated: true
source: "examples/approved-design/domain/models.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `domain/models.aug`

[Modules and composition](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`counters.aug`](../counters.md)
- [`domain/app.aug`](app.md)
- [`domain/export.aug`](export.md)
- [`domain/models.aug`](models.md)
- [`domain/numbers.aug`](numbers.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "models.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Immutable fruit data, with public construction labels and structural equality. */
record Fruit(int code, string name)
```

```aug [Braces]
// aug-spec: "models.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Immutable fruit data, with public construction labels and structural equality. */
record Fruit(int code, string name)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Fruit` · immutable record · [source](models.md#code) {#symbol-Fruit}

Immutable fruit data, with public construction labels and structural equality. It takes `code` as an integer, kept read-only and `name` as a string, kept read-only.

::::

:::::
