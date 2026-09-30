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

It tries the following steps. It sets `numbers` to a list of `int` containing `2`, `4`. While mutably borrowing `numbers`, it calls `append` on `numbers` (`value` set to `6`).

The mutable borrow ends when this block exits. It calls `print` (`value` set to the number of elements in `numbers`). It calls `print` (`value` set to the value from `get` on `numbers` (`index` set to `1`)). It sets `scores` to an empty map from `string` to `int`. While mutably borrowing `scores`, it calls `set` on `scores` (`value` set to `42` and `key` set to `"ada"`).

The mutable borrow ends when this block exits. It calls `print` (`value` set to the value from `contains` on `scores` (`key` set to `"ada"`)). It calls `print` (`value` set to the value from `get` on `scores` (`key` set to `"ada"`)). It calls `print` (`value` set to the number of elements in `scores`). If this attempt raises `IndexError`, it catches it as `error` and calls `print` (`value` set to `"unexpected index failure"`).

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`List<int>.append`: Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here. `List<int>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. `List<int>.length`: Read the number of elements. `Map<string, int>.contains`: Check for a key, including entries whose value is null. `Map<string, int>.get`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null. `Map<string, int>.length`: Read the number of elements.

`Map<string, int>.set`: Insert or replace an entry with exclusive mutable access. `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
