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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Resource`](resource.md#symbol-Resource) is a class implementing `IResource`.
- [`IResource`](resource.md#symbol-IResource) is an interface.
- [`make`](resource.md#symbol-make) is a function returning `Resource`.
- [`consume`](resource.md#symbol-consume) is a function.

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

### `make` {#symbol-make}

[source](resource.md#code)

Returns: ownership of [`Resource`](resource.md#symbol-Resource).

**What it does**

- Set `value` of type [`Resource`](resource.md#symbol-Resource) to call [`Resource`](resource.md#symbol-Resource).
- This variable owns the value.
- Return `value`.

### `consume` {#symbol-consume}

[source](resource.md#code)

**Inputs**

- `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.
- `value` ([`Resource`](resource.md#symbol-Resource)) — required labeled input — transfers ownership.

Returns: no value.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**What it does**

- Call [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` = `"consumed"`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Capability interface from `august.io`.

- [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
