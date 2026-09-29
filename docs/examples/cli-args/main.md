---
title: "main.aug · Command-line arguments"
generated: true
source: "examples/cli-args/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[Command-line arguments](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Run startup operations with checked error recovery.

### Startup, in source order

- Try these operations:
  - Set `args` to call `arguments`.
  - Call `print` with `value` = call `length` on `args`.
  - If call `length` on `args` is greater than `0`:
    - Call `print` with `value` = call `get` on `args` with `index` = `0`.
  - Set `numbers` to a list of `int` containing `1`, `2`.
  - Grant exclusive mutable access to `numbers` for this block, then end the borrow:
    - Call `append` on `numbers` with `value` = `3`.
  - Call `print` with `value` = call `get` on `numbers` with `index` = `2`.
- If they fail with `IndexError`, name the failure `error` and recover:
  - Call `print` with `value` = `"unexpected index failure"`.

### Built-in operations used by this file

- `List<int>.append` (`value`: `int`) → `void`: Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here. Changes the receiver.
- `List<int>.get` (`index`: `int`) → `int`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. Can fail with `IndexError`.
- `List<string>.get` (`index`: `int`) → `string`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. Can fail with `IndexError`.
- `List<string>.length` (no inputs) → `int`: Read the number of elements.
- `arguments` (no inputs) → `List<string>`: Composition arguments. Other callables receive the Arguments capability.
- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
