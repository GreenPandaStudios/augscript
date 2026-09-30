---
title: "types.aug · Generic contracts"
generated: true
source: "examples/generics/types.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `types.aug`

[Generic contracts](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`types.aug`](types.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "types.aug.md" explains this file. Read it before changes; refresh with aug spec.
interface Formatter:
    format<T>(T value) returns string
    title() returns string:
        return "formatted"
TextFormatter() implements Formatter:
    format<T>(T value) returns string:
        return "generic method called"
Box<T>(T value) implements IBox<T>:
    get() returns T:
        return value
interface IBox<T>:
    get() returns T
```

```aug [Braces]
// aug-spec: "types.aug.md" explains this file. Read it before changes; refresh with aug spec.
interface Formatter {
    format<T>(T value) returns string
    title() returns string {
        return "formatted"
    }
}
TextFormatter() implements Formatter {
    format<T>(T value) returns string {
        return "generic method called"
    }
}
Box<T>(T value) implements IBox<T> {
    get() returns T {
        return value
    }
}
interface IBox<T> {
    get() returns T
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Formatter"></a>
### `Formatter` · interface · [source](types.md#code)

<a id="symbol-Formatter.format"></a>
#### `Formatter.format` · [source](types.md#code)

The type parameters are `T`. The caller supplies `value` as `T`. The result is `string`.

<a id="symbol-Formatter.title"></a>
#### `Formatter.title` · [source](types.md#code)

The result is `string`. It returns `"formatted"`.

<a id="symbol-TextFormatter"></a>
### `TextFormatter` · class · [source](types.md#code)

Implements [`Formatter`](types.md#symbol-Formatter). It inherits the default implementations of [`Formatter.title`](types.md#symbol-Formatter.title).

<a id="symbol-TextFormatter.format"></a>
#### `TextFormatter.format` · [source](types.md#code)

The type parameters are `T`. The caller supplies `value` as `T`. The result is `string`. It returns `"generic method called"`.

<a id="symbol-Box"></a>
### `Box` · class · [source](types.md#code)

Implements [`IBox<T>`](types.md#symbol-IBox). The type parameters are `T`. The caller supplies `value` as `T`, stored read-only.

<a id="symbol-Box.get"></a>
#### `Box.get` · [source](types.md#code)

The result is `T`. It returns `value`.

<a id="symbol-IBox"></a>
### `IBox` · interface · [source](types.md#code)

The type parameters are `T`.

<a id="symbol-IBox.get"></a>
#### `IBox.get` · [source](types.md#code)

The result is `T`.

::::

:::::
