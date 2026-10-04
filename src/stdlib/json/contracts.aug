// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C value pure _aug_json_parse(string input) returns Json unless JsonError
/** Parse strict UTF-8 JSON. Duplicate keys, invalid Unicode, oversized integers, and nesting beyond 64 levels raise JsonError. */
parse(string input) :
    unsafe:
        return _aug_json_parse(input)

extern C value pure _aug_json_parse_compatible(string input) returns Json unless JsonError
/** Parse an existing JavaScript-style envelope: duplicate keys use their last value,
 * numbers round to binary64, and nesting is bounded at 4096 levels. Invalid JSON
 * or Unicode raises JsonError. Keep original legacy JSON strings for wire hashes;
 * do not reserialize them. The strict parse function retains its own contract. */
parseCompatible(string input):
    unsafe:
        return _aug_json_parse_compatible(input)
