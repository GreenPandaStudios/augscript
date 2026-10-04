---
title: "src/export.aug · Create a package"
generated: true
source: "examples/packages/math/src/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `src/export.aug`

[Create a package](../index.md) · Source and specification

::: details Files in this project

- [`src/arithmetic.aug`](arithmetic.md)
- [`src/export.aug`](export.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export add from arithmetic
```

```aug [Braces]
// aug-spec: "export.aug.md" explains this file. Read it before changes; refresh with aug spec.
export add from arithmetic
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Exports

Export the declaration `add` from [`arithmetic.aug`](arithmetic.md#symbol-add).

::::

:::::
