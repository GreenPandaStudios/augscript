---
title: "resource.aug · Resource cleanup"
generated: true
source: "examples/drop/resource.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `resource.aug`

[Resource cleanup](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "resource.aug.md" explains this file. Read it before changes; refresh with aug spec.
Resource() implements IResource:
    drop():
        pass
interface IResource:
    pass
```

```aug [Braces]
// aug-spec: "resource.aug.md" explains this file. Read it before changes; refresh with aug spec.
Resource() implements IResource {
    drop() {
        pass
    }
}
interface IResource {
    pass
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Resource` · class · [source](resource.md#code) {#symbol-Resource}

It implements [`IResource`](resource.md#symbol-IResource).

#### `Resource.drop` · [source](resource.md#code) {#symbol-Resource.drop}

It continues without an operation.

### `IResource` · interface · [source](resource.md#code) {#symbol-IResource}

::::

:::::
