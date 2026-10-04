// aug-spec: "ranges.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** A range has an invalid step or exceeds its explicit allocation limit. */
error RangeError(string message)

/** Return a new list of integers from start up to, but excluding, end.
 * A step past the int64 boundary stops before producing a wrapped value.
 * @param start First value, default 0.
 * @param end Exclusive boundary.
 * @param step Nonzero increment, default 1; a negative step descends.
 * @param limit Maximum number of allocated elements, default 1000000; permitted from 1 to 1000000.
 * @throws RangeError Invalid step, invalid limit, or too many elements.
 */
range(int end, int start = 0, int step = 1, int limit = 1000000) returns List<int> unless RangeError:
    if step == 0:
        throw RangeError(message="Range step must not be zero")
    if limit < 1 or limit > 1000000:
        throw RangeError(message="Range limit must be from 1 to 1000000")
    List<int> values = []
    current = start
    while (step > 0 and current < end) or (step < 0 and current > end):
        if values.length() == limit:
            throw RangeError(message="Range exceeds its element limit")
        borrow values:
            values.append(value=current)
        nextValue = current + step
        if (step > 0 and nextValue < current) or (step < 0 and nextValue > current):
            break
        current = nextValue
    return values
