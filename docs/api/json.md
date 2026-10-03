---
generated: true
source: src/stdlib/json
editLink: false
---

# august.json

Install this source library with `aug add https://github.com/GreenPandaStudios/augscript/src/stdlib/json --as json`, then import its public names from `json`.

Signatures show result types and checked errors. See [packages](../packages.md) to pin a release and [language constructs](../language-constructs.md) for built-in types.

## parse {#api-parse}

```text
parse(string input) returns Json unless JsonError
```

Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/json/contracts.aug#L4)

## parseCompatible {#api-parseCompatible}

```text
parseCompatible(string input) returns Json unless JsonError
```

Parse an existing JavaScript-style envelope: duplicate keys use their last value,
numbers round to binary64, and nesting is bounded at 4096 levels. Invalid JSON
or Unicode raises JsonError. Keep original legacy JSON strings for wire hashes;
do not reserialize them. The strict parse function retains its own contract.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/json/contracts.aug#L13)
