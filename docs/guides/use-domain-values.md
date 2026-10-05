# Validate values at the boundary

The unreleased `august.values` module gives ordinary data a checked type. Use it when text has a meaning beyond “some string”: a calendar date, a URL, an identifier or a relative path. Construction validates the value once. Code that receives that type can rely on its documented limits.

## Parse and keep a typed value

Put this in **main.aug**:

```aug project=domain-values-guide file=main.aug
import parseCivilDate and formatCivilDate from august.values
import parseDuration and formatDuration from august.values
import TokenId and HttpUrl from august.values
import PortableRelativePath and joinPortablePaths from august.values
import BoundedText from august.values

try:
    date = parseCivilDate(text="2000-02-29")
    elapsed = parseDuration(text="PT1.25S")
    identifier = TokenId(text="order_42")
    address = HttpUrl(text="https://api.example.com/orders")
    basePath = PortableRelativePath(text="docs")
    page = PortableRelativePath(text="api/time.md")
    path = joinPortablePaths(left=basePath, right=page)
    title = BoundedText(text="Résumé", minBytes=0, maxBytes=128)

    print(value=formatCivilDate(value=date))
    print(value=formatDuration(value=elapsed))
    print(value=identifier.text)
    print(value=address.text)
    print(value=path.text)
    print(value=title.text)
catch ConversionError failure:
    print(value="The input does not fit the required value")
```

Run `aug run .`. It prints the date, `PT1.250S`, the identifier, the URL, `docs/api/time.md` and the title on separate lines. The duration formatter supplies exactly three fractional digits; the URL, identifier, path and title retain their original spelling.

A record constructor checks the same rules as its parser. Copying with changed fields and decoding JSON into these records also run validation. For example, changing a leap-day date's year from 2000 to 1900 raises `ConversionError`. The original record remains valid.

## Choose a precise contract

| Value | Accepted data |
| --- | --- |
| `CivilDate` | Gregorian year 1–9999, month 1–12 and a valid day. Parsing requires exactly `YYYY-MM-DD`; formatting pads each field. |
| `Duration` | Exact signed int64 milliseconds. Parsing accepts optional minus, `PT`, 1–16 seconds digits, optional 1–3 fractional digits, and `S`, within 24 ASCII bytes. |
| `TokenId` | 1–128 ASCII letters, digits, hyphen, period, underscore or tilde. Equality is case-sensitive. |
| `HttpUrl` | At most 8192 ASCII bytes; HTTP(S), a DNS-style host containing a letter, an optional port 1–65535, and path/query characters with valid percent triplets. |
| `PortableRelativePath` | 1–1024 ASCII bytes, up to 64 slash-separated segments of 1–255 bytes. Letters, digits, period, underscore and hyphen are accepted. |
| `RetryPolicy` | 1–64 total attempts and exactly one fewer immutable delays, each 0–604800000 milliseconds. |
| `BoundedText` | Original valid UTF-8 with inclusive byte bounds `0 <= minBytes <= maxBytes <= 1048576`. Empty text is valid when the minimum is zero. |

A duration has no calendar units or clock behavior. `durationFromSeconds` and `addDurations` raise `ArithmeticError` instead of wrapping. Dates and durations have separate comparison functions that return -1, 0 or 1. Decimal arithmetic belongs to [`august.math`](../api/math.md).

The URL type deliberately accepts a DNS-host profile. It rejects IP addresses, userinfo, fragments, relative URLs and non-ASCII host names. Scheme letters ignore ASCII case; formatting preserves case, escapes and an empty query. Equality compares the stored text, so differently spelled URLs can compare unequal even if they identify the same resource. An HTTP adapter still checks its own request requirements.

A portable path rejects empty, `.` and `..` segments, trailing periods and Windows device basenames such as `NUL.txt` or `com1`. Joining paths rechecks the combined byte and segment limits. It describes lexical path data: filesystem limits, existence, symbolic links and containment still belong to the file adapter.

## Describe retries with data

Use a `RetryPolicy` to keep the allowed attempts and delays beside the operation that will use them. `maxAttempts` includes the first attempt. The delays stay in the order you supply; zero, repeated and decreasing delays are valid.

Put this in **main.aug**:

```aug project=retry-policy-guide file=main.aug
import Duration and RetryPolicy and retryDelay from august.values

try:
    policy = RetryPolicy(
        maxAttempts=3,
        delays=[Duration(milliseconds=100), Duration(milliseconds=500)]
    )
    for attempt in [1, 2, 3]:
        match retryDelay(policy, failedAttempt=attempt):
            when some delay:
                print(value=$"After attempt {attempt}: {delay.milliseconds} ms")
            when null:
                print(value="No attempts remain")
catch ConversionError failure:
    print(value="Invalid retry policy or attempt")
```

It prints a 100 ms delay after attempt one, a 500 ms delay after attempt two, and `No attempts remain` after attempt three. An attempt number outside 1–`maxAttempts` raises `ConversionError`; null means the final allowed attempt failed.

The record stores deeply immutable delays. A fresh literal works as shown; freeze an existing list before passing it. Record updates and JSON decoding recheck the attempt count and every delay. Copied policy data can cross a worker boundary.

The policy only describes attempts. It performs no sleep, scheduling or operation. The code that uses it must choose which errors are retryable and whether repeating an operation is appropriate. General timer and retry-execution helpers remain planned.

## Keep validation separate from effects

These records make no network request, filesystem access or clock read. A successful constructor grants no capability. Pass their text to an explicitly selected adapter when you perform I/O, and handle that adapter's errors separately.

`BoundedText` counts storage bytes and preserves embedded NUL and combining sequences. Its equality includes both bounds; compare `.text` when you want content equality. Choose [scalar or grapheme operations](measure-text.md) explicitly for user-facing text work. The [API reference](../api/values.md) lists every parser, formatter, constructor and checked failure.
