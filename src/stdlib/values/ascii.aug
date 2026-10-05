// aug-spec: "ascii.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Internal bounded byte slice; retain a single ConversionError parsing boundary. */
asciiSlice(Bytes input, int start, int end):
    try:
        return input.slice(start, end).text()
    catch IndexError failure:
        throw ConversionError()

/** Internal single-byte read. Multibyte UTF-8 fragments are rejected. */
asciiAt(Bytes input, int index):
    return asciiSlice(input, start=index, end=index + 1)

/** Internal ASCII letter classification. */
asciiLetter(string character):
    return (
        (character.compare(other="A") >= 0 and character.compare(other="Z") <= 0) or
        (character.compare(other="a") >= 0 and character.compare(other="z") <= 0)
    )

/** Internal case folding for already validated ASCII components only. */
asciiLower(string text):
    result = text
    upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".bytes()
    lower = "abcdefghijklmnopqrstuvwxyz".bytes()
    index = 0
    while index < 26:
        result = result.replace(search=asciiAt(input=upper, index), replacement=asciiAt(input=lower, index))
        index = index + 1
    return result
