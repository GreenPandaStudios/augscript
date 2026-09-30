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

### `Resource` · class · [source](resource.md#code) {#symbol-Resource}

It implements [`IResource`](resource.md#symbol-IResource).

#### `Resource.drop` · [source](resource.md#code) {#symbol-Resource.drop}

It continues without an operation.

### `IResource` · interface · [source](resource.md#code) {#symbol-IResource}

### `make` · [source](resource.md#code) {#symbol-make}

It returns ownership of [`Resource`](resource.md#symbol-Resource). It sets `value` of type [`Resource`](resource.md#symbol-Resource) to a [`Resource`](resource.md#symbol-Resource). `value` of type [`Resource`](resource.md#symbol-Resource) owns this value. It returns `value`.

### `consume` · [source](resource.md#code) {#symbol-consume}

It takes `value` as [`Resource`](resource.md#symbol-Resource) with ownership transferred. It gets `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) from dependency injection. It passes `"consumed"` to [`console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)) from `august.io`. These links explain the full dependency contracts.

::::

:::::
