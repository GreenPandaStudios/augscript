---
title: "main.aug · Record allocation benchmark"
generated: true
source: "benchmarks/records/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Record allocation benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`data.aug`](data.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiNDg5ODhiZWFkYTcwNTkwZjljZjRkNzJhZTFhMDdmNjZkMTFkZmJkYzAzNGU4OTQyNDQ2YmUzZTY3MWFlM2RjNSIsImZvcm1hdHRlZFNoYTI1NiI6ImQ5NWFlMjJhYjBlMGRiOTI4ZTYwZGUyMTg0YmU0YTQ1YTJkNzQ3NTBhMTMzNGIyNzFmNjRhYmZlMDAzOWNmODEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDgiLCJmaXJzdCI6MywibGFzdCI6OCwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5LUwxMiIsImZpcnN0Ijo5LCJsYXN0IjoxMiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUw3IiwiZmlyc3QiOjcsImxhc3QiOjcsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS00MDgwNGU4NWEzMTMiXX0seyJpZCI6InNvdXJjZS1MMyIsImZpcnN0IjozLCJsYXN0IjozLCJiYWNrbGlua3MiOlsibWFpbi1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Item from data
int iterations = 50000
own List<Item> values = []
int index = 0
while index < iterations:
    values.append(value=Item(id=index, name="August"))
    index = index + 1
int checksum = 0
for item in values:
    checksum = checksum + item.id
print(value=checksum)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiNDg5ODhiZWFkYTcwNTkwZjljZjRkNzJhZTFhMDdmNjZkMTFkZmJkYzAzNGU4OTQyNDQ2YmUzZTY3MWFlM2RjNSIsImZvcm1hdHRlZFNoYTI1NiI6IjJlMDcyMDBhOTdjYjFjZDc1NmQ4YWJlYjRhNTdlNzQxOGRkZTEzNGNlNGI5Y2E4ZjI2ZmNmYmQ0MzdkZDM2YTMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMtTDgiLCJmaXJzdCI6MywibGFzdCI6OSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw5LUwxMiIsImZpcnN0IjoxMCwibGFzdCI6MTQsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MNyIsImZpcnN0Ijo3LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiZGlhZ3JhbXMvaW5kZXgubWQjYm91bmRhcnktNDA4MDRlODVhMzEzIl19LHsiaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6MywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Item from data
int iterations = 50000
own List<Item> values = []
int index = 0
while index < iterations {
    values.append(value=Item(id=index, name="August"))
    index = index + 1
}
int checksum = 0
for item in values {
    checksum = checksum + item.id
}
print(value=checksum)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It sets `iterations` to `50000`. It stores a list with no items in owned `values` (`List<Item>`). It sets `index` to `0`. While `index` is less than `iterations`, it appends an [`Item`](data.md#symbol-Item) with `id` from `index` and `name` `"August"` to `values`; then it increases `index` by `1`. [source](main.md#source-L3-L8)
:::

::: spec-paragraph specification-paragraph-2
After the loop, it sets `checksum` to `0`. For each `item` in a snapshot of `values`, it increases `checksum` by `item.id`. After the loop, it prints `checksum`. [source](main.md#source-L9-L12)
:::

### Dependencies

It uses [`Item`](data.md#symbol-Item) (`id`) from `data`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
