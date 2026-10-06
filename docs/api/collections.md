---
generated: true
source: src/stdlib/collections
editLink: false
---

# august.collections

**Unreleased:** Supplied with the compiler. Import public names from `august.collections`.

Signatures show result types and checked errors. See [packages](../packages.md) to pin a release and [language constructs](../language-constructs.md) for built-in types.

## range {#api-range}

```text
range(int end, int start = 0, int step = 1, int limit = 1000000) returns List<int> unless RangeError
```

Return a new list of integers from start up to, but excluding, end.
A step past the int64 boundary stops before producing a wrapped value.

**Parameters**
- `start`: First value, default 0.
- `end`: Exclusive boundary.
- `step`: Nonzero increment, default 1; a negative step descends.
- `limit`: Maximum number of allocated elements, default 1000000; permitted from 1 to 1000000.

**Throws**
- `RangeError`: Invalid step, invalid limit, or too many elements.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/ranges.aug#L13)

## RangeError {#api-RangeError}

```text
error RangeError(string message)
```

A range has an invalid step or exceeds its explicit allocation limit.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/ranges.aug#L3)

## Predicate {#api-Predicate}

```text
interface Predicate<in T implements optional Data>
```

A pure decision about one data value. Supply an implementation, a matching standalone function, or a typed expression callback.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L3)

### Predicate.accepts

```text
accepts(T value) returns bool
```

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L4)

## Transformation {#api-Transformation}

```text
interface Transformation<in T implements optional Data, out U implements optional Data>
```

A pure transformation of one data value into another.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L7)

### Transformation.apply

```text
apply(T value) returns U
```

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L8)

## Aggregator {#api-Aggregator}

```text
interface Aggregator<in T implements optional Data, U implements optional Data>
```

A pure aggregation step; the caller chooses the initial total.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L11)

### Aggregator.combine

```text
combine(U total, T value) returns U
```

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L12)

## Comparator {#api-Comparator}

```text
interface Comparator<in T implements optional Data>
```

A pure ordering: negative before, zero equal, positive after. Supply a consistent total order.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L15)

### Comparator.compare

```text
compare(T left, T right) returns int
```

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L16)

## filter {#api-filter}

```text
filter<T implements optional Data>(List<T> values, Predicate<T> predicate) returns List<T>
```

Return a new list of matching values in snapshot order; an empty input returns an empty list.
Read references without copying their contents or granting mutable access.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L21)

## transform {#api-transform}

```text
transform<T implements optional Data, U implements optional Data>(
    List<T> values,
    Transformation<T,U> transformation
) returns List<U>
```

Transform every snapshot value once, preserving order in a new list.
An empty input returns an empty list. Transformations cannot mutate inputs or perform I/O.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L32)

## aggregate {#api-aggregate}

```text
aggregate<T implements optional Data, U implements optional Data>(
    List<T> values,
    Aggregator<T,U> aggregator,
    U initial
) returns U
```

Combine snapshot values from left to right, starting with initial.
An empty input returns initial. This operation does not choose a numeric overflow policy.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L43)

## remove {#api-remove}

```text
remove<T implements optional Data>(List<T> values, Predicate<T> predicate) returns List<T>
```

Return a new list without matching values, preserving snapshot order; do not mutate values.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L50)

## find {#api-find}

```text
find<T implements optional Data>(List<T> values, Predicate<T> predicate) returns optional T
```

Read the first matching snapshot value or null, stopping after the first match.
A matching null value is also null; use an explicit loop when presence must be distinguished.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L61)

## sort {#api-sort}

```text
sort<T implements optional Data>(List<T> values, Comparator<T> comparator) returns List<T> unless IndexError
```

Return a stably sorted copy. Equal values keep their input order; values remains unchanged.
Bottom-up merging uses O(n log n) comparisons and O(n) additional elements per merge pass; retained allocation depends on collection by the runtime.
Checked indexed reads retain IndexError in the contract; internal indices stay within the snapshot.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L71)

## IntegerOrder {#api-IntegerOrder}

```text
IntegerOrder() implements Comparator<int>
```

Order integers without subtracting and overflowing at the int64 boundaries.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L120)

### IntegerOrder.compare

```text
compare(int left, int right) returns int
```

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L121)

## TextOrder {#api-TextOrder}

```text
TextOrder() implements Comparator<string>
```

Order unsigned UTF-8 bytes lexicographically without locale collation or normalization.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L129)

### TextOrder.compare

```text
compare(string left, string right) returns int
```

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L130)

## sortIntegers {#api-sortIntegers}

```text
sortIntegers(List<int> values) returns List<int> unless IndexError
```

Return a stable ascending copy of integer values.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L134)

## sortText {#api-sortText}

```text
sortText(List<string> values) returns List<string> unless IndexError
```

Return a stable ordinal copy of text values.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/operations.aug#L138)

## mapWorkers {#api-mapWorkers}

```text
mapWorkers<T implements optional Data, U implements optional Data>(
    List<T> values,
    int concurrency,
    int chunkSize,
    Transformation<T,U> transformation
) returns List<U> unless ConcurrencyError and ConversionError and IndexError
```

Transform copied data on isolated worker heaps, preserving input order.
Supply a directly named concrete pure function with one value input; callbacks and behavior objects are not worker inputs.

**Parameters**
- `values`: At most 1048576 copied data values; the input remains unchanged.
- `concurrency`: Number of chunk jobs in a wave, from 1 to 64. This does not reserve pool threads.
- `chunkSize`: Values per job, from 1 to 65536.
- `transformation`: A named pure function, with no checked errors, injection, owned inputs, or task starts.

**Throws**
- `ConversionError`: Invalid bounds, checked before any worker starts, including for an empty input.
- `ConcurrencyError`: The shared pool cannot admit a job or copy its inputs.
- `IndexError`: Checked snapshot reads retain this error; indices stay within the snapshot.
Admission or cancellation joins already admitted jobs before leaving the current wave.

[Source](https://github.com/GreenPandaStudios/augscript/blob/main/src/stdlib/collections/workers.aug#L15)
