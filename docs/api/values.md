---
generated: true
source: src/stdlib/values
editLink: false
---

# august.values

**Unreleased:** Supplied with the compiler. Import public names from `august.values`.

Signatures show result types and checked errors. See [packages](../packages.md) to pin a release and [language constructs](../language-constructs.md) for built-in types.

## CivilDate {#api-CivilDate}

```text
record CivilDate(int year, int month, int day) unless ConversionError
```

Gregorian calendar date, including dates before the historical calendar cutover.

**Parameters**
- `year`: Year from 1 to 9999.
- `month`: Month from 1 to 12.
- `day`: Day from 1 to the actual month's length.

**Throws**
- `ConversionError`: Any field is outside the calendar range.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/dates.aug#L10)

## parseCivilDate {#api-parseCivilDate}

```text
parseCivilDate(string text) returns CivilDate unless ConversionError
```

Parse exactly ten ASCII bytes in YYYY-MM-DD form. No whitespace or time suffix is accepted.

**Throws**
- `ConversionError`: Malformed text or an invalid Gregorian date.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/dates.aug#L29)

## formatCivilDate {#api-formatCivilDate}

```text
formatCivilDate(CivilDate value) returns string
```

Format a validated calendar date as YYYY-MM-DD, padding each field with zeroes.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/dates.aug#L43)

## compareCivilDates {#api-compareCivilDates}

```text
compareCivilDates(CivilDate left, CivilDate right) returns int
```

Compare calendar fields chronologically; return -1, 0 or 1 without arithmetic overflow.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/dates.aug#L53)

## Duration {#api-Duration}

```text
record Duration(int milliseconds)
```

Exact signed int64 milliseconds. This value has no calendar, clock or scheduling effects.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/durations.aug#L6)

## parseDuration {#api-parseDuration}

```text
parseDuration(string text) returns Duration unless ConversionError
```

Parse a seconds-only duration: optional minus, PT, 1 to 16 integer digits, optional 1 to 3 fractional digits, then S.
Leading zeroes are accepted; other units, plus signs, spaces and excess precision are rejected.

**Parameters**
- `text`: At most 24 ASCII bytes, such as PT1.25S.

**Throws**
- `ConversionError`: Invalid syntax or a millisecond value outside int64.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/durations.aug#L13)

## formatDuration {#api-formatDuration}

```text
formatDuration(Duration value) returns string
```

Format exact milliseconds as optional minus and PTseconds.fffS, including three fractional digits.
Zero has no sign; the complete int64 range is representable without rounding.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/durations.aug#L52)

## durationFromSeconds {#api-durationFromSeconds}

```text
durationFromSeconds(int seconds) returns Duration unless ArithmeticError
```

Convert whole seconds to exact milliseconds.

**Throws**
- `ArithmeticError`: Multiplication by 1000 overflows int64.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/durations.aug#L70)

## addDurations {#api-addDurations}

```text
addDurations(Duration left, Duration right) returns Duration unless ArithmeticError
```

Add milliseconds without wrapping.

**Throws**
- `ArithmeticError`: The total cannot fit int64.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/durations.aug#L76)

## compareDurations {#api-compareDurations}

```text
compareDurations(Duration left, Duration right) returns int
```

Compare exact millisecond values; return -1, 0 or 1.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/durations.aug#L80)

## TokenId {#api-TokenId}

```text
record TokenId(string text) unless ConversionError
```

Case-sensitive application identifier: 1 to 128 ASCII letters, digits, hyphen, period, underscore or tilde.
This is the RFC 3986 unreserved character set. The original spelling is retained.

**Throws**
- `ConversionError`: Empty, oversized or unsupported text.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/text.aug#L6)

## parseTokenId {#api-parseTokenId}

```text
parseTokenId(string text) returns TokenId unless ConversionError
```

Validate an identifier without normalizing it. Raises ConversionError for the same inputs as TokenId.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/text.aug#L12)

## formatTokenId {#api-formatTokenId}

```text
formatTokenId(TokenId value) returns string
```

Return the original identifier text.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/text.aug#L16)

## BoundedText {#api-BoundedText}

```text
record BoundedText(string text, int minBytes, int maxBytes) unless ConversionError
```

Valid UTF-8 text with inclusive byte bounds. Preserve combining sequences and embedded NUL.

**Parameters**
- `minBytes`: Minimum UTF-8 storage bytes, including zero.
- `maxBytes`: Maximum storage bytes; require minBytes <= maxBytes <= 1048576.

**Throws**
- `ConversionError`: Invalid bounds, length or UTF-8. Equality includes both bounds.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/text.aug#L24)

