---
title: "resource.aug · Move ownership"
generated: true
source: "examples/ownership-transfer/resource.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `resource.aug`

[Move ownership](index.md) · Source and specification

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
import Console from august.io
Resource() implements IResource:
    drop():
        pass
interface IResource:
    pass
make() returns own Resource:
    own Resource value = Resource()
    return value
consume(resolve Console console, own Resource value) uses Console.write:
    console.write(value="consumed")
```

```aug [Braces]
// aug-spec: "resource.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
Resource() implements IResource {
    drop() {
        pass
    }
}
interface IResource {
    pass
}
make() returns own Resource {
    own Resource value = Resource()
    return value
}
consume(resolve Console console, own Resource value) uses Console.write {
    console.write(value="consumed")
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

It continues without an operation.

<a id="symbol-IResource"></a>
### `IResource` · interface · [source](resource.md#code)

<a id="symbol-make"></a>
### `make` · [source](resource.md#code)

The result is ownership of [`Resource`](resource.md#symbol-Resource). It sets `value` of type [`Resource`](resource.md#symbol-Resource) to a new [`Resource`](resource.md#symbol-Resource). `value` of type [`Resource`](resource.md#symbol-Resource) owns this value. It returns `value`.

<a id="symbol-consume"></a>
### `consume` · [source](resource.md#code)

The caller supplies `value` as [`Resource`](resource.md#symbol-Resource) with ownership transferred. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It calls [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` (`value` set to `"consumed"`).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

::::

:::::
