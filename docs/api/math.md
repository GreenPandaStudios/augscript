---
generated: true
source: src/stdlib/math
editLink: false
---

# august.math

**Unreleased:** Supplied with the compiler. Import public names from `august.math`.

Signatures show result types and checked errors. See [packages](../packages.md) to pin a release and [language constructs](../language-constructs.md) for built-in types.

## checkedAdd {#api-checkedAdd}

```text
checkedAdd(int left, int right) returns int unless ArithmeticError
```

Add signed int64 values; raise ArithmeticError instead of wrapping on overflow.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/integers.aug#L3)

## checkedSubtract {#api-checkedSubtract}

```text
checkedSubtract(int left, int right) returns int unless ArithmeticError
```

Subtract signed int64 values; raise ArithmeticError instead of wrapping on overflow.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/integers.aug#L10)

## checkedMultiply {#api-checkedMultiply}

```text
checkedMultiply(int left, int right) returns int unless ArithmeticError
```

Multiply signed int64 values; raise ArithmeticError if the product cannot fit.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/integers.aug#L17)

## checkedDivide {#api-checkedDivide}

```text
checkedDivide(int left, int right) returns int unless ArithmeticError
```

Divide toward zero; reject a zero divisor and the unrepresentable MIN / -1 result.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/integers.aug#L28)

## checkedNegate {#api-checkedNegate}

```text
checkedNegate(int value) returns int unless ArithmeticError
```

Negate a signed int64 value; MIN cannot be negated and raises ArithmeticError.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/integers.aug#L34)

## checkedAbs {#api-checkedAbs}

```text
checkedAbs(int value) returns int unless ArithmeticError
```

Return the absolute value; MIN has no representable absolute value.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/integers.aug#L40)

## checkedSum {#api-checkedSum}

```text
checkedSum(List<int> values) returns int unless ArithmeticError
```

Sum values in list order; reject overflow at any intermediate addition. An empty list returns zero.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/integers.aug#L46)

## Decimal {#api-Decimal}

```text
record Decimal(int coefficient, int scale)
```

Exact decimal data: coefficient times 10 to the negative scale.

**Parameters**
- `coefficient`: Signed int64 digits; no floating-point conversion occurs.
- `scale`: Fractional digits from 0 to 18. Scale remains part of record equality.

**Throws**
- `ConversionError`: Scale is outside 0 to 18.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/decimals.aug#L9)

## parseDecimal {#api-parseDecimal}

```text
parseDecimal(string text) returns Decimal unless ConversionError
```

Parse up to 64 ASCII characters: optional minus, integer digits, and an optional dot with 1 to 18 fractional digits.
Leading zeroes are accepted. Plus, whitespace, exponent notation and non-ASCII digits are rejected.

**Throws**
- `ConversionError`: Invalid text, scale, or int64 coefficient. Negative zero loses its sign.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/decimals.aug#L18)

## formatDecimal {#api-formatDecimal}

```text
formatDecimal(Decimal value) returns string
```

Format invariant ASCII text with the recorded scale, including trailing fractional zeroes.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/decimals.aug#L38)

## rescaleDecimal {#api-rescaleDecimal}

```text
rescaleDecimal(Decimal value, int scale) returns Decimal unless ArithmeticError and ConversionError
```

Change fractional scale exactly, adding or removing trailing zeroes without rounding.

**Throws**
- `ConversionError`: Invalid target scale.
- `ArithmeticError`: Precision would be discarded or an intermediate coefficient would overflow.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/decimals.aug#L59)

## addDecimals {#api-addDecimals}

```text
addDecimals(Decimal left, Decimal right) returns Decimal unless ArithmeticError and ConversionError
```

Add at the greater operand scale. Alignment and the sum must each fit int64.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/decimals.aug#L75)

## subtractDecimals {#api-subtractDecimals}

```text
subtractDecimals(Decimal left, Decimal right) returns Decimal unless ArithmeticError and ConversionError
```

Subtract at the greater operand scale. Alignment and the difference must each fit int64.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/decimals.aug#L84)

## multiplyDecimals {#api-multiplyDecimals}

```text
multiplyDecimals(Decimal left, Decimal right) returns Decimal unless ArithmeticError and ConversionError
```

Multiply coefficients and add scales. Reject a scale above 18 or an int64 product overflow.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/decimals.aug#L93)

## divideDecimals {#api-divideDecimals}

```text
divideDecimals(Decimal left, Decimal right, int scale) returns Decimal unless ArithmeticError and ConversionError
```

Divide at an explicit scale, requiring an exact result. No rounding mode is chosen implicitly.

**Throws**
- `ConversionError`: Target scale is outside 0 to 18.
- `ArithmeticError`: Zero divisor, inexact result, or an intermediate int64 overflow.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/decimals.aug#L100)

## compareDecimals {#api-compareDecimals}

```text
compareDecimals(Decimal left, Decimal right) returns int unless ConversionError
```

Compare numeric decimal values; return -1, 0, or 1. Equal values can have different recorded scales.
Digit comparison avoids coefficient-alignment overflow. No floating-point conversion occurs.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/math/decimals.aug#L121)
