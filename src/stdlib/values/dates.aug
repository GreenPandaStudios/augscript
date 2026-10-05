// aug-spec: "dates.aug.md" explains this file. Read it before changes; refresh with aug spec.
import asciiSlice from ascii

/** Gregorian calendar date, including dates before the historical calendar cutover.
 * @param year Year from 1 to 9999.
 * @param month Month from 1 to 12.
 * @param day Day from 1 to the actual month's length.
 * @throws ConversionError Any field is outside the calendar range.
 */
record CivilDate(int year, int month, int day):
    initialize:
        if year < 1 or year > 9999 or month < 1 or month > 12:
            throw ConversionError()
        if day < 1 or day > _daysInMonth(year, month):
            throw ConversionError()

_daysInMonth(int year, int month):
    if month == 2:
        if year % 400 == 0 or (year % 4 == 0 and year % 100 != 0):
            return 29
        return 28
    if month == 4 or month == 6 or month == 9 or month == 11:
        return 30
    return 31

/** Parse exactly ten ASCII bytes in YYYY-MM-DD form. No whitespace or time suffix is accepted.
 * @throws ConversionError Malformed text or an invalid Gregorian date.
 */
parseCivilDate(string text):
    if text.byteLength() != 10:
        throw ConversionError()
    bytes = text.bytes()
    year = asciiSlice(input=bytes, start=0, end=4)
    month = asciiSlice(input=bytes, start=5, end=7)
    day = asciiSlice(input=bytes, start=8, end=10)
    if asciiSlice(input=bytes, start=4, end=5) != "-" or asciiSlice(input=bytes, start=7, end=8) != "-":
        throw ConversionError()
    if not year.isDecimal() or not month.isDecimal() or not day.isDecimal():
        throw ConversionError()
    return CivilDate(year=year.parseInteger(), month=month.parseInteger(), day=day.parseInteger())

/** Format a validated calendar date as YYYY-MM-DD, padding each field with zeroes. */
formatCivilDate(CivilDate value):
    return _pad(value=value.year, width=4) + "-" + _pad(value=value.month, width=2) + "-" + _pad(value=value.day, width=2)

_pad(int value, int width):
    text = $"{value}"
    while text.byteLength() < width:
        text = "0" + text
    return text

/** Compare calendar fields chronologically; return -1, 0 or 1 without arithmetic overflow. */
compareCivilDates(CivilDate left, CivilDate right):
    if left.year < right.year:
        return -1
    if left.year > right.year:
        return 1
    if left.month < right.month:
        return -1
    if left.month > right.month:
        return 1
    if left.day < right.day:
        return -1
    if left.day > right.day:
        return 1
    return 0
