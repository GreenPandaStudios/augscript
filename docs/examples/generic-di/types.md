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
    get() returns int:
        return 7
Program(resolve Repository<int> repository) implements IProgram:
    start(resolve Console console) uses Console.write:
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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Repository"></a>
### `Repository` · interface · [source](types.md#code)

The type parameters are `T`.

<a id="symbol-Repository.get"></a>
#### `Repository.get` · [source](types.md#code)

The result is `T`.

<a id="symbol-NumberRepository"></a>
### `NumberRepository` · class · [source](types.md#code)

Implements [`Repository<int>`](types.md#symbol-Repository).

<a id="symbol-NumberRepository.get"></a>
#### `NumberRepository.get` · [source](types.md#code)

The result is `int`. It returns `7`.

<a id="symbol-Program"></a>
### `Program` · class · [source](types.md#code)

Implements [`IProgram`](types.md#symbol-IProgram). Dependency injection supplies `repository` as [`Repository<int>`](types.md#symbol-Repository), stored read-only.

<a id="symbol-Program.start"></a>
#### `Program.start` · [source](types.md#code)

Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It calls [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) on `console` (`value` set to the value from [`Repository.get`](types.md#symbol-Repository.get) on `repository`).

<a id="symbol-IProgram"></a>
### `IProgram` · interface · [source](types.md#code)

<a id="symbol-IProgram.start"></a>
#### `IProgram.start` · [source](types.md#code)

Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

::::

:::::
