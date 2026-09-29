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
Resource() implements IResource:
    drop():
        pass
interface IResource:
    pass
```

```aug [Braces]
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

<a id="symbol-Resource"></a>
### `Resource` · class · [source](resource.md#code)

Implements [`IResource`](resource.md#symbol-IResource).

<a id="symbol-Resource.drop"></a>
#### `Resource.drop` · [source](resource.md#code)

- Continue.

<a id="symbol-IResource"></a>
### `IResource` · interface · [source](resource.md#code)

::::

:::::
