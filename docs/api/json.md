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
