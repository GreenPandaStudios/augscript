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

Type parameters: `T`.

**Inputs:** Take `value` (`T`).

Returns `string`.

<a id="symbol-Formatter.title"></a>
#### `Formatter.title` · [source](types.md#code)

Returns `string`.

- Return `"formatted"`.

<a id="symbol-TextFormatter"></a>
### `TextFormatter` · class · [source](types.md#code)

Implements [`Formatter`](types.md#symbol-Formatter).

Inherited defaults:

- [`Formatter.title`](types.md#symbol-Formatter.title).

<a id="symbol-TextFormatter.format"></a>
#### `TextFormatter.format` · [source](types.md#code)

Type parameters: `T`.

**Inputs:** Take `value` (`T`).

Returns `string`.

- Return `"generic method called"`.

<a id="symbol-Box"></a>
### `Box` · class · [source](types.md#code)

Implements [`IBox`](types.md#symbol-IBox). Type parameters: `T`.

**Inputs:** Take `value` (`T`); store read-only.

<a id="symbol-Box.get"></a>
#### `Box.get` · [source](types.md#code)

Returns `T`.

- Return `value`.

<a id="symbol-IBox"></a>
### `IBox` · interface · [source](types.md#code)

Type parameters: `T`.

<a id="symbol-IBox.get"></a>
#### `IBox.get` · [source](types.md#code)

Returns `T`.

::::

:::::
