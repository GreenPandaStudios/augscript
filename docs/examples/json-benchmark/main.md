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

It sets `checksum` of type `int` to `0`. It sets `index` of type `int` to `0`.

It tries the following steps.

While `index` is less than `5000`, it follows these steps. It sets `document` to the value from [`parse`](dependencies/august/0.19.0/json/contracts.md#symbol-parse) (`input` set to `"{\"id\":7,\"message\":\"hello\",\"values\":[1,2,3]}"`). It sets `payload` to the value from `decode` on `document` with type arguments [`Payload`](data.md#symbol-Payload). It sets `encoded` to the value from `stringify` on a new `Json` (`value` set to `payload`). It sets `checksum` to (`checksum` plus `payload.id`) plus the byte length of `encoded`. It increases `index` by `1`.

Repeat this loop while its condition remains true. It calls `print` (`value` set to `checksum`). If this attempt raises `JsonError`, it catches it as `error` and calls `exit` (`status` set to `1`).

### Dependencies

[`parse`](dependencies/august/0.19.0/json/contracts.md#symbol-parse) from `august.json` takes `input` as `string`. It returns `Json`. It can fail with `JsonError`. The file uses [`Payload`](data.md#symbol-Payload) from `data`. `id` is a read-only field of type `int`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`Json.decode`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected. `Json.stringify`: Serialize this JSON value with checked UTF-8 escaping and exact int64 values. `exit`: Exit from main with a status from 0 to 255 after cancellation and cleanup. `print`: Composition and test output. Other callables receive Console and declare uses console.write. `string.length`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

::::

:::::
