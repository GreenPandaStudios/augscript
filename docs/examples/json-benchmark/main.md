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

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import parse from august.json
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

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import parse from august.json
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

### Startup

It sets `checksum` and `index` separately, each to `0`. While `index` is less than `5000`, it sets `document` to [`parse`](dependencies/august/0.19.0/json/contracts.md#symbol-parse) with `input` `"{\"id\":7,\"message\":\"hello\",\"values\":[1,2,3]}"`. It sets `payload` to `document.decode` for [`Payload`](data.md#symbol-Payload). It sets `encoded` to `stringify` on a `Json` with `value` from `payload`.

It sets `checksum` to (`checksum` plus `payload.id`) plus the byte length of `encoded`. It increases `index` by `1`. After the loop, it prints `checksum`. If this work raises `JsonError`, it calls `exit` with `status` `1`.

### Dependencies

It uses [`parse`](dependencies/august/0.19.0/json/contracts.md#symbol-parse) from `august.json`. It uses [`Payload`](data.md#symbol-Payload) (`id`) from `data`. These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
