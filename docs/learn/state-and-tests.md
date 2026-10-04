---
prev:
  text: Modules and dependencies
  link: /learn/modules-and-dependencies
next:
  text: Change an unfamiliar module
  link: /guides/change-a-module
---

# State and tests

This counter has two operations: read its value and increment it. The interface permits the increment to change state; a borrow block permits the call.

Create a new folder and save these two files in it:

**main.aug**

```aug project=book-state file=main.aug
import Counter from counter

counter = Counter(initial=3)
borrow counter:
    counter.increment()
print(value=counter.value())
```

**counter.aug**

```aug project=book-state file=counter.aug
interface Count:
    increment() changes self
    value() returns int

Counter(mutable int initial to _count) implements Count:
    increment():
        _count = _count + 1

    value():
        return _count

test Counter counter:
    when incrementing:
        counter = Counter(initial=3)
        it advances:
            borrow counter:
                counter.increment()
            assert(counter.value() == 4)

        it starts_fresh:
            assert(counter.value() == 3)
```

`aug run .` prints `4`. `aug test .` runs two cases. Both should pass.

## Read before you borrow

`mutable int initial to _count` gives the constructor a public input named `initial` and stores it in a private mutable field named `_count`. The interface's `changes self` permits `increment` to change the receiving object. The implementation infers that mutation from its assignment and inherits the read method's result type, so neither clause needs to be repeated.

`borrow counter` grants mutable access for that block. The following call to `value()` only reads, so it needs no borrow. Read access shares a reference; it does not require copying the counter. Try moving `counter.increment()` outside the borrow block. `aug check .` should reject the mutation without permission. Restore the borrow before running again.

For ownership transfer and scoped cleanup, see [the ownership reference](../reference.md#ownership-and-read-access) and [complete lifetime examples](../examples/ownership-transfer/index.md).

## Keep the behavior test nearby

`test Counter counter` identifies the class and the subject variable. The setup inside `when incrementing` constructs the subject. Each `it` case gets fresh setup; the second case still sees `3` even though the first case incremented its own counter.

Tests follow normal privacy rules. They use `increment` and `value`; `_count` remains private. A case must execute an assertion. Test bodies are checked with the program, but are excluded from production executables.

Change the first expected result to `5`, run `aug test .`, and inspect the failure's file and line. Restore `4`, rerun the tests, and generate the spec. Compare the updated explanation with the passing cases.

Use [the testing guide](../testing.md) when you need rows, fixtures, test adapters, filtering, or coverage. Continue with [a guided module change](../guides/change-a-module.md) to apply these tools in a larger project.
