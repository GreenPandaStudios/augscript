---
title: "types.aug · Generic types and functions"
generated: true
source: "examples/generics/types.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `types.aug`

[Generic types and functions](index.md) · Source and specification

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
    title():
        return "formatted"
TextFormatter() implements Formatter:
    format<T>(T value):
        return "generic method called"
Box<T>(T value) implements IBox<T>:
    get():
        return value
interface IBox<T>:
    get() returns T
```

```aug [Braces]
// aug-spec: "types.aug.md" explains this file. Read it before changes; refresh with aug spec.
interface Formatter {
    format<T>(T value) returns string
    title() {
        return "formatted"
    }
}
TextFormatter() implements Formatter {
    format<T>(T value) {
        return "generic method called"
    }
}
Box<T>(T value) implements IBox<T> {
    get() {
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

### `Formatter` · interface · [source](types.md#code) {#symbol-Formatter}

#### `Formatter.format` · [source](types.md#code) {#symbol-Formatter.format}

The type parameters are `T`. It takes `value` as `T`. It returns `string`.

#### `Formatter.title` · [source](types.md#code) {#symbol-Formatter.title}

It returns `"formatted"`. [source](types.md#code)

::: details Checked interface

```text
title() returns string
```

:::

### `TextFormatter` · class · [source](types.md#code) {#symbol-TextFormatter}

It implements [`Formatter`](types.md#symbol-Formatter). It inherits the default implementations of [`Formatter.title`](types.md#symbol-Formatter.title).

#### `TextFormatter.format` · [source](types.md#code) {#symbol-TextFormatter.format}

It takes `value` as `T`. It returns `"generic method called"`. [source](types.md#code)

::: details Checked interface

```text
format<T>(T value) returns string
```

The type parameters are `T`. It takes `value` as `T`.

:::

### `Box` · class · [source](types.md#code) {#symbol-Box}

It implements [`IBox<T>`](types.md#symbol-IBox). The type parameters are `T`. It takes `value` as `T`, kept read-only.

#### `Box.get` · [source](types.md#code) {#symbol-Box.get}

It returns `value`. [source](types.md#code)

::: details Checked interface

```text
get() returns T
```

:::

### `IBox` · interface · [source](types.md#code) {#symbol-IBox}

The type parameters are `T`.

#### `IBox.get` · [source](types.md#code) {#symbol-IBox.get}

It returns `T`.

::::

:::::
