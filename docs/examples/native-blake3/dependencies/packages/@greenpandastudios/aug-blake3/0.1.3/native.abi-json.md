---
title: "Native binding contract · Hashing with Rust BLAKE3"
generated: true
source: "examples/native-blake3/.aug-spec/packages/@greenpandastudios/aug-blake3/0.1.3/native.abi.json"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
---

# Native binding contract

[Hashing with Rust BLAKE3](../../../../../index.md)

This dependency’s descriptor names native symbols, ownership rules, errors, and ABI types. The compiler checks August declarations against it. Native code must honor the declared rules.

```json
{
  "format": 1,
  "profile": "aug-native-abi-1",
  "resources": [],
  "functions": [
    {
      "module": "api",
      "name": "_hash",
      "symbol": "aug_blake3_hash_v1",
      "params": [
        {
          "name": "input",
          "kind": "bytes"
        }
      ],
      "result": {
        "kind": "utf8",
        "release": "aug_blake3_text_release_v1"
      },
      "error": "contracts.HashError",
      "callingConvention": "C",
      "status": "i32",
      "uses": [],
      "changes": [],
      "thread": "caller",
      "retainsInputs": false
    }
  ]
}
```
