# Validated domain values

Reviewed October 4, 2026. This contributor note records the ordinary-library B10 profile. The selected types, names, bounds and behavior below are **implemented and unreleased**. Existing exact `Decimal` support remains in `august.math`; the [ergonomics status](developer-ergonomics-status.md) records the current boundary.

## Existing August support

Immutable records validate in `initialize`, compare by record type and field values, and rerun validation when copied with replacements. Validation cannot rewrite their immutable fields. This supports distinct domain types with public data and checked constructors. [Record rules](../reference.md#classes-records-and-local-state), [record update behavior](../reference.md), [existing validation regressions](../../tests/ergonomics-language.test.mjs).

The candidate already provides strict integer parsing, byte lengths, UTF-8 validation through `codePointLength()`, immutable byte slices, token checks, exact splitting, and invariant integer interpolation. Integer operators wrap, so domain arithmetic should use `august.math` checked operations. There is no public string indexing, regex engine, case conversion, native path model, or general URL parser. Private ASCII scanners can cache `text.bytes()`, slice one byte, decode it strictly, and classify the resulting one-character string; non-ASCII bytes fail that conversion. [Builtin operations](../../src/builtins.ts), [checked integers](../../src/stdlib/math/integers.aug), [ordinary decimal parsing/formatting](../../src/stdlib/math/decimals.aug).

The optional time source library exposes an explicit `Clock.now()` in whole Unix seconds. Its native adapter calls `time()` and rejects negative results. It supplies neither a monotonic clock nor calendar/time-zone conversion. JSON record decoding selects the normal record constructor, and the checker adds its checked errors to the decoding call alongside `JsonError`. [Time contract](../../src/stdlib/time/contracts.aug), [native clock](../../runtime/aug_time.c), [record schemas](../../src/schemas.ts), [decoded-record errors](../../src/checker.ts), [JSON construction](../../runtime/aug_json.c).

## Small public surface

The implementation supplies one pure `august.values` source module, organized internally by domain, with narrow exports and no required clock, filesystem, network, or Unicode-data download. Keep clock adapters in the optional time library. Compiler discovery, package assembly, catalog search and API/sidebar generation share the canonical module registry; the core package manifest and exports include this module. [Current core exports](../../src/stdlib/export.aug), [library discovery](../../src/project.ts), [package assembly](../../scripts/build-packages.mjs).

| Record | Public operations |
| --- | --- |
| `CivilDate(int year, int month, int day)` | `parseCivilDate(text)`, `formatCivilDate(value)`, `compareCivilDates(left, right)` |
| `Duration(int milliseconds)` | `parseDuration(text)`, `formatDuration(value)`, `durationFromSeconds(seconds)`, `addDurations(left, right)`, `compareDurations(left, right)` |
| `TokenId(string text)` | `parseTokenId(text)`, `formatTokenId(value)` |
| `HttpUrl(string text)` | `parseHttpUrl(text)`, `formatHttpUrl(value)` |
| `PortableRelativePath(string text)` | `parsePortableRelativePath(text)`, `formatPortableRelativePath(value)`, `joinPortablePaths(left, right)` |
| `BoundedText(string text, int minBytes, int maxBytes)` | `parseBoundedText(text, minBytes, maxBytes)`, `formatBoundedText(value)` |

Constructors enforce the same invariants as parsers. Parsers return the named record; formatters return `string`; comparisons return -1, 0, or 1; arithmetic and path joining return a new value of their input type. Invalid construction, parsing, bounds, or joined length raises `ConversionError`. Duration arithmetic and second-to-millisecond overflow raise `ArithmeticError`. Internal slice/list `IndexError` and parser arithmetic overflow should become `ConversionError` at the parsing boundary. Catch these specific failures rather than widening the API to `Error`.

The size caps below are August profile choices. Export those choices in Javadoc and generated specs so callers can tell which standard forms are supported.

## Calendar date and fixed duration

**CivilDate:** validate a Gregorian calendar extended backward with years 1..9999, months 1..12, and the actual month's day range. Parse exactly ten ASCII bytes in `YYYY-MM-DD`; reject year zero, whitespace, abbreviated fields, time suffixes, and non-ASCII digits. Format with four/two/two digits. Compare fields directly without subtraction. RFC 3339 specifies the full-date layout and Gregorian leap-year rule; Python's documented date model provides an independent 1..9999 calendar oracle. The year range here is narrower than RFC 3339. [RFC 3339 date grammar](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6), [month restrictions](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.7), [leap years](https://www.rfc-editor.org/rfc/rfc3339.html#appendix-C), [Python date model](https://docs.python.org/3/library/datetime.html#date-objects).

**Duration:** store the complete signed int64 range as exact milliseconds. The selected seconds-only grammar uses: optional minus, `PT`, 1..16 ASCII integer digits, optional dot with 1..3 fractional digits, and `S`; cap input at 24 bytes. Leading zeroes are accepted. Format in an August canonical seconds form with exactly three fractional digits, for example `PT1.250S` or `-PT0.001S`; zero is `PT0.000S`. Reject additional precision and every unsupported unit. This is a subset of XSD dayTimeDuration lexical forms; its canonical formatter is an August contract. XSD separates fixed day/time quantities from year/month quantities, whose ordering can depend on the calendar. [XSD duration](https://www.w3.org/TR/xmlschema11-2/#duration), [dayTimeDuration](https://www.w3.org/TR/xmlschema11-2/#dayTimeDuration).

Parse a negative duration by accumulating negative milliseconds so int64 minimum remains representable. Format its quotient and remainder by 1000 without taking the absolute value of the complete minimum integer. Reuse checked multiplication/addition for conversion and addition. A civil date and a duration do not introduce timestamp, leap-second, time-zone, daylight-saving, or scheduling semantics.

## Identifier and bounded text

**TokenId:** preserve 1..128 ASCII bytes drawn from letters, digits, hyphen, period, underscore, and tilde. Implement validation with existing `isToken(min=1, max=128)`. Formatting returns the stored text; equality is case-sensitive. This is an application identifier profile using RFC 3986's unreserved characters. Language identifiers, UUIDs, normalization, and case folding require separately named contracts. [Unreserved characters](https://www.rfc-editor.org/rfc/rfc3986.html#section-2.3), [current token validator](../../runtime/aug_values.c).

**BoundedText:** retain original valid UTF-8 with explicit inclusive byte limits `0 <= minBytes <= maxBytes <= 1048576`; empty text is valid when the lower bound is zero. Validate byte length and then call `codePointLength()` to verify encoding. Preserve combining sequences and embedded NUL. Its record equality includes both bounds; applications wanting content equality compare `text`. The bound measures storage bytes; scalar, grapheme, and UTF-16 counts stay explicit independent operations. [Current text contracts](../../src/builtins.ts), [UTF-8 validation](../../runtime/aug_values.c), [Unicode encoding validity](https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-3/#G31703), [grapheme research](unicode-graphemes.md).

## HTTP URL and path profiles

**HttpUrl:** the implementation accepts 1..8192 ASCII bytes, absolute HTTP or HTTPS, recognizing scheme letters without regard to ASCII case. Require a DNS-style host of 1..253 bytes with at least one ASCII letter: dot-separated 1..63-byte labels, letters/digits/hyphens, alphanumeric label ends, and no trailing dot. Permit an optional 1..5-digit port from 1..65535. A path, when present, begins with slash and uses RFC 3986 path characters; the query uses its query characters. Every percent sign needs two ASCII hexadecimal digits. Preserve letter case, percent spelling, an empty query, and all other original bytes when formatting. This deliberately leaves IP literals, userinfo, fragments, relative resolution, IDNA conversion, and URI equivalence for later profiles. RFC 9110 defines HTTP(S) authority/path/query; RFC 3986 supplies the component character rules; RFC 1123 permits digit-leading host labels. [HTTP(S) URI schemes](https://www.rfc-editor.org/rfc/rfc9110.html#section-4.2), [URI components](https://www.rfc-editor.org/rfc/rfc3986.html#section-3), [host names](https://www.rfc-editor.org/rfc/rfc1123.html).

The parser checks URI octet syntax, including escaped octets, without decoding it. Stored-text equality is lexical. Formatting performs no DNS lookup or request; HTTP dispatch retains the existing explicit client capability. Check client acceptance separately before describing an adapter overload. [Current HTTP client](../../src/stdlib/web/contracts.aug).

**PortableRelativePath:** the implementation accepts slash-separated ASCII text of 1..1024 bytes with 1..64 segments. Each segment has 1..255 bytes from letters, digits, period, underscore, and hyphen. Reject empty segments, `.` and `..`, a leading/trailing slash, a trailing period, and Windows device basenames without regard to ASCII case, including names followed by extensions. Join with one slash and revalidate the result. Preserve case and spelling; filesystem case equivalence remains adapter-specific. The character selection follows POSIX's portable filename set, and Windows supplies the device/trailing-period exclusions. [POSIX filename set](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap03.html#tag_03_265), [filename portability and resolution](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap04.html), [Windows naming rules](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file).

This value describes lexical path data. Host name/path limits, actual file existence, symbolic-link resolution, and containment are filesystem-adapter responsibilities; a successful constructor grants no I/O capability. Existing file adapters accept their separate string-path contract. [File capabilities](../../src/stdlib/io/contracts.aug).

## Independent qualification vectors

The following fixed expectations precede implementation. The calendar entries were checked against Python's standard date constructor, and the duration extrema were calculated independently with arbitrary-precision integers. Other entries derive from the cited grammars and explicit August profile choices; these expectations remain independent of the implementation. Native execution evidence is recorded separately below.

| Domain | Fixed success expectations | Fixed rejection expectations |
| --- | --- | --- |
| Date | `0001-01-01`, `1582-10-10`, `2000-02-29`, `9999-12-31`; the Gregorian model has no historical cutover gap | `0000-01-01`, `1900-02-29`, `2100-02-29`, `2024-04-31`, `2024-2-09` |
| Duration | `PT1.25S` → 1250 milliseconds → `PT1.250S`; minimum → `-PT9223372036854775.808S`; maximum → `PT9223372036854775.807S` | `PT1.0000S`, `P1M`, `PT1e3S`, `-PT9223372036854775.809S`; maximum plus one raises `ArithmeticError` |
| Token | `A_1-~.` preserves bytes; 128 ASCII bytes pass | empty, 129 bytes, whitespace, slash, non-ASCII |
| URL | RFC example `http://a/b/c/d;p?q`; `HTTPS://Example.com:443/a%2Fb?x=?`; `https://example.com?` retains its empty query | empty host, `example.com:0`, malformed `%`, raw non-ASCII, userinfo, IP literal, fragment, relative reference |
| Path | `docs/reference.md`, `.git/config`, `a-b_c.txt`; joined `docs` and `api/time.md` → `docs/api/time.md` | `/a`, `a//b`, `a/../b`, `a.`, `NUL.txt`, `com1/readme`, backslash, over-limit join |
| Bounded text | `é` needs two UTF-8 bytes; decomposed `e` plus U+0301 needs three; an empty value passes bounds 0..0 | malformed UTF-8, min greater than max, negative bounds, one byte less than the required length |

Test constructors, parsers, formatters, record replacements, and optional JSON decoding on C and LLVM. Add exact boundary cases for every cap, every month and leap-year branch, signs and int64 extremes, percent escapes at end of input, queries containing slash/question mark, reserved names in mixed case, and UTF-8 preservation. Test pure values without depending on the host clock, network, or filesystem. Then run the normal documentation and installed-package gates for the new export surface.

Broader timestamp/calendar arithmetic, IP/IRI URL parsing and resolution, native absolute paths, Unicode identifier profiles, and grapheme-bound text remain separate proposals. Keep B10 described by the implemented profiles when any first implementation lands.

## Implementation evidence

Eighteen direct tests qualified the C and LLVM implementations, editor contracts and API signatures. The calendar constructor/parser grid contains 1,176 rows evaluated independently with the UTC calendar oracle. Other cases cover full int64 duration bounds, arithmetic failures, every text/path/URL cap, NUL and canonical-spelling preservation, constructor validation after record replacement and JSON decoding, and malformed UTF-8 delivered through real native arguments. The final 59-case domain/catalog/editor/documentation run and 68 neighboring interceptor/spec/tooling cases passed. Two signature checks cover inferred constructor errors, short error declarations and legal multiple-interface syntax.

Type checking, 606 generated-file drift checks, the site build, 35 independent conformance examples in 83 checks, package archives, and installed JavaScript consumers on C and LLVM passed. Independent Spec and Standards reviews verified their repairs and reported no remaining scoped findings. The Mac was locked when visual guide inspection was attempted; that check, cold default-LLVM installation and installed VS Code qualification remain pending. These are finite implementation results, not a production or proof claim.
