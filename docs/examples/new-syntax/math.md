---
title: "math.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/math.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `math.aug`

[Labeled calls and injection](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`console.aug`](console.md)
- [`greeter.aug`](greeter.md)
- [`logger.aug`](logger.md)
- [`math.aug`](math.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiM2UzY2ZjNzU0NmRkNThhMzM0ZmNmMDNhZTI5NWQ2NWEzODg1MWE5YTM3MzE1ZDIxOTNjNGNjMDE5NjIzMzYwNCIsImZvcm1hdHRlZFNoYTI1NiI6IjkxNGI0MjE0N2Q2Y2Y0ZDgyYzVlMDllMzY3YTFjZjk4NjNiNGIzYjA0MjQ2Yjg5MGVkZjdjYTBjODNhNzhmYzEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzeW1ib2wtaW5jcmVtZW50Il19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "math.aug.md" explains this file. Read it before changes; refresh with aug spec.
increment(int value):
    return value + 1
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiM2UzY2ZjNzU0NmRkNThhMzM0ZmNmMDNhZTI5NWQ2NWEzODg1MWE5YTM3MzE1ZDIxOTNjNGNjMDE5NjIzMzYwNCIsImZvcm1hdHRlZFNoYTI1NiI6ImIxMWJmNTU4OTE0ZDM3MGVhYWFmZjFjYjBhMDlkYmQ2N2E5NjEzYTUwOGIwYTFjYjlkNDBjMDhjYWFiZjk1MTEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDIiLCJmaXJzdCI6MiwibGFzdCI6NCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtaW5jcmVtZW50Il19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "math.aug.md" explains this file. Read it before changes; refresh with aug spec.
increment(int value) {
    return value + 1
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `increment` · [source](math.md#source-L2) {#symbol-increment}

::: spec-paragraph specification-paragraph-1
It takes `value` as an integer. It returns `value` plus `1`. [source](math.md#source-L3)
:::

::: details Checked interface

```text
increment(int value) returns int
```

It takes `value` as an integer.

:::

::::

:::::
