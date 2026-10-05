// aug-spec: "text.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Case-sensitive application identifier: 1 to 128 ASCII letters, digits, hyphen, period, underscore or tilde.
 * This is the RFC 3986 unreserved character set. The original spelling is retained.
 * @throws ConversionError Empty, oversized or unsupported text.
 */
record TokenId(string text):
    initialize:
        if not text.isToken(min=1, max=128):
            throw ConversionError()

/** Validate an identifier without normalizing it. Raises ConversionError for the same inputs as TokenId. */
parseTokenId(string text):
    return TokenId(text)

/** Return the original identifier text. */
formatTokenId(TokenId value):
    return value.text

/** Valid UTF-8 text with inclusive byte bounds. Preserve combining sequences and embedded NUL.
 * @param minBytes Minimum UTF-8 storage bytes, including zero.
 * @param maxBytes Maximum storage bytes; require minBytes <= maxBytes <= 1048576.
 * @throws ConversionError Invalid bounds, length or UTF-8. Equality includes both bounds.
 */
record BoundedText(string text, int minBytes, int maxBytes):
    initialize:
        if minBytes < 0 or minBytes > maxBytes or maxBytes > 1048576:
            throw ConversionError()
        if text.byteLength() < minBytes or text.byteLength() > maxBytes:
            throw ConversionError()
        text.codePointLength()

/** Validate original UTF-8 text and inclusive byte bounds without normalization.
 * @throws ConversionError Invalid bounds, length or UTF-8.
 */
parseBoundedText(string text, int minBytes, int maxBytes):
    return BoundedText(text, minBytes, maxBytes)

/** Return the original text, including embedded NUL and combining sequences. */
formatBoundedText(BoundedText value):
    return value.text
