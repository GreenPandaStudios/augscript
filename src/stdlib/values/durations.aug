// aug-spec: "durations.aug.md" explains this file. Read it before changes; refresh with aug spec.
import checkedAdd and checkedMultiply from august.math
import asciiSlice from ascii

/** Exact signed int64 milliseconds. This value has no calendar, clock or scheduling effects. */
record Duration(int milliseconds)

/** Parse a seconds-only duration: optional minus, PT, 1 to 16 integer digits, optional 1 to 3 fractional digits, then S.
 * Leading zeroes are accepted; other units, plus signs, spaces and excess precision are rejected.
 * @param text At most 24 ASCII bytes, such as PT1.25S.
 * @throws ConversionError Invalid syntax or a millisecond value outside int64.
 */
parseDuration(string text):
    if text.byteLength() < 4 or text.byteLength() > 24:
        throw ConversionError()
    negative = text.startsWith(prefix="-")
    start = 2
    if negative:
        if not text.startsWith(prefix="-PT"):
            throw ConversionError()
        start = 3
    else:
        if not text.startsWith(prefix="PT"):
            throw ConversionError()
    if not text.endsWith(suffix="S"):
        throw ConversionError()
    body = asciiSlice(input=text.bytes(), start, end=text.byteLength() - 1)
    parts = body.split(separator=".")
    if parts.length() > 2:
        throw ConversionError()
    try:
        whole = parts.get(index=0)
        if not whole.isDecimal() or whole.byteLength() > 16:
            throw ConversionError()
        fraction = "000"
        if parts.length() == 2:
            fraction = parts.get(index=1)
            if not fraction.isDecimal() or fraction.byteLength() > 3:
                throw ConversionError()
            while fraction.byteLength() < 3:
                fraction = fraction + "0"
        digits = whole + fraction
        if negative:
            digits = "-" + digits
        return Duration(milliseconds=digits.parseInteger())
    catch IndexError failure:
        throw ConversionError()

/** Format exact milliseconds as optional minus and PTseconds.fffS, including three fractional digits.
 * Zero has no sign; the complete int64 range is representable without rounding.
 */
formatDuration(Duration value):
    seconds = value.milliseconds / 1000
    remainder = value.milliseconds % 1000
    if seconds < 0:
        seconds = -seconds
    if remainder < 0:
        remainder = -remainder
    fraction = $"{remainder}"
    while fraction.byteLength() < 3:
        fraction = "0" + fraction
    result = $"PT{seconds}.{fraction}S"
    if value.milliseconds < 0:
        return "-" + result
    return result

/** Convert whole seconds to exact milliseconds.
 * @throws ArithmeticError Multiplication by 1000 overflows int64.
 */
durationFromSeconds(int seconds):
    return Duration(milliseconds=checkedMultiply(left=seconds, right=1000))

/** Add milliseconds without wrapping.
 * @throws ArithmeticError The total cannot fit int64.
 */
addDurations(Duration left, Duration right):
    return Duration(milliseconds=checkedAdd(left=left.milliseconds, right=right.milliseconds))

/** Compare exact millisecond values; return -1, 0 or 1. */
compareDurations(Duration left, Duration right):
    if left.milliseconds < right.milliseconds:
        return -1
    if left.milliseconds > right.milliseconds:
        return 1
    return 0
