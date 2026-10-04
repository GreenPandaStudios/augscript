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

It sets `args` to `arguments`. It prints the number of elements in `args`. If the number of elements in `args` is positive, it prints the item at index `0` in `args`. It sets `numbers` to a list of `int` containing `1`, `2`. [source](main.md#code)

With temporary permission to change `numbers`, it appends `3` to `numbers`. It prints the item at index `2` in `numbers`. If this work raises `IndexError`, it prints `"unexpected index failure"`. [source](main.md#code)

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
