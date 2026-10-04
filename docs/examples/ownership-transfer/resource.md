---
title: "resource.aug · Move ownership"
generated: true
source: "examples/ownership-transfer/resource.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `resource.aug`

[Move ownership](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNDVmNThmZTYwZDA1NDQxNjgwMWI5YjY0OTY0YTJhM2M5MzViOWI3OTVlMDdjNGZjOWU0ZTVmMDAyMDU1ZGFiYyIsImZvcm1hdHRlZFNoYTI1NiI6IjA1OTZmNDUyYWE4Y2EzNWI5M2EzMjhhMjU3OWExNjc0ZjU5ZTgwYTFlODI2MjdjYWM2NzU2N2VhZGI2NjY0YjQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtUmVzb3VyY2UiXX0seyJpZCI6InNvdXJjZS1MNCIsImZpcnN0Ijo0LCJsYXN0Ijo1LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1SZXNvdXJjZS5kcm9wIl19LHsiaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6NiwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtSVJlc291cmNlIl19LHsiaWQiOiJzb3VyY2UtTDExIiwiZmlyc3QiOjgsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1tYWtlIl19LHsiaWQiOiJzb3VyY2UtTDEyLUwxMyIsImZpcnN0Ijo5LCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE1IiwiZmlyc3QiOjExLCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtY29uc3VtZSJdfSx7ImlkIjoic291cmNlLUwxNiIsImZpcnN0IjoxMiwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "resource.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console from august.io
Resource() implements IResource:
    drop():
        pass
interface IResource:
    pass
make() returns own Resource:
    own Resource value = Resource()
    return value
consume(resolve Console console, own Resource value):
    console.write(value="consumed")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNDVmNThmZTYwZDA1NDQxNjgwMWI5YjY0OTY0YTJhM2M5MzViOWI3OTVlMDdjNGZjOWU0ZTVmMDAyMDU1ZGFiYyIsImZvcm1hdHRlZFNoYTI1NiI6IjYzNWM5NjY3YzgyYmY2ZGE4ZWY3ZWJjMWI1MDQwMzNmZDdlNDEzODAxOTM0OGQ3M2RiMjlkNmFjNDkyM2FlYTMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtUmVzb3VyY2UiXX0seyJpZCI6InNvdXJjZS1MNCIsImZpcnN0Ijo0LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1SZXNvdXJjZS5kcm9wIl19LHsiaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLUlSZXNvdXJjZSJdfSx7ImlkIjoic291cmNlLUwxMSIsImZpcnN0IjoxMSwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyIjc3ltYm9sLW1ha2UiXX0seyJpZCI6InNvdXJjZS1MMTItTDEzIiwiZmlyc3QiOjEyLCJsYXN0IjoxMywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDE1IiwiZmlyc3QiOjE1LCJsYXN0IjoxNywiYmFja2xpbmtzIjpbIiNzeW1ib2wtY29uc3VtZSJdfSx7ImlkIjoic291cmNlLUwxNiIsImZpcnN0IjoxNiwibGFzdCI6MTYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "resource.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
consume(resolve Console console, own Resource value) {
    console.write(value="consumed")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Resource` · class · [source](resource.md#source-L3) {#symbol-Resource}

It implements [`IResource`](resource.md#symbol-IResource).

#### `Resource.drop` · [source](resource.md#source-L4) {#symbol-Resource.drop}

::: spec-paragraph specification-paragraph-1
It continues without an operation. [source](resource.md#source-L5)
:::

::: details Checked interface

```text
drop() returns void
```

:::

### `IResource` · interface · [source](resource.md#source-L8) {#symbol-IResource}

### `make` · [source](resource.md#source-L11) {#symbol-make}

::: spec-paragraph specification-paragraph-2
It creates [`Resource`](resource.md#symbol-Resource) and stores the result in owned `value` ([`Resource`](resource.md#symbol-Resource)). It returns `value`. [source](resource.md#source-L12-L13)
:::

::: details Checked interface

```text
make() returns own Resource
```

It returns ownership of [`Resource`](resource.md#symbol-Resource).

:::

### `consume` · [source](resource.md#source-L15) {#symbol-consume}

::: spec-paragraph specification-paragraph-3
It takes `value` as [`Resource`](resource.md#symbol-Resource) with ownership transferred. It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection. It passes `"consumed"` to [`console.write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write). [source](resource.md#source-L16)
:::

::: details Checked interface

```text
consume(resolve Console console, own Resource value) returns void uses Console.write
```

It takes `value` as [`Resource`](resource.md#symbol-Resource) with ownership transferred. It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection.

:::

### Dependencies

It uses [`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write)) from `august.io`.

::::

:::::
