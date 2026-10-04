---
title: "operations.aug · Checked-error benchmark"
generated: true
source: "benchmarks/errors/operations.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `operations.aug`

[Checked-error benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`operations.aug`](operations.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMTY2NTU4OGM5MWViMjg1ZTg1MWU4NDQ3MzU0YTY3MWMzZjA2MTE1MzczOTVlZDllZTBiMzU3ZjY3YzBlMjkwOSIsImZvcm1hdHRlZFNoYTI1NiI6IjkyNDZhNDg3NjkwNTNkZDI0NWJkYTRkZjhiMTBkMDUzYmNmZjliMWRlNjdjMjQyNDg4MmYyN2FjZGU1ZTMwODciLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdmFsaWRhdGUiXX0seyJpZCI6InNvdXJjZS1MMy1MNSIsImZpcnN0IjozLCJsYXN0Ijo1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
validate(int value) returns int unless FileError:
    if value - value / 16 * 16 == 0:
        throw FileError()
    return value
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMTY2NTU4OGM5MWViMjg1ZTg1MWU4NDQ3MzU0YTY3MWMzZjA2MTE1MzczOTVlZDllZTBiMzU3ZjY3YzBlMjkwOSIsImZvcm1hdHRlZFNoYTI1NiI6IjZmNzgwZmJiNWU3ZjIwNzExYmYwNGNhYjU2NDk5Y2FjMTk1ZDI1OTMzZTQ1NzVjODc1ZTA5NTRkZmJmNWM3MTMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtdmFsaWRhdGUiXX0seyJpZCI6InNvdXJjZS1MMy1MNSIsImZpcnN0IjozLCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
validate(int value) returns int unless FileError {
    if value - value / 16 * 16 == 0 {
        throw FileError()
    }
    return value
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `validate` · [source](operations.md#source-L2) {#symbol-validate}

::: spec-paragraph specification-paragraph-1
It takes `value` as an integer. It checks that (`value` minus ((`value` divided by `16`) times `16`)) does not equal `0`. It raises a `FileError` at the first failed check. It returns `value`. [source](operations.md#source-L3-L5)
:::

::: details Checked interface

```text
validate(int value) returns int unless FileError
```

It takes `value` as an integer. Failures can raise `FileError`.

:::

::::

:::::
