---
generated: true
source: src/stdlib/errors
editLink: false
---

# august.errors

**Unreleased:** Supplied with the compiler. Import public names from `august.errors`.

Signatures show result types and checked errors. See [packages](../packages.md) to pin a release and [language constructs](../language-constructs.md) for built-in types.

## ContextError {#api-ContextError}

```text
error ContextError<E implements Error>(
    string operation,
    E cause,
    Tuple<string,int,int> location
)
```

Keep the original typed error with an operation name and an authored source location.
Concrete catches check the stored cause identity, including nested contexts.

**Parameters**
- `operation`: Describe the failed application operation; do not include secrets.
- `cause`: Original checked error; its identity and public fields are retained.
- `location`: Source identity, one-based line and column captured with sourceLocation().

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/errors/context.aug#L8)

## errorContext {#api-errorContext}

```text
errorContext<E implements Error>(
    E cause,
    string operation,
    Tuple<string,int,int> location
) returns ContextError<E>
```

Add context deliberately. Constructing context does not throw or log; the caller chooses to throw the result.

**Parameters**
- `cause`: Retain the concrete cause type; no blanket Error conversion occurs.
- `operation`: Name the operation whose failure you are explaining.
- `location`: Capture sourceLocation() at the caller, not inside this helper.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/errors/context.aug#L15)
