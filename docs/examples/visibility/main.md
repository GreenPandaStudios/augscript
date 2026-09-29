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
import Counter from counter
counter = Counter(value=1)
print(value=counter.label())
borrow counter:
    counter.value = 2
print(value=counter.value)
```

```aug [Braces]
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

- Set `counter` to a new [`Counter`](counter.md#symbol-Counter) with `value` as `1`.
- Call `print` with `value` as the result of [`Counter.label`](counter.md#symbol-Counter.label) on `counter`.
- Mutably borrow `counter` for this block:
  - Set `value` of `counter` to `2`.
- Call `print` with `value` as `value` of `counter`.

### Dependencies

- [`Counter`](counter.md#symbol-Counter) from `counter`: construct with `value`: `int`; read `value` (`int`), mutable; [`label`](counter.md#symbol-Counter.label) (no caller inputs) → `string`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
