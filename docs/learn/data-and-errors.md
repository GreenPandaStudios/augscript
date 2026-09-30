---
prev:
  text: Values and functions
  link: /learn/values-and-functions
next:
  text: Modules and dependencies
  link: /learn/modules-and-dependencies
---

# Data and failures

A number alone does not explain every result. An order summary has named data, and an invalid order may need a failure rather than a zero total. This project introduces both.

Create a new folder and save these two files in it:

**main.aug**

```aug project=book-data file=main.aug
import Order and InvalidQuantity and summarize from orders

try:
    order = summarize(price=7, quantity=3)
    print(value=order.total)
    summarize(price=7, quantity=-1)
catch InvalidQuantity error:
    print(value="Quantity must be positive")

Map<int, string> names = {1: "Ada"}
match names.get(key=2):
    when null:
        print(value="No name for this identifier")
    when some name:
        print(value=name)
```

**orders.aug**

```aug project=book-data file=orders.aug
/** An immutable order summary. */
record Order(int quantity, int total)

/** Raised when an order quantity is not positive. */
InvalidQuantity(int value) implements Error:
    pass

/** Reject nonpositive quantities and return the calculated summary. */
summarize(int price, int quantity) returns Order unless InvalidQuantity:
    if quantity <= 0:
        throw InvalidQuantity(value=quantity)
    return Order(quantity, total=price * quantity)
```

`aug run .` prints:

```text
21
Quantity must be positive
No name for this identifier
```

## Keep data immutable

`record Order(int quantity, int total)` declares data with two named fields. Its constructor uses labels just like a function. After construction those fields are immutable. Reading `order.total` does not copy the whole object.

Use a record for a value whose meaning is its data. A class implements an interface and provides behavior; [the next chapter](modules-and-dependencies.md) uses one to supply a service. Records have limits on the types they can store; the [reference](../reference.md#classes-records-and-local-state) gives the complete rule.

## Make failure part of the contract

`unless InvalidQuantity` tells callers that `summarize` can fail with that checked error. `InvalidQuantity` is a class that implements `Error` and carries the rejected value. The caller must catch the failure or declare that it can propagate it. In this application, `try` contains the calls and `catch` prints a message when the second call fails. Operations after a throw in that block do not run.

Try removing the catch while keeping a bare call to `summarize` in `main.aug`. `aug check .` should report the unhandled error. Restore the example afterward. A checked failure tells you what a call can raise; it does not decide how your application should recover.

## Distinguish a value from null

A map lookup may find nothing. `names.get(key=2)` returns `optional string`, which means a string or null. `match` handles those alternatives explicitly. The `some name` branch supplies a non-null string named `name`.

There is no separate missing state. Omitted optional inputs also become null. Use null when absence is an ordinary outcome; use a checked failure when the operation cannot meet its contract. [Matching and failures](../reference.md#null-matching-and-checked-failures) covers the detailed rules.
