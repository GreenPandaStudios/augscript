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

- Try:
  - Set `numbers` to a list of `int` containing `2`, `4`.
  - Mutably borrow `numbers` for this block:
    - Call `append` on `numbers` with `value` as `6`.
  - Call `print` with `value` as the result of `length` on `numbers`.
  - Call `print` with `value` as the result of `get` on `numbers` with `index` as `1`.
  - Set `scores` to an empty map from `string` to `int`.
  - Mutably borrow `scores` for this block:
    - Call `set` on `scores` with `value` as `42`, `key` as `"ada"`.
  - Call `print` with `value` as the result of `contains` on `scores` with `key` as `"ada"`.
  - Call `print` with `value` as the result of `get` on `scores` with `key` as `"ada"`.
  - Call `print` with `value` as the result of `length` on `scores`.
- Catch `IndexError` as `error`:
  - Call `print` with `value` as `"unexpected index failure"`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `List<int>.append`: Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here.
- `List<int>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.
- `List<int>.length`: Read the number of elements.
- `Map<string, int>.contains`: Check for a key, including entries whose value is null.
- `Map<string, int>.get`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.
- `Map<string, int>.length`: Read the number of elements.
- `Map<string, int>.set`: Insert or replace an entry with exclusive mutable access.
- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
