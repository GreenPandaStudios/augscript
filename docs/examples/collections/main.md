---
title: "main.aug · Lists, tuples, sets, and maps"
generated: true
source: "examples/collections/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Lists, tuples, sets, and maps](index.md) · Source and specification

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
    numbers = List<int>(2, 4)
    borrow numbers:
        numbers.append(value=6)
    print(value=numbers.length())
    print(value=numbers.get(index=1))
    scores = Map<string, int>()
    borrow scores:
        scores.set(value=42, key="ada")
    print(value=scores.contains(key="ada"))
    print(value=scores.get(key="ada"))
    print(value=scores.length())
catch IndexError error:
    print(value="unexpected index failure")
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
try {
    numbers = List<int>(2, 4)
    borrow numbers {
        numbers.append(value=6)
    }
    print(value=numbers.length())
    print(value=numbers.get(index=1))
    scores = Map<string, int>()
    borrow scores {
        scores.set(value=42, key="ada")
    }
    print(value=scores.contains(key="ada"))
    print(value=scores.get(key="ada"))
    print(value=scores.length())
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

It sets `numbers` to a list of `int` containing `2`, `4`. With temporary permission to change `numbers`, it appends `6` to `numbers`. It prints the number of elements in `numbers`. It prints the item at index `1` in `numbers`. [source](main.md#code)

It sets `scores` to an empty map from `string` to `int`. With temporary permission to change `scores`, it stores `42` in `scores` under `"ada"`. It prints whether `scores` contains the key `"ada"`. It prints the value under `"ada"` in `scores`. [source](main.md#code)

It prints the number of elements in `scores`. If this work raises `IndexError`, it prints `"unexpected index failure"`. [source](main.md#code)

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
