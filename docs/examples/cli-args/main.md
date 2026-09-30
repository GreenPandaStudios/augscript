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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

It tries the following steps. It sets `args` to the value from `arguments`. It calls `print` (`value` set to the number of elements in `args`). If the number of elements in `args` is greater than `0`, it calls `print` (`value` set to the value from `get` on `args` (`index` set to `0`)). It sets `numbers` to a list of `int` containing `1`, `2`. While mutably borrowing `numbers`, it calls `append` on `numbers` (`value` set to `3`).

The mutable borrow ends when this block exits. It calls `print` (`value` set to the value from `get` on `numbers` (`index` set to `2`)). If this attempt raises `IndexError`, it catches it as `error` and calls `print` (`value` set to `"unexpected index failure"`).

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`List<int>.append`: Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here. `List<int>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. `List<string>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. `List<string>.length`: Read the number of elements. `arguments`: Composition arguments. Other callables receive the Arguments capability. `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
