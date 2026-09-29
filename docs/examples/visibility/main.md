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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Run 4 other startup steps in source order.

### Startup, in source order

- Set `counter` to call [`Counter`](counter.md#symbol-Counter) with `value` = `1`.
- Call `print` with `value` = call [`Counter.label`](counter.md#symbol-Counter.label) on `counter`.
- Grant exclusive mutable access to `counter` for this block, then end the borrow:
  - Set `value` of `counter` to `2`.
- Call `print` with `value` = `value` of `counter`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Counter`](counter.md#symbol-Counter)

Class from `counter`.

- Construct with `value`: `int` → [`Counter`](counter.md#symbol-Counter).
- Read `value` (`int`); its owner can change it.
- [`Counter.label`](counter.md#symbol-Counter.label) (no caller inputs) → `string`.

### Built-in operations used by this file

- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
