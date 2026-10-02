---
title: "types.aug · Generic dependency injection"
generated: true
source: "examples/generic-di/types.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `types.aug`

[Generic dependency injection](index.md) · Source and specification

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
import Console from august.io
interface Repository<T>:
    get() returns T
NumberRepository() implements Repository<int>:
    get():
        return 7
Program(resolve Repository<int> repository) implements IProgram:
    start(resolve Console console):
        console.write(value=repository.get())
interface IProgram:
    start(resolve Console console) uses Console.write
```

```aug [Braces]
// aug-spec: "types.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
interface Repository<T> {
    get() returns T
}
NumberRepository() implements Repository<int> {
    get() {
        return 7
    }
}
Program(resolve Repository<int> repository) implements IProgram {
    start(resolve Console console) {
        console.write(value=repository.get())
    }
}
interface IProgram {
    start(resolve Console console) uses Console.write
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Repository` · interface · [source](types.md#code) {#symbol-Repository}

The type parameters are `T`.

#### `Repository.get` · [source](types.md#code) {#symbol-Repository.get}

It returns `T`.

### `NumberRepository` · class · [source](types.md#code) {#symbol-NumberRepository}

It implements [`Repository<int>`](types.md#symbol-Repository).

#### `NumberRepository.get` · [source](types.md#code) {#symbol-NumberRepository.get}

It returns `7`.

### `Program` · class · [source](types.md#code) {#symbol-Program}

It implements [`IProgram`](types.md#symbol-IProgram). The `repository` dependency is injected as [`Repository<int>`](types.md#symbol-Repository) and stored read-only.

#### `Program.start` · [source](types.md#code) {#symbol-Program.start}

It gets `console` ([`Console`](dependencies/august/0.21.0/io/contracts.md#symbol-Console)) from dependency injection. It passes [`repository.get`](types.md#symbol-Repository.get) to [`console.write`](dependencies/august/0.21.0/io/contracts.md#symbol-Console.write).

### `IProgram` · interface · [source](types.md#code) {#symbol-IProgram}

#### `IProgram.start` · [source](types.md#code) {#symbol-IProgram.start}

It gets `console` ([`Console`](dependencies/august/0.21.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/0.21.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](dependencies/august/0.21.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.21.0/io/contracts.md#symbol-Console.write)) from `august.io`.

::::

:::::
