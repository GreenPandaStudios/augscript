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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Resource`](resource.md#symbol-Resource) is a class implementing `IResource`.
- [`IResource`](resource.md#symbol-IResource) is an interface.

### `Resource` {#symbol-Resource}

[source](resource.md#code)

Behavioral class.

Satisfies [`IResource`](resource.md#symbol-IResource).

#### `Resource.drop` {#symbol-Resource.drop}

[source](resource.md#code)

Returns: no value.

**What it does**

- Continue without another operation.

### `IResource` {#symbol-IResource}

[source](resource.md#code)

Interface.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
