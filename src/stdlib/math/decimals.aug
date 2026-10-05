// aug-spec: "decimals.aug.md" explains this file. Read it before changes; refresh with aug spec.
import checkedAdd and checkedSubtract and checkedMultiply and checkedDivide from integers

/** Exact decimal data: coefficient times 10 to the negative scale.
 * @param coefficient Signed int64 digits; no floating-point conversion occurs.
 * @param scale Fractional digits from 0 to 18. Scale remains part of record equality.
 * @throws ConversionError Scale is outside 0 to 18.
 */
record Decimal(int coefficient, int scale):
    initialize:
        if scale < 0 or scale > 18:
            throw ConversionError()

/** Parse up to 64 ASCII characters: optional minus, integer digits, and an optional dot with 1 to 18 fractional digits.
 * Leading zeroes are accepted. Plus, whitespace, exponent notation and non-ASCII digits are rejected.
 * @throws ConversionError Invalid text, scale, or int64 coefficient. Negative zero loses its sign.
 */
parseDecimal(string text):
    if text.length() == 0 or text.length() > 64:
        throw ConversionError()
    parts = text.split(separator=".")
    if parts.length() > 2:
        throw ConversionError()
    scale = 0
    try:
        if parts.length() == 2:
            whole = parts.get(index=0)
            fraction = parts.get(index=1)
            if whole == "" or whole == "-" or not fraction.isDecimal() or fraction.length() > 18:
                throw ConversionError()
            scale = fraction.length()
    catch IndexError error:
        throw ConversionError()
    coefficient = parts.join(separator="").parseInteger()
    return Decimal(coefficient, scale)

/** Format invariant ASCII text with the recorded scale, including trailing fractional zeroes. */
formatDecimal(Decimal value):
    remaining = value.coefficient
    written = 0
    result = ""
    while remaining != 0 or written <= value.scale:
        if written == value.scale and value.scale > 0:
            result = "." + result
        digit = remaining % 10
        if digit < 0:
            digit = -digit
        result = $"{digit}" + result
        remaining = remaining / 10
        written = written + 1
    if value.coefficient < 0:
        result = "-" + result
    return result

/** Change fractional scale exactly, adding or removing trailing zeroes without rounding.
 * @throws ConversionError Invalid target scale.
 * @throws ArithmeticError Precision would be discarded or an intermediate coefficient would overflow.
 */
rescaleDecimal(Decimal value, int scale):
    if scale < 0 or scale > 18:
        throw ConversionError()
    coefficient = value.coefficient
    current = value.scale
    while current < scale:
        coefficient = checkedMultiply(left=coefficient, right=10)
        current = current + 1
    while current > scale:
        if coefficient % 10 != 0:
            throw ArithmeticError()
        coefficient = coefficient / 10
        current = current - 1
    return Decimal(coefficient, scale)

/** Add at the greater operand scale. Alignment and the sum must each fit int64. */
addDecimals(Decimal left, Decimal right):
    scale = left.scale
    if scale < right.scale:
        scale = right.scale
    alignedLeft = rescaleDecimal(value=left, scale=scale)
    alignedRight = rescaleDecimal(value=right, scale=scale)
    return Decimal(coefficient=checkedAdd(left=alignedLeft.coefficient, right=alignedRight.coefficient), scale=scale)

/** Subtract at the greater operand scale. Alignment and the difference must each fit int64. */
subtractDecimals(Decimal left, Decimal right):
    scale = left.scale
    if scale < right.scale:
        scale = right.scale
    alignedLeft = rescaleDecimal(value=left, scale=scale)
    alignedRight = rescaleDecimal(value=right, scale=scale)
    return Decimal(coefficient=checkedSubtract(left=alignedLeft.coefficient, right=alignedRight.coefficient), scale=scale)

/** Multiply coefficients and add scales. Reject a scale above 18 or an int64 product overflow. */
multiplyDecimals(Decimal left, Decimal right):
    return Decimal(coefficient=checkedMultiply(left=left.coefficient, right=right.coefficient), scale=left.scale + right.scale)

/** Divide at an explicit scale, requiring an exact result. No rounding mode is chosen implicitly.
 * @throws ConversionError Target scale is outside 0 to 18.
 * @throws ArithmeticError Zero divisor, inexact result, or an intermediate int64 overflow.
 */
divideDecimals(Decimal left, Decimal right, int scale):
    if scale < 0 or scale > 18:
        throw ConversionError()
    if right.coefficient == 0:
        throw ArithmeticError()
    numerator = left.coefficient
    denominator = right.coefficient
    adjustment = right.scale - left.scale + scale
    while adjustment > 0:
        numerator = checkedMultiply(left=numerator, right=10)
        adjustment = adjustment - 1
    while adjustment < 0:
        denominator = checkedMultiply(left=denominator, right=10)
        adjustment = adjustment + 1
    if numerator % denominator != 0:
        throw ArithmeticError()
    return Decimal(coefficient=checkedDivide(left=numerator, right=denominator), scale=scale)

/** Compare numeric decimal values; return -1, 0, or 1. Equal values can have different recorded scales.
 * Digit comparison avoids coefficient-alignment overflow. No floating-point conversion occurs.
 */
compareDecimals(Decimal left, Decimal right):
    if left.coefficient < 0 and right.coefficient >= 0:
        return -1
    if left.coefficient >= 0 and right.coefficient < 0:
        return 1
    leftDigits = $"{left.coefficient}".split(separator="-").join(separator="")
    rightDigits = $"{right.coefficient}".split(separator="-").join(separator="")
    leftScale = left.scale
    rightScale = right.scale
    while leftScale < rightScale:
        leftDigits = leftDigits + "0"
        leftScale = leftScale + 1
    while rightScale < leftScale:
        rightDigits = rightDigits + "0"
        rightScale = rightScale + 1
    result = leftDigits.compareDecimal(other=rightDigits)
    if left.coefficient < 0:
        return -result
    return result
