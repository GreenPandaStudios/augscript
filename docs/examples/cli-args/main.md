---
title: "main.aug · Command-line arguments"
generated: true
source: "examples/cli-args/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Command-line arguments](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
try:
    args = arguments()
    print(value=args.length())
    if args.length() > 0:
        print(value=args.get(index=0))
    numbers = List<int>(1, 2)
    borrow numbers:
        numbers.append(value=3)
    print(value=numbers.get(index=2))
catch IndexError error:
    print(value="unexpected index failure")
```

```aug [Braces]
try {
    args = arguments()
    print(value=args.length())
    if args.length() > 0 {
        print(value=args.get(index=0))
    }
    numbers = List<int>(1, 2)
    borrow numbers {
        numbers.append(value=3)
    }
    print(value=numbers.get(index=2))
}
catch IndexError error {
    print(value="unexpected index failure")
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

- Try:
  - Set `args` to the result of `arguments`.
  - Call `print` with `value` as the result of `length` on `args`.
  - If the result of `length` on `args` is greater than `0`:
    - Call `print` with `value` as the result of `get` on `args` with `index` as `0`.
  - Set `numbers` to a list of `int` containing `1`, `2`.
  - Mutably borrow `numbers` for this block:
    - Call `append` on `numbers` with `value` as `3`.
  - Call `print` with `value` as the result of `get` on `numbers` with `index` as `2`.
- Catch `IndexError` as `error`:
  - Call `print` with `value` as `"unexpected index failure"`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `List<int>.append`: Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here.
- `List<int>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.
- `List<string>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.
- `List<string>.length`: Read the number of elements.
- `arguments`: Composition arguments. Other callables receive the Arguments capability.
- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
