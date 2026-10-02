---
title: "Native binding contract · Compression with zlib"
generated: true
source: "examples/native-zlib/.aug-spec/packages/@greenpandastudios/aug-zlib/0.1.3/native.abi.json"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
---

# Native binding contract

[Compression with zlib](../../../../../index.md)

This dependency’s descriptor names native symbols, ownership rules, errors, and ABI types. The compiler checks August declarations against it. Native code must honor the declared rules.

```json
{
  "format": 1,
  "profile": "aug-native-abi-1",
  "resources": [],
  "functions": [
    {
      "module": "api",
      "name": "_compress",
      "symbol": "aug_zlib_compress_v1",
      "params": [
        {
          "name": "input",
          "kind": "bytes"
        }
      ],
      "result": {
        "kind": "bytes",
        "release": "aug_zlib_release_v1"
      },
      "error": "contracts.CompressionError",
      "callingConvention": "C",
      "status": "i32",
      "uses": [],
      "changes": [],
      "thread": "caller",
      "retainsInputs": false
    },
    {
      "module": "api",
      "name": "_decompress",
      "symbol": "aug_zlib_decompress_v1",
      "params": [
        {
          "name": "input",
          "kind": "bytes"
        },
        {
          "name": "maximumOutput",
          "kind": "i64",
          "minimum": 0,
          "maximum": 268435456
        }
      ],
      "result": {
        "kind": "bytes",
        "release": "aug_zlib_release_v1"
      },
      "error": "contracts.CompressionError",
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
