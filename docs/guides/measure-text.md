# Measure text in the right unit

The explicit byte and grapheme operations are unreleased. Choose the unit your limit or operation needs. A network payload has a byte size; a user-facing text selection usually needs grapheme boundaries. A grapheme approximates one perceived character, including combining marks and many emoji sequences.

## Count and split text

Put this in **main.aug**:

```aug project=measure-text-guide file=main.aug
try:
    text = "é👩‍💻"
    print(value=text.byteLength())
    print(value=text.codePointLength())
    print(value=text.utf16Length())
    print(value=text.graphemeLength())
    for part in text.graphemes():
        print(value=part)
catch ConversionError failure:
    print(value="The input is not valid UTF-8")
```

Run `aug run .`. It prints `14`, `5`, `7`, `2`, then `é` and `👩‍💻` on separate lines.

| Operation | Unit | Example result |
| --- | --- | --- |
| `byteLength()` or `length()` | UTF-8 bytes | 14 |
| `codePointLength()` | Unicode scalar values | 5 |
| `utf16Length()` | UTF-16 code units | 7 |
| `graphemeLength()` | Extended grapheme clusters | 2 |

The accent is a separate scalar attached to `e`. The emoji contains two supplementary scalars and a zero-width joiner. Byte counts and scalar counts answer different questions from grapheme counts.

## Keep the original text

`graphemes()` returns a read-only `List<string>` of nonempty cluster copies in text order. An empty input produces an empty list. Joining that list with `separator=""` reproduces the original bytes, including a decoded NUL. This is useful when selecting or rearranging complete clusters without cutting a UTF-8 sequence or separating a combining mark from its base.

The operations use Unicode **18.0.0** default extended boundaries, as specified by UAX #29 revision 49. The runtime contains the pinned tables and needs no download when your program runs. Both grapheme operations and `codePointLength()` validate the entire UTF-8 input and raise `ConversionError` if it is invalid.

Segmentation preserves spelling. It does not normalize canonically equivalent text, apply language-specific tailoring, count terminal columns or promise a rendered width. A single cluster can contain many bytes, so retain an independent byte limit when bounding input or allocation. A Unicode version update can change boundaries; use the documented runtime version when comparing stored segmentation results.
