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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMjI1NTg2N2Y3OTk3MmQ2Y2U1NWI0ZWYwZjlmMTdmYjZiMGFmYWFhZmFhYmQzZDE2MGJmMzExYjJhNTFhNjcwYiIsImZvcm1hdHRlZFNoYTI1NiI6IjllYzI2ZmY0YTAxYjYyYmYzMGZhYTVhMDgwNGIyYjFkNTRmYTJmZDU1OWQzOTIwZmNmZjZmM2YzM2M0MjQ3YjAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtUmVwb3NpdG9yeSJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjQsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVJlcG9zaXRvcnkuZ2V0Il19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NSwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtTnVtYmVyUmVwb3NpdG9yeSJdfSx7ImlkIjoic291cmNlLUw3IiwiZmlyc3QiOjYsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3ltYm9sLU51bWJlclJlcG9zaXRvcnkuZ2V0Il19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6NywibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDExIiwiZmlyc3QiOjgsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Qcm9ncmFtIl19LHsiaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjksImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Qcm9ncmFtLnN0YXJ0Il19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEwLCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE2IiwiZmlyc3QiOjExLCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSVByb2dyYW0iXX0seyJpZCI6InNvdXJjZS1MMTciLCJmaXJzdCI6MTIsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JUHJvZ3JhbS5zdGFydCJdfV19
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMjI1NTg2N2Y3OTk3MmQ2Y2U1NWI0ZWYwZjlmMTdmYjZiMGFmYWFhZmFhYmQzZDE2MGJmMzExYjJhNTFhNjcwYiIsImZvcm1hdHRlZFNoYTI1NiI6IjkwMDdkMWVjNGZmNzhmYzM1MDZiM2NhOWE4MWYzMDI4YTMwMDgzNWE1ZGRhNzBlYzhmMzFmOTRmNDM0OGNiZDIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtUmVwb3NpdG9yeSJdfSx7ImlkIjoic291cmNlLUw0IiwiZmlyc3QiOjQsImxhc3QiOjQsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVJlcG9zaXRvcnkuZ2V0Il19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLU51bWJlclJlcG9zaXRvcnkiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo3LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1OdW1iZXJSZXBvc2l0b3J5LmdldCJdfSx7ImlkIjoic291cmNlLUw4IiwiZmlyc3QiOjgsImxhc3QiOjgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxMSIsImZpcnN0IjoxMSwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVByb2dyYW0iXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MTIsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Qcm9ncmFtLnN0YXJ0Il19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEzLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE2IiwiZmlyc3QiOjE2LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtSVByb2dyYW0iXX0seyJpZCI6InNvdXJjZS1MMTciLCJmaXJzdCI6MTcsImxhc3QiOjE3LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JUHJvZ3JhbS5zdGFydCJdfV19
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

### `Repository` · interface · [source](types.md#source-L3) {#symbol-Repository}

The type parameters are `T`.

#### `Repository.get` · [source](types.md#source-L4) {#symbol-Repository.get}

It returns `T`.

### `NumberRepository` · class · [source](types.md#source-L6) {#symbol-NumberRepository}

It implements [`Repository<int>`](types.md#symbol-Repository).

#### `NumberRepository.get` · [source](types.md#source-L7) {#symbol-NumberRepository.get}

::: spec-paragraph specification-paragraph-1
It returns `7`. [source](types.md#source-L8)
:::

::: details Checked interface

```text
get() returns int
```

:::

### `Program` · class · [source](types.md#source-L11) {#symbol-Program}

It implements [`IProgram`](types.md#symbol-IProgram). The `repository` dependency is injected as [`Repository<int>`](types.md#symbol-Repository) and stored read-only.

#### `Program.start` · [source](types.md#source-L12) {#symbol-Program.start}

::: spec-paragraph specification-paragraph-2
It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It passes [`repository.get`](types.md#symbol-Repository.get) to [`console.write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write). [source](types.md#source-L13)
:::

::: details Checked interface

```text
start(resolve Console console) returns void uses Console.write
```

It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection.

:::

### `IProgram` · interface · [source](types.md#source-L16) {#symbol-IProgram}

#### `IProgram.start` · [source](types.md#source-L17) {#symbol-IProgram.start}

It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write)) from `august.io`.

::::

:::::
