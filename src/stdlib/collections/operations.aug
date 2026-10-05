// aug-spec: "operations.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** A pure decision about one data value. */
interface Predicate<in T implements optional Data>:
    accepts(T value) returns bool

/** A pure transformation of one data value into another. */
interface Transformation<in T implements optional Data, out U implements optional Data>:
    apply(T value) returns U

/** A pure aggregation step; the caller chooses the initial total. */
interface Aggregator<in T implements optional Data, U implements optional Data>:
    combine(U total, T value) returns U

/** A pure ordering: negative before, zero equal, positive after. Supply a consistent total order. */
interface Comparator<in T implements optional Data>:
    compare(T left, T right) returns int

/** Return a new list of matching values in snapshot order; an empty input returns an empty list.
 * Read references without copying their contents or granting mutable access.
 */
filter<T implements optional Data>(List<T> values, Predicate<T> predicate) returns List<T>:
    List<T> selected = []
    for value in values:
        if predicate.accepts(value):
            borrow selected:
                selected.append(value)
    return selected

/** Transform every snapshot value once, preserving order in a new list.
 * An empty input returns an empty list. Transformations cannot mutate inputs or perform I/O.
 */
transform<T implements optional Data, U implements optional Data>(List<T> values, Transformation<T, U> transformation) returns List<U>:
    List<U> transformed = []
    for value in values:
        result = transformation.apply(value)
        borrow transformed:
            transformed.append(value=result)
    return transformed

/** Combine snapshot values from left to right, starting with initial.
 * An empty input returns initial. This operation does not choose a numeric overflow policy.
 */
aggregate<T implements optional Data, U implements optional Data>(List<T> values, Aggregator<T, U> aggregator, U initial) returns U:
    total = initial
    for value in values:
        total = aggregator.combine(total, value)
    return total

/** Return a new list without matching values, preserving snapshot order; do not mutate values. */
remove<T implements optional Data>(List<T> values, Predicate<T> predicate) returns List<T>:
    List<T> remaining = []
    for value in values:
        if not predicate.accepts(value):
            borrow remaining:
                remaining.append(value)
    return remaining

/** Read the first matching snapshot value or null, stopping after the first match.
 * A matching null value is also null; use an explicit loop when presence must be distinguished.
 */
find<T implements optional Data>(List<T> values, Predicate<T> predicate) returns optional T:
    for value in values:
        if predicate.accepts(value):
            return value
    return null

/** Return a stably sorted copy. Equal values keep their input order; values remains unchanged.
 * Bottom-up merging uses O(n log n) comparisons and O(n) additional elements per merge pass; retained allocation depends on collection by the runtime.
 * Checked indexed reads retain IndexError in the contract; internal indices stay within the snapshot.
 */
sort<T implements optional Data>(List<T> values, Comparator<T> comparator) returns List<T> unless IndexError:
    List<T> ordered = []
    for value in values:
        borrow ordered:
            ordered.append(value)
    length = ordered.length()
    width = 1
    while width < length:
        List<T> merged = []
        start = 0
        while start < length:
            middle = length
            if width < length - start:
                middle = start + width
            end = length
            if width < length - middle:
                end = middle + width
            left = start
            right = middle
            while left < middle and right < end:
                earlier = ordered.get(index=left)
                later = ordered.get(index=right)
                if comparator.compare(left=earlier, right=later) <= 0:
                    borrow merged:
                        merged.append(value=earlier)
                    left = left + 1
                else:
                    borrow merged:
                        merged.append(value=later)
                    right = right + 1
            while left < middle:
                value = ordered.get(index=left)
                borrow merged:
                    merged.append(value)
                left = left + 1
            while right < end:
                value = ordered.get(index=right)
                borrow merged:
                    merged.append(value)
                right = right + 1
            start = end
        ordered = merged
        if width >= length - width:
            width = length
        else:
            width = width + width
    return ordered

/** Order integers without subtracting and overflowing at the int64 boundaries. */
IntegerOrder() implements Comparator<int>:
    compare(int left, int right):
        if left < right:
            return -1
        if left > right:
            return 1
        return 0

/** Order unsigned UTF-8 bytes lexicographically without locale collation or normalization. */
TextOrder() implements Comparator<string>:
    compare(string left, string right):
        return left.compare(other=right)

/** Return a stable ascending copy of integer values. */
sortIntegers(List<int> values) returns List<int> unless IndexError:
    return sort(values, comparator=IntegerOrder())

/** Return a stable ordinal copy of text values. */
sortText(List<string> values) returns List<string> unless IndexError:
    return sort(values, comparator=TextOrder())
