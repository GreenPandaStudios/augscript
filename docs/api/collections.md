---
generated: true
source: src/stdlib/collections
editLink: false
---

# august.collections

**Unreleased:** Supplied with the compiler. Import public names from `august.collections`.

Signatures show result types and checked errors. See [packages](../packages.md) to pin a release and [language constructs](../language-constructs.md) for built-in types.

## range {#api-range}

```text
range(int end, int start = 0, int step = 1, int limit = 1000000) returns List<int> unless RangeError
```

Return a new list of integers from start up to, but excluding, end.
A step past the int64 boundary stops before producing a wrapped value.

**Parameters**
- `start`: First value, default 0.
- `end`: Exclusive boundary.
- `step`: Nonzero increment, default 1; a negative step descends.
- `limit`: Maximum number of allocated elements, default 1000000; permitted from 1 to 1000000.

**Throws**
- `RangeError`: Invalid step, invalid limit, or too many elements.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/ranges.aug#L13)

## RangeError {#api-RangeError}

```text
error RangeError(string message)
```

A range has an invalid step or exceeds its explicit allocation limit.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/ranges.aug#L3)
