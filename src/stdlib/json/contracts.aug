extern C value pure _aug_json_parse(string input) returns Json unless JsonError
/** Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError. */
parse(string input) returns Json unless JsonError:
    unsafe:
        return _aug_json_parse(input)
