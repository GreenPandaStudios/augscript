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

- Set `checksum` of type `int` to `0`.
- Set `index` of type `int` to `0`.
- Try:
  - While `index` is less than `5000`:
    - Set `document` to the result of [`parse`](dependencies/august/0.19.0/json/contracts.md#symbol-parse) with `input` as `"{\"id\":7,\"message\":\"hello\",\"values\":[1,2,3]}"`.
    - Set `payload` to the result of `decode` on `document` with type arguments [`Payload`](data.md#symbol-Payload).
    - Set `encoded` to the result of `stringify` on a new `Json` with `value` as `payload`.
    - Set `checksum` to (`checksum` plus `id` of `payload`) plus the result of `length` on `encoded`.
    - Set `index` to `index` plus `1`.
  - Call `print` with `value` as `checksum`.
- Catch `JsonError` as `error`:
  - Call `exit` with `status` as `1`.

### Dependencies

- [`parse`](dependencies/august/0.19.0/json/contracts.md#symbol-parse) (`input`: `string`) → `Json`; can fail with `JsonError` from `august.json`.
- [`Payload`](data.md#symbol-Payload) from `data`: read `id` (`int`).

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `Json.decode`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected.
- `Json.stringify`: Serialize this JSON value with checked UTF-8 escaping and exact int64 values.
- `exit`: Exit from main with a status from 0 to 255 after cancellation and cleanup.
- `print`: Composition and test output. Other callables receive Console and declare uses console.write.
- `string.length`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

::::

:::::
