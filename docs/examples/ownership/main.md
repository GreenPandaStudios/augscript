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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Run 3 other startup steps in source order.

### Startup, in source order

- Set `counter` of type [`Counter`](counter.md#symbol-Counter) to call [`Counter`](counter.md#symbol-Counter) with `value` = `1`.
- This variable owns the value.
- Call [`Counter.increment`](counter.md#symbol-Counter.increment) on `counter`.
- Call `print` with `value` = call [`Counter.read`](counter.md#symbol-Counter.read) on `counter`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Counter`](counter.md#symbol-Counter)

Class from `counter`.

- Construct with `value`: `int` → [`Counter`](counter.md#symbol-Counter).
- [`Counter.increment`](counter.md#symbol-Counter.increment) (no caller inputs) → `void`; changes `self`.
- [`Counter.read`](counter.md#symbol-Counter.read) (no caller inputs) → `int`.

### Built-in operations used by this file

- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
