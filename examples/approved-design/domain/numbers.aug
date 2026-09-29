/** Raised when an input is outside the operation's domain. */
RangeError(int value) implements Error:
	pass
/** A pure validation layer, shared by any compatible callable. */
interceptor Positive<T>():
	around(int amount) returns T unless RangeError:
		if amount < 0:
			throw RangeError(value=amount)
		return next()
/**
* Double a nonnegative amount.
* @param amount Integer to double.
* @return Twice the amount, with defined integer wrapping.
* @throws RangeError A validation layer rejected a negative input.
*/
[Positive]
double(int amount) returns int:
	return amount * 2
test double:
	when "positive":
		it "doubles" for (input, expected) in [(0, 0), (3, 6), (7, 14)]:
			assert(double(amount=input) == expected)
		it "rejects_negative":
			bool rejected to false
			try:
				double(amount=-1)
			catch RangeError error:
				rejected to error.value == -1
			assert(rejected)
