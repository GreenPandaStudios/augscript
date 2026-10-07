---
title: "main.aug · Resource cleanup"
generated: true
source: "examples/drop/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Resource cleanup](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`resource.aug`](resource.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMzliN2YyMTY5ZDNjMWI2ODNjZGZlNTJlZWVhMTE4MmIzNTE3YjkyYmI5YWMyNTU0ODIzYTNhNDc2YTk5OTFjOSIsImZvcm1hdHRlZFNoYTI1NiI6ImM1Mzk1NzYyMjU5ZTBjZWNiMWVjYjUyZjlkM2JkMWE2MDI1NThkZmUwMmU0NDBhY2RiMWNkZTM4MzRmMTRmY2MiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDQiLCJmaXJzdCI6MywibGFzdCI6NCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwzIiwiZmlyc3QiOjMsImxhc3QiOjMsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS05Zjg4NTI4ZDYyYTEiLCJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Resource from resource
own Resource resource = Resource()
print(value="using resource")
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMzliN2YyMTY5ZDNjMWI2ODNjZGZlNTJlZWVhMTE4MmIzNTE3YjkyYmI5YWMyNTU0ODIzYTNhNDc2YTk5OTFjOSIsImZvcm1hdHRlZFNoYTI1NiI6ImM1Mzk1NzYyMjU5ZTBjZWNiMWVjYjUyZjlkM2JkMWE2MDI1NThkZmUwMmU0NDBhY2RiMWNkZTM4MzRmMTRmY2MiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDQiLCJmaXJzdCI6MywibGFzdCI6NCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwzIiwiZmlyc3QiOjMsImxhc3QiOjMsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS05Zjg4NTI4ZDYyYTEiLCJtYWluLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX1dfQ
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Resource from resource
own Resource resource = Resource()
print(value="using resource")
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It creates [`Resource`](resource.md#symbol-Resource) and stores the result in owned `resource` ([`Resource`](resource.md#symbol-Resource)). It prints `"using resource"`. [source](main.md#source-L3-L4)
:::

### Dependencies

It uses [`Resource`](resource.md#symbol-Resource) from `resource`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
