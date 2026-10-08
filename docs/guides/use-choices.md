# Describe a finite choice

Use a choice when an operation has a fixed set of data outcomes. Each outcome keeps its own record fields. A match names the outcome before reading those fields.

## Return one of two records

Put the entry in **main.aug**:

```aug project=closed-choices-guide file=main.aug
import Delivery and Delivered and Failed and describe from delivery

Delivery result = Delivered(receipt="receipt-42")
print(value=describe(delivery=result))
print(value=describe(delivery=Failed(reason="not available")))
```

Keep the data, operation and test in **delivery.aug**:

```aug project=closed-choices-guide file=delivery.aug
choice Delivery from Delivered and Failed

record Delivered(string receipt)
record Failed(string reason)

describe(Delivery delivery):
    return match delivery:
        when Delivered sent:
            sent.receipt
        when Failed rejected:
            rejected.reason

test describe:
    when delivery_messages:
        it "reads the receipt":
            assertEqual(
                actual=describe(delivery=Delivered(receipt="receipt-42")),
                expected="receipt-42"
            )
        it "reads the failure reason":
            assertEqual(
                actual=describe(delivery=Failed(reason="not available")),
                expected="not available"
            )
```

Run `aug run .`. It prints `receipt-42` and `not available`. Run `aug test .` to check both messages. `Delivery` has no constructor: create `Delivered` or `Failed` with their ordinary labeled inputs. Their validation and checked errors still apply.

## Cover the possible values

The compiler checks each match against the resolved record identities. Cover every alternative, or write an explicit `else`. For `optional Delivery`, also handle null. A `when some value` branch can handle every non-null alternative together, but `value` still needs a record match before you read its payload.

Adding another alternative makes a match without `else` incomplete. The diagnostic names the missing records. An `else` branch deliberately retains a fallback when the choice expands. Choose that behavior in the application.

Choices contain at least two distinct, concrete nongeneric immutable records. They cannot contain scalars, behavioral classes, generic record instances, or another choice. Record fields can contain choices and deeply immutable collections. Choices are data: lists, pure callbacks and workers retain the existing read, capture and copied-heap rules. They add no shared mutable state.

## Keep the boundary explicit

Declare a choice in an ordinary module. Import each record it names when the records live in another module. Across a folder boundary, `export.aug` controls which choice and constructors callers can use. Export the alternative records when callers need to construct or match them; exporting a choice does not export its records automatically. A private choice cannot be exported.

A class cannot implement a choice, and an interface cannot inherit it. The declaration is a closed data type. A generic input may be bounded by a non-null choice, so only its record alternatives are accepted. Write `optional T` for a nullable input; an optional choice bound is rejected. That bound retains their immutable-data guarantee in record fields and pure captures. A match on the bounded input covers the choice's records; its narrowed branch values do not become the unspecified generic type.

## Choose a wire format

There is no implicit numeric tag or JSON discriminator. A choice retains its alternative's ordinary record representation and equality. Match it and serialize the selected record, or define a public wire record with an explicit tag and payload. Direct JSON decoding and typed HTTP binding to a choice are rejected because record shapes can overlap. This keeps a future payload or field change from silently selecting another outcome.

Hover shows the alternatives. Find References follows their resolved type names. `aug spec .` explains the finite outcomes and links their records; context and public-interface reviews retain their exact identities. These descriptions remain separate from the application's expected results.
