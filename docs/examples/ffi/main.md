---
title: "main.aug · A native C boundary"
generated: true
source: "examples/ffi/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[A native C boundary](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`native.aug`](native.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNDRjZDgzZGMyYjU2MWViZGVkOGY5NDUyNjY5OGFhOTZlYzJjNWRhMTUzYjBkMDZlOTZhNDBkNzM4ZTgwYjFhOCIsImZvcm1hdHRlZFNoYTI1NiI6ImU5ZjYzZWUzOWRiMmVlN2Y2YWYyM2VjM2FjN2Y3OGFiMzUxOWM4MjdkNTliZGIwNjEyMmJmNTY5YzI5NTcwYWMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import announce from native
announce()
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNDRjZDgzZGMyYjU2MWViZGVkOGY5NDUyNjY5OGFhOTZlYzJjNWRhMTUzYjBkMDZlOTZhNDBkNzM4ZTgwYjFhOCIsImZvcm1hdHRlZFNoYTI1NiI6ImU5ZjYzZWUzOWRiMmVlN2Y2YWYyM2VjM2FjN2Y3OGFiMzUxOWM4MjdkNTliZGIwNjEyMmJmNTY5YzI5NTcwYWMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import announce from native
announce()
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

::: spec-paragraph specification-paragraph-1
It calls [`announce`](native.md#symbol-announce). [source](main.md#source-L3)
:::

### Dependencies

It uses [`announce`](native.md#symbol-announce) from `native`.

::::

:::::
