---
title: "main.aug · Hashing with Rust BLAKE3"
generated: true
source: "examples/native-blake3/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Hashing with Rust BLAKE3](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`hashing.aug`](hashing.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOTUxOTIyMDYzYjc2NWVkNDVlZGMwYmUyNDA2MTlmNjI4MTA0OTBhOGExN2ZkZDAzY2NmZjliODE4ZGI4MmFiYSIsImZvcm1hdHRlZFNoYTI1NiI6Ijk3MTZlMWI1ZTU0MTZjNjI1YjEzNWNkMjdlZTYwZGYyMzdkZWEwOTlhOWJlY2M0MTZlYTE1NTViZDQ3YzJkZjQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUtTDgiLCJmaXJzdCI6NCwibGFzdCI6NywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw2IiwiZmlyc3QiOjUsImxhc3QiOjUsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0wZTFjMTE4YTI0NGIiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo0LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsibWFpbi1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import hashText from hashing
import HashError from "https://github.com/GreenPandaStudios/aug-blake3#e9f7b92d98a2f9c36de530f4dfc1740012fb5e5e"
try:
    print(value=hashText(value="abc"))
catch HashError error:
    print(value=error.message)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOTUxOTIyMDYzYjc2NWVkNDVlZGMwYmUyNDA2MTlmNjI4MTA0OTBhOGExN2ZkZDAzY2NmZjliODE4ZGI4MmFiYSIsImZvcm1hdHRlZFNoYTI1NiI6IjYwN2IyMmI2MmRlZjcyNDNiN2I4NTU2NTZjN2JmOTI2OGJjNjgwODM2ZjYxYjlkZTJiY2Y0OTNhY2Q1OTk0YTkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUtTDgiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw2IiwiZmlyc3QiOjUsImxhc3QiOjUsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS0wZTFjMTE4YTI0NGIiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo0LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsibWFpbi1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import hashText from hashing
import HashError from "https://github.com/GreenPandaStudios/aug-blake3#e9f7b92d98a2f9c36de530f4dfc1740012fb5e5e"
try {
    print(value=hashText(value="abc"))
}
catch HashError error {
    print(value=error.message)
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It prints [`hashText`](hashing.md#symbol-hashText) with `value` `"abc"`. If this work raises [`HashError`](dependencies/packages/%40greenpandastudios/aug-blake3/0.2.0/contracts.md#symbol-HashError) as `error`, it prints `error.message`. [source](main.md#source-L5-L8)
:::

### Dependencies

It uses [`HashError`](dependencies/packages/%40greenpandastudios/aug-blake3/0.2.0/contracts.md#symbol-HashError) (`message`) from `https://github.com/GreenPandaStudios/aug-blake3#e9f7b92d98a2f9c36de530f4dfc1740012fb5e5e`. It uses [`hashText`](hashing.md#symbol-hashText) from `hashing`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
