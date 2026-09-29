---
title: "types.aug · Generic contracts"
generated: true
source: "examples/generics/types.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `types.aug`

[Generic contracts](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`types.aug`](types.md)

:::

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `Formatter` {#symbol-Formatter}

[source](types.md#code)

Interface.

#### `Formatter.format` {#symbol-Formatter.format}

[source](types.md#code)

Type parameters: `T`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Interface contract. A selected implementation supplies the behavior.

#### `Formatter.title` {#symbol-Formatter.title}

[source](types.md#code)

Result: `string`.

**Behavior when execution reaches this operation**

- Return `"formatted"` and finish this operation.

### `TextFormatter` {#symbol-TextFormatter}

[source](types.md#code)

Behavioral class.

Satisfies [`Formatter`](types.md#symbol-Formatter).

**Inherited default behavior**

- [`Formatter.title`](types.md#symbol-Formatter.title).

#### `TextFormatter.format` {#symbol-TextFormatter.format}

[source](types.md#code)

Type parameters: `T`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

**Behavior when execution reaches this operation**

- Return `"generic method called"` and finish this operation.

### `Box` {#symbol-Box}

[source](types.md#code)

Behavioral class.

Type parameters: `T`.

Satisfies [`IBox`](types.md#symbol-IBox).

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them. Store it as `value`. The field is read-only after initialization.

#### `Box.get` {#symbol-Box.get}

[source](types.md#code)

Result: `T`.

**Behavior when execution reaches this operation**

- Return `value` and finish this operation.

### `IBox` {#symbol-IBox}

[source](types.md#code)

Interface.

Type parameters: `T`.

#### `IBox.get` {#symbol-IBox.get}

[source](types.md#code)

Result: `T`.

Interface contract. A selected implementation supplies the behavior.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
