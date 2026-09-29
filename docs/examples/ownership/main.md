---
title: "main.aug · Read access and mutable borrows"
generated: true
source: "examples/ownership/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Read access and mutable borrows](index.md) · Source and specification

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
own Counter counter = Counter(value=1)
counter.increment()
print(value=counter.read())
```

```aug [Braces]
import Counter from counter
own Counter counter = Counter(value=1)
counter.increment()
print(value=counter.read())
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

- Set `counter` of type [`Counter`](counter.md#symbol-Counter) to a new [`Counter`](counter.md#symbol-Counter) with `value` as `1`.
- `counter` of type [`Counter`](counter.md#symbol-Counter) owns this value.
- Call [`Counter.increment`](counter.md#symbol-Counter.increment) on `counter`.
- Call `print` with `value` as the result of [`Counter.read`](counter.md#symbol-Counter.read) on `counter`.

### Dependencies

- [`Counter`](counter.md#symbol-Counter) from `counter`: construct with `value`: `int`; [`increment`](counter.md#symbol-Counter.increment) (no caller inputs) → `void`; [`read`](counter.md#symbol-Counter.read) (no caller inputs) → `int`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
