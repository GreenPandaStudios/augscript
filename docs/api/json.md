---
generated: true
source: src/stdlib/json
editLink: false
---

# august.json

Install this source library with `aug add https://github.com/GreenPandaStudios/augscript/src/stdlib/json --as json`, then import its public names from `json`.

The signatures below include checked results and failures, including those inferred from a body. See [packages](../packages.md) for revision pinning and [language constructs](../language-constructs.md) for built-in value types.

## parse {#api-parse}

```text
parse(string input) returns Json unless JsonError
```

Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/json/contracts.aug#L4)
