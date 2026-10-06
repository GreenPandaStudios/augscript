---
title: "main.aug · JSON benchmark"
generated: true
source: "benchmarks/json/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[JSON benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`data.aug`](data.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiMzhkMDY2ZTMwYTc2NDk2NzFiMzg4ZjI1MDA0MDZhN2RhYWNjMjY2OGJjM2MzMWRlZjlkNDhkYTBiNzg0MDAzOSIsImZvcm1hdHRlZFNoYTI1NiI6IjI0ZGEyZTNjMGNkYWQ4OGMyNmZjN2U1NmQ1YWNhNDcxYzM0YjJkZDEwN2U0MWViYTE2NDg3NWZlYzM1M2FlYTMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NCwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw0LUwxNSIsImZpcnN0Ijo0LCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDExLUwxNSIsImZpcnN0IjoxMSwibGFzdCI6MTUsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import parse from json
import Payload from data
int checksum = 0
int index = 0
try:
    while index < 5000:
        document = parse(input="{\"id\":7,\"message\":\"hello\",\"values\":[1,2,3]}")
        payload = document.decode<Payload>()
        encoded = Json(value=payload).stringify()
        checksum = checksum + payload.id + encoded.length()
        index = index + 1
    print(value=checksum)
catch JsonError error:
    exit(status=1)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiMzhkMDY2ZTMwYTc2NDk2NzFiMzg4ZjI1MDA0MDZhN2RhYWNjMjY2OGJjM2MzMWRlZjlkNDhkYTBiNzg0MDAzOSIsImZvcm1hdHRlZFNoYTI1NiI6IjJhMzczNGNhZmZlOGZlZGQxMzQ1YzVkZWY0MmQ3NTA4MWZmZmNjYjY4YTkzMDI1OGYwMGRlMDk4OTdlZTRiZGYiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDQiLCJmaXJzdCI6NCwibGFzdCI6NCwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw0LUwxNSIsImZpcnN0Ijo0LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDExLUwxNSIsImZpcnN0IjoxMSwibGFzdCI6MTgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import parse from json
import Payload from data
int checksum = 0
int index = 0
try {
    while index < 5000 {
        document = parse(input="{\"id\":7,\"message\":\"hello\",\"values\":[1,2,3]}")
        payload = document.decode<Payload>()
        encoded = Json(value=payload).stringify()
        checksum = checksum + payload.id + encoded.length()
        index = index + 1
    }
    print(value=checksum)
}
catch JsonError error {
    exit(status=1)
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It sets `checksum` and `index` separately, each to `0`. While `index` is less than `5000`, it sets `document` to [`parse`](dependencies/packages/%40git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-parse) with `input` `"{\"id\":7,\"message\":\"hello\",\"values\":[1,2,3]}"`. It sets `payload` to `document.decode` for [`Payload`](data.md#symbol-Payload). It sets `encoded` to `stringify` on a `Json` with `value` from `payload`. [source](main.md#source-L4-L15)
:::

::: spec-paragraph specification-paragraph-2
It sets `checksum` to (`checksum` plus `payload.id`) plus the byte length of `encoded`. It increases `index` by `1`. After the loop, it prints `checksum`. If this work raises `JsonError`, it calls `exit` with `status` `1`. [source](main.md#source-L11-L15)
:::

### Dependencies

It uses [`parse`](dependencies/packages/%40git/url_2d3c37c690c0fa115be1/0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.md#symbol-parse) from `json`. It uses [`Payload`](data.md#symbol-Payload) (`id`) from `data`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
