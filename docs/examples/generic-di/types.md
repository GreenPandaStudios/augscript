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

### `Repository` {#symbol-Repository}

[source](types.md#code)

Interface.

Type parameters: `T`.

#### `Repository.get` {#symbol-Repository.get}

[source](types.md#code)

Result: `T`.

Interface contract. A selected implementation supplies the behavior.

### `NumberRepository` {#symbol-NumberRepository}

[source](types.md#code)

Behavioral class.

Satisfies [`Repository`](types.md#symbol-Repository).

#### `NumberRepository.get` {#symbol-NumberRepository.get}

[source](types.md#code)

Result: `int`.

**Behavior when execution reaches this operation**

- Return `7` and finish this operation.

### `Program` {#symbol-Program}

[source](types.md#code)

Behavioral class.

Satisfies [`IProgram`](types.md#symbol-IProgram).

**Inputs and dependencies**

- `repository`: [`Repository<int>`](types.md#symbol-Repository). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them. Store it as `repository`. The field is read-only after initialization.

#### `Program.start` {#symbol-Program.start}

[source](types.md#code)

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**Behavior when execution reaches this operation**

- Call [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` with `value` set to the result of call [`Repository.get`](types.md#symbol-Repository.get) on `repository`.

### `IProgram` {#symbol-IProgram}

[source](types.md#code)

Interface.

#### `IProgram.start` {#symbol-IProgram.start}

[source](types.md#code)

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Interface contract. A selected implementation supplies the behavior.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
