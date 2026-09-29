---
title: "types.aug · Generic dependency injection"
generated: true
source: "examples/generic-di/types.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `types.aug`

[Generic dependency injection](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`types.aug`](types.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import Console from august.io
interface Repository<T>:
    get() returns T
NumberRepository() implements Repository<int>:
    get() returns int:
        return 7
Program(resolve Repository<int> repository) implements IProgram:
    start(resolve Console console) uses Console.write:
        console.write(value=repository.get())
interface IProgram:
    start(resolve Console console) uses Console.write
```

```aug [Braces]
import Console from august.io
interface Repository<T> {
    get() returns T
}
NumberRepository() implements Repository<int> {
    get() returns int {
        return 7
    }
}
Program(resolve Repository<int> repository) implements IProgram {
    start(resolve Console console) uses Console.write {
        console.write(value=repository.get())
    }
}
interface IProgram {
    start(resolve Console console) uses Console.write
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Repository`](types.md#symbol-Repository) is an interface.
- [`NumberRepository`](types.md#symbol-NumberRepository) is a class implementing `Repository<int>`.
- [`Program`](types.md#symbol-Program) is a class implementing `IProgram`.
- [`IProgram`](types.md#symbol-IProgram) is an interface.

### `Repository` {#symbol-Repository}

[source](types.md#code)

Interface.

Type parameters: `T`.

#### `Repository.get` {#symbol-Repository.get}

[source](types.md#code)

Returns: `T`.

Interface contract. A selected implementation supplies the behavior.

### `NumberRepository` {#symbol-NumberRepository}

[source](types.md#code)

Behavioral class.

Satisfies [`Repository`](types.md#symbol-Repository).

#### `NumberRepository.get` {#symbol-NumberRepository.get}

[source](types.md#code)

Returns: `int`.

**What it does**

- Return `7`.

### `Program` {#symbol-Program}

[source](types.md#code)

Behavioral class.

Satisfies [`IProgram`](types.md#symbol-IProgram).

**Inputs**

- `repository` ([`Repository<int>`](types.md#symbol-Repository)) — injected; callers omit it — stored as `repository` and read-only after initialization.

#### `Program.start` {#symbol-Program.start}

[source](types.md#code)

**Inputs**

- `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.

Returns: no value.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**What it does**

- Call [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` = call [`Repository.get`](types.md#symbol-Repository.get) on `repository`.

### `IProgram` {#symbol-IProgram}

[source](types.md#code)

Interface.

#### `IProgram.start` {#symbol-IProgram.start}

[source](types.md#code)

**Inputs**

- `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.

Returns: no value.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Interface contract. A selected implementation supplies the behavior.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Capability interface from `august.io`.

- [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
