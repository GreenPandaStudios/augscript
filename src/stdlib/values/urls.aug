// aug-spec: "urls.aug.md" explains this file. Read it before changes; refresh with aug spec.
import asciiAt and asciiSlice and asciiLetter and asciiLower from ascii

/** Absolute HTTP(S) URL in August's ASCII DNS-host profile; preserve the original spelling.
 * @param text 1 to 8192 bytes. Hosts use 1 to 253 bytes, labels of 1 to 63 letters/digits/hyphens and at least one letter.
 * Optional ports are 1 to 65535. Path/query use RFC 3986 characters and checked percent triplets.
 * @throws ConversionError Invalid profile text. IP addresses, userinfo, fragments, relative URLs and IDNA are unsupported.
 * Construction performs no DNS lookup or request. Equality compares original text; it is not URI equivalence.
 */
record HttpUrl(string text):
    initialize:
        _validateHttpUrl(text)

/** Parse the same ASCII HTTP(S)/DNS profile as HttpUrl, preserving case, escapes and an empty query.
 * @throws ConversionError Invalid or unsupported URL syntax.
 */
parseHttpUrl(string text):
    return HttpUrl(text)

/** Return the original URL text without decoding, normalizing or accessing a network. */
formatHttpUrl(HttpUrl value):
    return value.text

_validateHttpUrl(string text):
    if text.byteLength() < 8 or text.byteLength() > 8192:
        throw ConversionError()
    bytes = text.bytes()
    start = 7
    scheme = asciiLower(text=asciiSlice(input=bytes, start=0, end=7))
    if scheme != "http://":
        if text.byteLength() < 9 or asciiLower(text=asciiSlice(input=bytes, start=0, end=8)) != "https://":
            throw ConversionError()
        start = 8
    end = start
    while end < text.byteLength():
        character = asciiAt(input=bytes, index=end)
        if character == "/" or character == "?":
            break
        end = end + 1
    authority = asciiSlice(input=bytes, start, end)
    _validateAuthority(authority)
    index = end
    while index < text.byteLength():
        character = asciiAt(input=bytes, index)
        if character == "?":
            pass
        else:
            if character == "%":
                if index + 2 >= text.byteLength():
                    throw ConversionError()
                if not _hex(character=asciiAt(input=bytes, index=index + 1)) or not _hex(character=asciiAt(input=bytes, index=index + 2)):
                    throw ConversionError()
                index = index + 2
            else:
                if not _pathCharacter(character) and character != "/":
                    throw ConversionError()
        index = index + 1

_validateAuthority(string authority):
    parts = authority.split(separator=":")
    if parts.length() > 2:
        throw ConversionError()
    try:
        host = parts.get(index=0)
        if host.byteLength() == 0 or host.byteLength() > 253:
            throw ConversionError()
        hasLetter = false
        for label in host.split(separator="."):
            if label.byteLength() == 0 or label.byteLength() > 63:
                throw ConversionError()
            bytes = label.bytes()
            index = 0
            while index < label.byteLength():
                character = asciiAt(input=bytes, index)
                letter = asciiLetter(character)
                alphanumeric = letter or character.isDecimal()
                if not alphanumeric and (character != "-" or index == 0 or index == label.byteLength() - 1):
                    throw ConversionError()
                hasLetter = hasLetter or letter
                index = index + 1
        if not hasLetter:
            throw ConversionError()
        if parts.length() == 2:
            port = parts.get(index=1)
            if not port.isDecimal() or port.byteLength() > 5:
                throw ConversionError()
            number = port.parseInteger()
            if number < 1 or number > 65535:
                throw ConversionError()
    catch IndexError failure:
        throw ConversionError()

_pathCharacter(string character):
    return (
        character.isToken(min=1, max=1) or
        character == ":" or
        character == "@" or
        character == "!" or
        character == "$" or
        character == "&" or
        character == "'" or
        character == "(" or
        character == ")" or
        character == "*" or
        character == "+" or
        character == "," or
        character == ";" or
        character == "="
    )

_hex(string character):
    return (
        character.isDecimal() or
        (character.compare(other="A") >= 0 and character.compare(other="F") <= 0) or
        (character.compare(other="a") >= 0 and character.compare(other="f") <= 0)
    )
