---
generated: true
source: src/stdlib/json
editLink: false
---

# august.json

Public declarations exported by this module. Import names explicitly from `august.json`. Built-in wire/value types are described in [language constructs](../language-constructs.md).

- [parse](#api-parse)

## parse {#api-parse}

```text
parse(string input) returns Json unless JsonError
```

Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/json/contracts.aug#L4)
