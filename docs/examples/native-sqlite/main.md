---
title: "main.aug · A database with SQLite"
generated: true
source: "examples/native-sqlite/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[A database with SQLite](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`database.aug`](database.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiM2Q5OTkzNGU2ZGEwNTk3ZDI4OTI5MWYwZWQ1Njk2NmEyNDU2YjZiYThmYTlmNDY4ZDljN2NmOTExYmRjODdhZSIsImZvcm1hdHRlZFNoYTI1NiI6IjZjYjBkOTExY2I2ODdhMDUxYWY1NDA5NDNhYzY1ZmI0MDg5YTc5N2UxODkyYzI5MmUxMDUwZmI3M2NkZmZjOGQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUtTDgiLCJmaXJzdCI6NCwibGFzdCI6NywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw2IiwiZmlyc3QiOjUsImxhc3QiOjUsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1kNGNmMDE1ODBmZGIiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo0LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsibWFpbi1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import storedName from database
import SqliteError from "https://github.com/GreenPandaStudios/aug-sqlite#43d8c33289b6b9310199f8c65fb83d48cd9dc310"
try:
    print(value=storedName())
catch SqliteError error:
    print(value=error.message)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiM2Q5OTkzNGU2ZGEwNTk3ZDI4OTI5MWYwZWQ1Njk2NmEyNDU2YjZiYThmYTlmNDY4ZDljN2NmOTExYmRjODdhZSIsImZvcm1hdHRlZFNoYTI1NiI6IjM1YmYwNzExMjNjODJmYjMyNWY1YjU2YmQ4MzQ5Y2U1ZDBmMjY5ZTEzMmMxY2Y5YjI2YzIwNDQ3M2YzMjU1MzYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUtTDgiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw2IiwiZmlyc3QiOjUsImxhc3QiOjUsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS1kNGNmMDE1ODBmZGIiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo0LCJsYXN0Ijo5LCJiYWNrbGlua3MiOlsibWFpbi1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19XX0
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import storedName from database
import SqliteError from "https://github.com/GreenPandaStudios/aug-sqlite#43d8c33289b6b9310199f8c65fb83d48cd9dc310"
try {
    print(value=storedName())
}
catch SqliteError error {
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
It prints [`storedName`](database.md#symbol-storedName). If this work raises [`SqliteError`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.2.0/contracts.md#symbol-SqliteError) as `error`, it prints `error.message`. [source](main.md#source-L5-L8)
:::

### Dependencies

It uses [`SqliteError`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.2.0/contracts.md#symbol-SqliteError) (`message`) from `https://github.com/GreenPandaStudios/aug-sqlite#43d8c33289b6b9310199f8c65fb83d48cd9dc310`. It uses [`storedName`](database.md#symbol-storedName) from `database`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
