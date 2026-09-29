---
title: "resource.aug · Move ownership"
generated: true
source: "examples/ownership-transfer/resource.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `resource.aug`

[Move ownership](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Available from `august.io`.

Interface. Follow the linked specification for its full explanation.

**[`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)**

Type parameters: `T`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

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

### `make` {#symbol-make}

[source](resource.md#code)

Result: transfer ownership of [`Resource`](resource.md#symbol-Resource).

**Behavior when execution reaches this operation**

- Set `value` of type [`Resource`](resource.md#symbol-Resource) to the result of call [`Resource`](resource.md#symbol-Resource). This variable owns the value.
- Return `value` and finish this operation.

### `consume` {#symbol-consume}

[source](resource.md#code)

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `value`: [`Resource`](resource.md#symbol-Resource). The caller supplies this labeled input. Move ownership into this operation.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**Behavior when execution reaches this operation**

- Call [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` set to `"consumed"`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
