---
prev:
  text: Your first project
  link: /getting-started
next:
  text: Data and failures
  link: /learn/data-and-errors
---

# Values and functions

In the first project, an interface and its implementation produced a greeting. A calculation that needs no dependency can be an ordinary function. This chapter calculates an order total.

Create a new folder with these two files. Continue using the published CLI from the first chapter.

**main.aug**

```aug project=book-functions file=main.aug
import total from prices

int price = 7
int quantity = 3
print(value=total(price, quantity))
print(value=total(quantity=0, price))
```

**prices.aug**

```aug project=book-functions file=prices.aug
/** Calculate the price for a positive quantity; otherwise return zero. */
total(int price, int quantity):
    if quantity > 0:
        return price * quantity
    return 0
```

Run `aug check .`, then `aug run .`. The output is:

```text
21
0
```

## Read the call

`int price = 7` gives the value a type and a name. `int price to 7` means the same thing. You can omit the type when it can be inferred, as in `price = 7`.

Every call input has a label. `total(price, quantity)` is shorthand for `total(price=price, quantity=quantity)`: the local names match the labels. The second call supplies a different quantity. Labels let you reorder inputs without making the reader guess which argument is which.

The declaration begins with the function's name; it needs no `function` keyword. The compiler infers an integer result from its return expressions. VS Code shows `returns int` beside the header as a hint; it is absent from saved source. You can write a return type to require a particular result. This function reads its inputs and calculates a value. It has no dependency or mutable state.

## Read the decision

`if quantity > 0` chooses the first return when the quantity is positive. That return ends the call. Otherwise execution reaches `return 0`. Every path in a function with a non-void result must return or throw.

Boolean conditions use `and`, `or`, and `not`. For example, `price > 0 and quantity > 0` requires both comparisons to hold. `and` and `or` short-circuit: the second operand runs only when the first operand makes it necessary.

## Try a change

Change the first quantity to `4`. Run the program and check that the first result is `28`. Then change the second call's `quantity` label to `amount` and run `aug check .`. That call should fail checking because `total` has no input named `amount`. Restore the label before continuing.

Run `aug spec .` and read `prices.aug.md`. It should explain the two return paths. The generated text describes the code; your comment explains why a nonpositive quantity produces zero. [The next chapter](data-and-errors.md) makes an invalid input an explicit failure instead.
