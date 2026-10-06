---
title: "resource.aug · Resource cleanup"
generated: true
source: "examples/drop/resource.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `resource.aug`

[Resource cleanup](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNjQ3MjY4MDQzMDE3NTJjMzU0ZmQ1MTRmOGQxZDQwODFmZDg5ZDMzNzk0ODhkZjAzODg2NjMyOTgyY2M0MTI1OSIsImZvcm1hdHRlZFNoYTI1NiI6IjA3MjBmYWE1YzVmNWI2MzlmNjk3NDdiY2M0YzcwNjQ0ZDA1YzQ2NTMyMmU1Y2QwNmYxZjhjMDk4ODA0NDMyYzIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NCwiYmFja2xpbmtzIjpbInJlc291cmNlLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLVJlc291cmNlIl19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NCwiYmFja2xpbmtzIjpbInJlc291cmNlLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLVJlc291cmNlLmRyb3AiXX0seyJpZCI6InNvdXJjZS1MNCIsImZpcnN0Ijo0LCJsYXN0Ijo0LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo1LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JUmVzb3VyY2UiXX1dfQ
// aug-spec: "resource.aug.md" explains this file. Read it before changes; refresh with aug spec.
Resource() implements IResource:
    drop():
        pass
interface IResource:
    pass
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNjQ3MjY4MDQzMDE3NTJjMzU0ZmQ1MTRmOGQxZDQwODFmZDg5ZDMzNzk0ODhkZjAzODg2NjMyOTgyY2M0MTI1OSIsImZvcm1hdHRlZFNoYTI1NiI6IjI5NTlmNDk5NTEzMGU1NDFiYTQ2NjlmNTYxMDBlOGQ3ZGFhNTg2N2M5YjQzNDkyMjg2OGU4OGUxOTYzNjI4ZWEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NiwiYmFja2xpbmtzIjpbInJlc291cmNlLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLVJlc291cmNlIl19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NSwiYmFja2xpbmtzIjpbInJlc291cmNlLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLVJlc291cmNlLmRyb3AiXX0seyJpZCI6InNvdXJjZS1MNCIsImZpcnN0Ijo0LCJsYXN0Ijo0LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo3LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1JUmVzb3VyY2UiXX1dfQ
// aug-spec: "resource.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](resource-diagrams.md)

### `Resource` · class · [source](resource.md#source-L2) {#symbol-Resource}

It implements [`IResource`](resource.md#symbol-IResource).

#### `Resource.drop` · [source](resource.md#source-L3) {#symbol-Resource.drop}

::: spec-paragraph specification-paragraph-1
It continues without an operation. [source](resource.md#source-L4)
:::

::: details Checked interface

```text
drop() returns void
```

:::

### `IResource` · interface · [source](resource.md#source-L7) {#symbol-IResource}

::::

:::::
