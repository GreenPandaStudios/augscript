// aug-spec: "paths.aug.md" explains this file. Read it before changes; refresh with aug spec.
import asciiAt and asciiLetter and asciiLower from ascii

/** Lexical portable relative path. This value grants no filesystem access or containment guarantee.
 * @param text 1 to 1024 ASCII bytes in 1 to 64 slash-separated segments of 1 to 255 bytes.
 * Segments use letters, digits, period, underscore or hyphen. Empty/dot/dot-dot segments, trailing periods and Windows device basenames are rejected.
 * @throws ConversionError Invalid characters, reserved names or exceeded bounds.
 * Equality retains case and spelling; filesystem equivalence, symlinks and host limits remain adapter responsibilities.
 */
record PortableRelativePath(string text):
    initialize:
        _validatePortablePath(text)

/** Validate the same lexical profile as PortableRelativePath, preserving the original spelling.
 * @throws ConversionError Invalid or unsupported path syntax.
 */
parsePortableRelativePath(string text):
    return PortableRelativePath(text)

/** Return the original slash-separated relative path without accessing a filesystem. */
formatPortableRelativePath(PortableRelativePath value):
    return value.text

/** Join two validated paths with one slash and revalidate all byte, segment and name limits.
 * @throws ConversionError The combined path exceeds the supported bounds.
 */
joinPortablePaths(PortableRelativePath left, PortableRelativePath right):
    return PortableRelativePath(text=left.text + "/" + right.text)

_validatePortablePath(string text):
    if text.byteLength() == 0 or text.byteLength() > 1024:
        throw ConversionError()
    segments = text.split(separator="/")
    if segments.length() > 64:
        throw ConversionError()
    for segment in segments:
        if segment.byteLength() == 0 or segment.byteLength() > 255 or segment == "." or segment == ".." or segment.endsWith(suffix="."):
            throw ConversionError()
        bytes = segment.bytes()
        index = 0
        while index < segment.byteLength():
            character = asciiAt(input=bytes, index)
            if not asciiLetter(character) and not character.isDecimal() and character != "." and character != "_" and character != "-":
                throw ConversionError()
            index = index + 1
        try:
            basename = asciiLower(text=segment.split(separator=".").get(index=0))
            if _reserved(basename):
                throw ConversionError()
        catch IndexError failure:
            throw ConversionError()

_reserved(string basename):
    return (
        basename == "con" or
        basename == "prn" or
        basename == "aux" or
        basename == "nul" or
        basename == "com1" or
        basename == "com2" or
        basename == "com3" or
        basename == "com4" or
        basename == "com5" or
        basename == "com6" or
        basename == "com7" or
        basename == "com8" or
        basename == "com9" or
        basename == "lpt1" or
        basename == "lpt2" or
        basename == "lpt3" or
        basename == "lpt4" or
        basename == "lpt5" or
        basename == "lpt6" or
        basename == "lpt7" or
        basename == "lpt8" or
        basename == "lpt9"
    )
