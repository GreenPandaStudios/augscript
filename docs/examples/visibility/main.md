---
title: "main.aug · Private state and helpers"
generated: true
source: "examples/visibility/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Private state and helpers](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`counter.aug`](counter.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Counter from counter
counter = Counter(value=1)
print(value=counter.label())
borrow counter:
    counter.value = 2
print(value=counter.value)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Counter from counter
counter = Counter(value=1)
print(value=counter.label())
borrow counter {
    counter.value = 2
}
print(value=counter.value)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `counter` to a new [`Counter`](counter.md#symbol-Counter) (`value` set to `1`). It calls `print` (`value` set to the value from [`Counter.label`](counter.md#symbol-Counter.label) on `counter`). While mutably borrowing `counter`, it sets `counter.value` to `2`.

The mutable borrow ends when this block exits. It calls `print` (`value` set to `counter.value`).

### Dependencies

The file uses [`Counter`](counter.md#symbol-Counter) from `counter`. Construction takes `value` as `int`. `value` is a mutable field of type `int`. [`label`](counter.md#symbol-Counter.label) takes no caller inputs. It returns `string`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
