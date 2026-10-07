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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMjI1NTg2N2Y3OTk3MmQ2Y2U1NWI0ZWYwZjlmMTdmYjZiMGFmYWFhZmFhYmQzZDE2MGJmMzExYjJhNTFhNjcwYiIsImZvcm1hdHRlZFNoYTI1NiI6IjllYzI2ZmY0YTAxYjYyYmYzMGZhYTVhMDgwNGIyYjFkNTRmYTJmZDU1OWQzOTIwZmNmZjZmM2YzM2M0MjQ3YjAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEwLCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTJhYTc3NDRiNDdlMiIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NCwiYmFja2xpbmtzIjpbInR5cGVzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLVJlcG9zaXRvcnkuZ2V0Il19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NSwibGFzdCI6NywiYmFja2xpbmtzIjpbInR5cGVzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLU51bWJlclJlcG9zaXRvcnkiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo2LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsidHlwZXMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtTnVtYmVyUmVwb3NpdG9yeS5nZXQiXX0seyJpZCI6InNvdXJjZS1MMTEiLCJmaXJzdCI6OCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyJ0eXBlcy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1Qcm9ncmFtIl19LHsiaWQiOiJzb3VyY2UtTDEyIiwiZmlyc3QiOjksImxhc3QiOjEwLCJiYWNrbGlua3MiOlsidHlwZXMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSIsIiNzeW1ib2wtUHJvZ3JhbS5zdGFydCJdfSx7ImlkIjoic291cmNlLUwxNyIsImZpcnN0IjoxMiwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyJ0eXBlcy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC02IiwiI3N5bWJvbC1JUHJvZ3JhbS5zdGFydCJdfSx7ImlkIjoic291cmNlLUwzIiwiZmlyc3QiOjMsImxhc3QiOjQsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVJlcG9zaXRvcnkiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0Ijo3LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMTYiLCJmaXJzdCI6MTEsImxhc3QiOjEyLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JUHJvZ3JhbSJdfV19
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMjI1NTg2N2Y3OTk3MmQ2Y2U1NWI0ZWYwZjlmMTdmYjZiMGFmYWFhZmFhYmQzZDE2MGJmMzExYjJhNTFhNjcwYiIsImZvcm1hdHRlZFNoYTI1NiI6IjkwMDdkMWVjNGZmNzhmYzM1MDZiM2NhOWE4MWYzMDI4YTMwMDgzNWE1ZGRhNzBlYzhmMzFmOTRmNDM0OGNiZDIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEzLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTJhYTc3NDRiNDdlMiIsIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NCwiYmFja2xpbmtzIjpbInR5cGVzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLVJlcG9zaXRvcnkuZ2V0Il19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyJ0eXBlcy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1OdW1iZXJSZXBvc2l0b3J5Il19LHsiaWQiOiJzb3VyY2UtTDciLCJmaXJzdCI6NywibGFzdCI6OSwiYmFja2xpbmtzIjpbInR5cGVzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiLCIjc3ltYm9sLU51bWJlclJlcG9zaXRvcnkuZ2V0Il19LHsiaWQiOiJzb3VyY2UtTDExIiwiZmlyc3QiOjExLCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbInR5cGVzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiLCIjc3ltYm9sLVByb2dyYW0iXX0seyJpZCI6InNvdXJjZS1MMTIiLCJmaXJzdCI6MTIsImxhc3QiOjE0LCJiYWNrbGlua3MiOlsidHlwZXMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSIsIiNzeW1ib2wtUHJvZ3JhbS5zdGFydCJdfSx7ImlkIjoic291cmNlLUwxNyIsImZpcnN0IjoxNywibGFzdCI6MTcsImJhY2tsaW5rcyI6WyJ0eXBlcy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC02IiwiI3N5bWJvbC1JUHJvZ3JhbS5zdGFydCJdfSx7ImlkIjoic291cmNlLUwzIiwiZmlyc3QiOjMsImxhc3QiOjUsImJhY2tsaW5rcyI6WyIjc3ltYm9sLVJlcG9zaXRvcnkiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0Ijo4LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMTYiLCJmaXJzdCI6MTYsImxhc3QiOjE4LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JUHJvZ3JhbSJdfV19
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

[Interactions and sequences](types-diagrams.md)

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
It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). It passes [`repository.get`](types.md#symbol-Repository.get) to [`console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). [source](types.md#source-L13)
:::

::: details Checked interface

```text
start(resolve Console console) returns void uses Console.write
```

It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

:::

### `IProgram` · interface · [source](types.md#source-L16) {#symbol-IProgram}

#### `IProgram.start` · [source](types.md#source-L17) {#symbol-IProgram.start}

It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

### Dependencies

It uses [`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)) from `august.io`.

::::

:::::
