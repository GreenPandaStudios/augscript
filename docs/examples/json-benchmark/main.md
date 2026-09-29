---
title: "main.aug · JSON benchmark"
generated: true
source: "benchmarks/json/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[JSON benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`data.aug`](data.md)

:::

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Run startup operations with checked error recovery.
- Run 2 other startup steps in source order.

### Startup, in source order

- Set `checksum` of type `int` to `0`.
- Set `index` of type `int` to `0`.
- Try these operations:
  - While `index` is less than `5000`, repeat:
    - Set `document` to call [`parse`](dependencies/august/0.19.0/json/contracts.md#symbol-parse) with `input` = `"{\"id\":7,\"message\":\"hello\",\"values\":[1,2,3]}"`.
    - Set `payload` to call `decode` on `document` with type arguments [`Payload`](data.md#symbol-Payload).
    - Set `encoded` to call `stringify` on call `Json` with `value` = `payload`.
    - Set `checksum` to (`checksum` plus `id` of `payload`) plus call `length` on `encoded`.
    - Set `index` to `index` plus `1`.
    - Check the condition again before the next iteration.
  - Call `print` with `value` = `checksum`.
- If they fail with `JsonError`, name the failure `error` and recover:
  - Call `exit` with `status` = `1`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`parse`](dependencies/august/0.19.0/json/contracts.md#symbol-parse)

Function from `august.json`.

- [`parse`](dependencies/august/0.19.0/json/contracts.md#symbol-parse) (`input`: `string`) → `Json`; can fail with `JsonError`.

#### [`Payload`](data.md#symbol-Payload)

Record from `data`.

- Read `id` (`int`).

### Built-in operations used by this file

- `Json.decode` (no inputs) → `Payload`: Decode a checked record or data type: json.decode<Profile>(). Unknown fields, type mismatches, and validation errors are rejected. Can fail with `JsonError`.
- `Json.stringify` (no inputs) → `string`: Serialize this JSON value with checked UTF-8 escaping and exact int64 values. Can fail with `JsonError`.
- `exit` (`status`: `int`) → `void`: Exit from main with a status from 0 to 255 after cancellation and cleanup.
- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.
- `string.length` (no inputs) → `int`: Read the number of UTF-8 bytes. Unicode text is preserved losslessly.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
