---
title: "resource.aug · Resource cleanup"
generated: true
source: "examples/drop/resource.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `resource.aug`

[Resource cleanup](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)

:::

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `Resource` {#symbol-Resource}

[source](resource.md#code)

Behavioral class.

Satisfies [`IResource`](resource.md#symbol-IResource).

#### `Resource.drop` {#symbol-Resource.drop}

[source](resource.md#code)

Result: finish without a result.

**Behavior when execution reaches this operation**

- Continue without another operation.

### `IResource` {#symbol-IResource}

[source](resource.md#code)

Interface.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
