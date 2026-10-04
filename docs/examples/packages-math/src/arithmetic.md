---
title: "src/arithmetic.aug · Create a package"
generated: true
source: "examples/packages/math/src/arithmetic.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `src/arithmetic.aug`

[Create a package](../index.md) · Source and specification

::: details Files in this project

- [`src/arithmetic.aug`](arithmetic.md)
- [`src/export.aug`](export.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOGRiYTYyY2EyNzBjNWY2YWIyM2VlZmJiNTllZjM3YzZmMmFjZGE1Yjc4OWM3NWU5YjJmMTU2ZmNkYWI5MjY4NiIsImZvcm1hdHRlZFNoYTI1NiI6IjE4ODJiNWRlMDQ5ZTRhZGRkMDFkMWUyODBlNDNiMDIyMTIwNWIzMTZkZGRjNzk3ZTliZDZhZjRhM2MxYTQwYjIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtYWRkIl19LHsiaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NSwibGFzdCI6OCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC1hZGQiXX0seyJpZCI6InNvdXJjZS1MOCIsImZpcnN0Ijo3LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MOSIsImZpcnN0Ijo4LCJsYXN0Ijo4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX1dfQ
// aug-spec: "arithmetic.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Add two integers. @param left First value. @param right Second value. @return Their sum. */
add(int left, int right):
    return left + right
test add:
    when "addition":
        it "adds_two_integers":
            assert(add(left=2, right=3) == 5)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOGRiYTYyY2EyNzBjNWY2YWIyM2VlZmJiNTllZjM3YzZmMmFjZGE1Yjc4OWM3NWU5YjJmMTU2ZmNkYWI5MjY4NiIsImZvcm1hdHRlZFNoYTI1NiI6ImJiNmQ5ZjQ4NDEyMjNkYTA5MzQyM2Q5YmQxODkxMjJiMjE2YTAyN2E5ZGRiMTUxNGFiYzFmN2JkNDM4YTQ3OTUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtYWRkIl19LHsiaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDYiLCJmaXJzdCI6NiwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXRlc3QtMjAtYWRkIl19LHsiaWQiOiJzb3VyY2UtTDgiLCJmaXJzdCI6OCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjksImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "arithmetic.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Add two integers. @param left First value. @param right Second value. @return Their sum. */
add(int left, int right) {
    return left + right
}
test add {
    when "addition" {
        it "adds_two_integers" {
            assert(add(left=2, right=3) == 5)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `add` · [source](arithmetic.md#source-L3) {#symbol-add}

::: spec-paragraph specification-paragraph-1
Add two integers. It takes `left` and `right` as integers. It returns `left` plus `right`. [source](arithmetic.md#source-L4)
:::

::: details Checked interface

```text
add(int left, int right) returns int
```

It takes `left` as an integer (First value) and `right` as an integer (Second value). It returns `int` — Their sum.

:::

### `test add` · [source](arithmetic.md#source-L6) {#symbol-test-20-add}

Tests [`add`](arithmetic.md#symbol-add). Each case gets fresh setup and dependencies.

#### `addition`

::: spec-paragraph specification-paragraph-2
##### `adds_two_integers` · [source](arithmetic.md#source-L8)
:::

::: spec-paragraph specification-paragraph-3
The test requires [`add`](arithmetic.md#symbol-add) with `left` `2` and `right` `3` equals `5`. [source](arithmetic.md#source-L9)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