## parseBoundedText {#api-parseBoundedText}

```text
parseBoundedText(string text, int minBytes, int maxBytes) returns BoundedText unless ConversionError
```

Validate original UTF-8 text and inclusive byte bounds without normalization.

**Throws**
- `ConversionError`: Invalid bounds, length or UTF-8.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/text.aug#L35)

## formatBoundedText {#api-formatBoundedText}

```text
formatBoundedText(BoundedText value) returns string
```

Return the original text, including embedded NUL and combining sequences.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/text.aug#L39)

## HttpUrl {#api-HttpUrl}

```text
record HttpUrl(string text) unless ConversionError
```

Absolute HTTP(S) URL in August's ASCII DNS-host profile; preserve the original spelling.

**Parameters**
- `text`: 1 to 8192 bytes. Hosts use 1 to 253 bytes, labels of 1 to 63 letters/digits/hyphens and at least one letter.
Optional ports are 1 to 65535. Path/query use RFC 3986 characters and checked percent triplets.

**Throws**
- `ConversionError`: Invalid profile text. IP addresses, userinfo, fragments, relative URLs and IDNA are unsupported.
Construction performs no DNS lookup or request. Equality compares original text; it is not URI equivalence.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/urls.aug#L10)

## parseHttpUrl {#api-parseHttpUrl}

```text
parseHttpUrl(string text) returns HttpUrl unless ConversionError
```

Parse the same ASCII HTTP(S)/DNS profile as HttpUrl, preserving case, escapes and an empty query.

**Throws**
- `ConversionError`: Invalid or unsupported URL syntax.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/urls.aug#L17)

## formatHttpUrl {#api-formatHttpUrl}

```text
formatHttpUrl(HttpUrl value) returns string
```

Return the original URL text without decoding, normalizing or accessing a network.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/urls.aug#L21)

## PortableRelativePath {#api-PortableRelativePath}

```text
record PortableRelativePath(string text) unless ConversionError
```

Lexical portable relative path. This value grants no filesystem access or containment guarantee.

**Parameters**
- `text`: 1 to 1024 ASCII bytes in 1 to 64 slash-separated segments of 1 to 255 bytes.
Segments use letters, digits, period, underscore or hyphen. Empty/dot/dot-dot segments, trailing periods and Windows device basenames are rejected.

**Throws**
- `ConversionError`: Invalid characters, reserved names or exceeded bounds.
Equality retains case and spelling; filesystem equivalence, symlinks and host limits remain adapter responsibilities.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/paths.aug#L10)

## parsePortableRelativePath {#api-parsePortableRelativePath}

```text
parsePortableRelativePath(string text) returns PortableRelativePath unless ConversionError
```

Validate the same lexical profile as PortableRelativePath, preserving the original spelling.

**Throws**
- `ConversionError`: Invalid or unsupported path syntax.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/paths.aug#L17)

## formatPortableRelativePath {#api-formatPortableRelativePath}

```text
formatPortableRelativePath(PortableRelativePath value) returns string
```

Return the original slash-separated relative path without accessing a filesystem.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/paths.aug#L21)

## joinPortablePaths {#api-joinPortablePaths}

```text
joinPortablePaths(PortableRelativePath left, PortableRelativePath right) returns PortableRelativePath unless ConversionError
```

Join two validated paths with one slash and revalidate all byte, segment and name limits.

**Throws**
- `ConversionError`: The combined path exceeds the supported bounds.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/paths.aug#L27)

## RetryPolicy {#api-RetryPolicy}

```text
record RetryPolicy(int maxAttempts, immutable List<Duration> delays) unless ConversionError
```

Caller-selected retry delays, stored as deeply immutable data.
Attempts are numbered from one; maxAttempts includes the initial attempt.

**Parameters**
- `maxAttempts`: Total allowed attempts, from 1 to 64.
- `delays`: Exactly maxAttempts - 1 durations, each from 0 to 604800000 milliseconds.
Order, duplicates and zero delays are preserved. Construction performs no operation or wait.

**Throws**
- `ConversionError`: Invalid attempt count, delay count or delay duration.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/retries.aug#L11)

## retryDelay {#api-retryDelay}

```text
retryDelay(RetryPolicy policy, int failedAttempt) returns optional Duration unless ConversionError
```

Read the delay after a failed attempt, or null after the final allowed attempt.
This only reads policy data: it does not retry, sleep, classify an error or choose a recovery value.

**Parameters**
- `failedAttempt`: One-based attempt number, from 1 to policy.maxAttempts.

**Throws**
- `ConversionError`: The attempt number is outside the policy.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/values/retries.aug#L26)
