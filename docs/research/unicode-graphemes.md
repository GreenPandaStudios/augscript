# Unicode grapheme measurement contracts

Reviewed October 4, 2026. This contributor note records the primary-source evidence for the B09 grapheme operations. The profile below is **implemented and unreleased**. The [ergonomics status](developer-ergonomics-status.md) records implemented scope; this note adds no runtime behavior.

## Version and data inputs

The implementation pins **Unicode 18.0.0**, released September 16, 2026, with **UAX #29 revision 49**, dated September 1, 2026. The versioned annex declares stable publication, and the UCD ReadMe identifies final 18.0.0 data. [Release components](https://www.unicode.org/versions/Unicode18.0.0/), [versioned segmentation annex](https://www.unicode.org/reports/tr29/tr29-49.html), [final-data ReadMe](https://www.unicode.org/Public/18.0.0/ucd/ReadMe.txt).

These SHA256 values were computed from the exact official response bytes during this review. They are content pins, not separate publisher authentication.

| Official input | Selection | SHA256 |
| --- | --- | --- |
| [GraphemeBreakProperty.txt](https://www.unicode.org/Public/18.0.0/ucd/auxiliary/GraphemeBreakProperty.txt) | `Grapheme_Cluster_Break` (GCB) | `0839dcb79e4ac639ecd538b1abf7c9d22e3f9dd265b7e182d33627aa4d75b45a` |
| [emoji-data.txt](https://www.unicode.org/Public/18.0.0/ucd/emoji/emoji-data.txt) | `Extended_Pictographic` | `80d00f8e616a0ef27fd6b8de3b758c06383b5d917e2977709578e68baf733bf1` |
| [DerivedCoreProperties.txt](https://www.unicode.org/Public/18.0.0/ucd/DerivedCoreProperties.txt) | `Indic_Conjunct_Break` (`InCB`) | `09c928886a178fcafd93c29e4bd59073a058e5a100b716d425cb563ab50f68c9` |
| [GraphemeBreakTest.txt](https://www.unicode.org/Public/18.0.0/ucd/auxiliary/GraphemeBreakTest.txt) | Default boundary vectors | `b0cf047ee94485bbdc846de2b902f5f8a815f6b674f9d04223cddadd91c9df31` |
| [ReadMe.txt](https://www.unicode.org/Public/18.0.0/ucd/ReadMe.txt) | Final release identity | `b0ea442f29dee90584aacd3665a6e1ce87ffc917a4d31f34e1916d2d6f7f9205` |
| [Unicode license](https://www.unicode.org/license.txt) | License V3, 2026 notice | `e7a93b009565cfce55919a381437ac4db883e9da2126fa28b91d12732bc53d96` |

GCB defaults to `Other`; InCB defaults to `None`; unlisted binary `Extended_Pictographic` values are false. Parse inclusive hexadecimal ranges and semicolon fields after removing comments. InCB records have a property field and a third value field, such as `094D ; InCB; Linker`. Keep the three properties independent: InCB `Extend` differs from GCB `Extend`, and pictographic membership includes reserved code points. Use the published assignments rather than reconstructing InCB from script or category heuristics. [GCB defaults](https://www.unicode.org/Public/18.0.0/ucd/auxiliary/GraphemeBreakProperty.txt), [InCB data](https://www.unicode.org/Public/18.0.0/ucd/DerivedCoreProperties.txt), [UAX #44 revision 38: defaults and derivation](https://www.unicode.org/reports/tr44/tr44-38.html).

## Algorithm contract

The implementation uses the default **extended** boundaries of UAX29-C1-1. Apply rules in order, including start/end, CR/LF and controls, conjoining sequences, Extend/ZWJ, SpacingMark, Prepend, Indic conjuncts, pictographic ZWJ sequences, regional-indicator parity, and the fallback break. Pairwise classification alone is insufficient. [Conformance and boundary rules](https://www.unicode.org/reports/tr29/tr29-49.html#Grapheme_Cluster_Boundary_Rules).

Revision 49 changes GB9c to `InCB=Linker InCB=Extend* × InCB=Consonant`. It no longer requires a leading consonant. GB11 still uses `Extended_Pictographic Extend* ZWJ × Extended_Pictographic`, with GCB `Extend`. Regional-indicator pairing depends on the immediately preceding consecutive RI run. [GB9c](https://www.unicode.org/reports/tr29/tr29-49.html#GB9c), [GB11](https://www.unicode.org/reports/tr29/tr29-49.html#GB11), [GB12/13](https://www.unicode.org/reports/tr29/tr29-49.html#GB12).

Default rules work directly on non-NFD text, so normalization is unnecessary. Grapheme clusters approximate perceived characters and have no intrinsic byte-size bound. [Normalization](https://www.unicode.org/reports/tr29/tr29-49.html#Normalization), [cluster limits](https://www.unicode.org/reports/tr29/tr29-49.html#Grapheme_Cluster_Boundaries).

**August implementation:** both operations share one forward boundary scanner between both operations and both backends. It uses deterministic generated property ranges with bounded lookups, retaining only the previous class, RI parity, pictographic/ZWJ context, and Indic-linker context. The scanner performs no backward rescans. Table generation is separate from ordinary compilation; compiler/runtime packages contain the generated tables and require no Unicode download at execution time.

## Implemented August profile

| Operation on `string` | Result | Checked failure |
| --- | --- | --- |
| `graphemeLength()` | `int`, counting default extended clusters; empty input gives zero | `ConversionError` for invalid UTF-8 |
| `graphemes()` | `List<string>`, containing ordered nonempty cluster copies; empty input gives an empty list | `ConversionError` for invalid UTF-8 |

Both operations validate the entire input before reporting success and preserve the original bytes. Joining the returned strings with an empty separator reproduces the input exactly. The operations do not normalize, tailor by locale or interpret display width. `length()`, `codePointLength()`, and `utf16Length()` retain their distinct documented units. [Current text contracts](../reference.md), [builtin declarations](../../src/builtins.ts).

The runtime already has strict, length-aware `aug_valid_utf8()` and checked `codePointLength()`. `aug_string_n()` copies unchecked bytes, while command arguments and filesystem reads can construct strings directly; validity cannot be assumed at a new operation's boundary. Use `text_length`, preserving embedded NUL, and call the unchecked scalar decoder only after validation. [UTF-8 helpers](../../runtime/aug_values.c), [string constructors and external input](../../runtime/aug_runtime.c), [checked native UTF-8 copy](../../runtime/aug_ir.c).

UTF-8 must reject overlong encodings, surrogate encodings, scalars beyond U+10FFFF, stray continuation bytes, missing continuation bytes, and truncated sequences. Valid scalar boundaries include U+D7FF, U+E000, and U+10FFFF; assignment status is separate from encoding validity. [Unicode 18 core specification, UTF-8](https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-3/#G31703).

## Qualification and maintenance

The pinned test file has **853 non-comment vectors**. Its delimiters specify every break and non-break; comments are explanatory and may change. Compare exact returned byte spans, the count, and byte-for-byte rejoining for every vector on C and LLVM. A count-only test can miss misplaced boundaries. One useful release-specific vector is `094D 0915`: Unicode 18 requires one cluster despite the absent leading consonant. [Official test format and vectors](https://www.unicode.org/Public/18.0.0/ucd/auxiliary/GraphemeBreakTest.txt).

Add August regressions for empty text, embedded NUL/CRLF, canonically equivalent spellings without rewriting bytes, long combining/ZWJ/linker sequences, RI runs interrupted by Extend, reserved pictographic ranges, and malformed UTF-8 at the scalar limits. Verify generated tables against the complete source-property assignments, and reject unknown values, overlaps within a property, incorrect version headers, and hash mismatches. These gates are exercised by `tests/graphemes.test.mjs` and `tests/unicode-data.test.mjs`: exact boundaries/counts/rejoins pass all 853 vectors on LLVM and on C in debug and optimized modes. Long combining and ZWJ sequences, worker-copy lifetimes and malformed UTF-8 under ASan/UBSan also pass. Generated properties match every official assignment and default across all Unicode code points.

The repository retains the source data, license notice, generator, input manifest, generated tables and vectors together under `native/unicode/18.0.0` and the canonical generator outputs. A Unicode update should explicitly change the algorithm revision and all matching data pins, regenerate deterministically, review changed boundaries, and update the public contract and changelog. Retain byte limits independently from grapheme limits. The generated runtime table contains 1641 non-default ranges. The compiler exposes the pinned version in hover and documentation; `npm run unicode:check` verifies all inputs and generated outputs.

Unicode License V3 permits use, modification, and redistribution of the data/software subject to retaining its copyright and permission notice with copies or associated documentation. Include the complete notice with vendored data, derived tables, and distributed artifacts; review the existing packaging of [third-party notices](../../THIRD_PARTY_NOTICES.md). Technical-report publication permissions are separate from data licensing, so link the annex rather than vendoring its prose. [Unicode License V3](https://www.unicode.org/license.txt), [Unicode terms and license categories](https://www.unicode.org/copyright.html).
