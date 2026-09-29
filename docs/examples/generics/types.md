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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Formatter`](types.md#symbol-Formatter) is an interface.
- [`TextFormatter`](types.md#symbol-TextFormatter) is a class implementing `Formatter`.
- [`Box`](types.md#symbol-Box) is a class implementing `IBox<T>`.
- [`IBox`](types.md#symbol-IBox) is an interface.

### `Formatter` {#symbol-Formatter}

[source](types.md#code)

Interface.

#### `Formatter.format` {#symbol-Formatter.format}

[source](types.md#code)

Type parameters: `T`.

**Inputs**

- `value` (`T`) — required labeled input.

Returns: `string`.

Interface contract. A selected implementation supplies the behavior.

#### `Formatter.title` {#symbol-Formatter.title}

[source](types.md#code)

Returns: `string`.

**What it does**

- Return `"formatted"`.

### `TextFormatter` {#symbol-TextFormatter}

[source](types.md#code)

Behavioral class.

Satisfies [`Formatter`](types.md#symbol-Formatter).

**Inherited default behavior**

- [`Formatter.title`](types.md#symbol-Formatter.title).

#### `TextFormatter.format` {#symbol-TextFormatter.format}

[source](types.md#code)

Type parameters: `T`.

**Inputs**

- `value` (`T`) — required labeled input.

Returns: `string`.

**What it does**

- Return `"generic method called"`.

### `Box` {#symbol-Box}

[source](types.md#code)

Behavioral class.

Type parameters: `T`.

Satisfies [`IBox`](types.md#symbol-IBox).

**Inputs**

- `value` (`T`) — required labeled input — stored as `value` and read-only after initialization.

#### `Box.get` {#symbol-Box.get}

[source](types.md#code)

Returns: `T`.

**What it does**

- Return `value`.

### `IBox` {#symbol-IBox}

[source](types.md#code)

Interface.

Type parameters: `T`.

#### `IBox.get` {#symbol-IBox.get}

[source](types.md#code)

Returns: `T`.

Interface contract. A selected implementation supplies the behavior.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
