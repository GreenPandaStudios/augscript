---
title: "main.aug · CPU benchmark"
generated: true
source: "benchmarks/cpu/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[CPU benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
// A loop-carried dependency prevents removal of the computation.
int state = 123
int index = 0
while index < 2000000:
    int product = state * 48271
    state = product - product / 2147483647 * 2147483647
    index = index + 1
print(value=state)
```

```aug [Braces]
// A loop-carried dependency prevents removal of the computation.
int state = 123
int index = 0
while index < 2000000 {
    int product = state * 48271
    state = product - product / 2147483647 * 2147483647
    index = index + 1
}
print(value=state)
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Run 4 other startup steps in source order.

### Startup, in source order

- Set `state` of type `int` to `123`.
- Set `index` of type `int` to `0`.
- While `index` is less than `2000000`, repeat:
  - Set `product` of type `int` to `state` times `48271`.
  - Set `state` to `product` minus ((`product` divided by `2147483647`) times `2147483647`).
  - Set `index` to `index` plus `1`.
  - Check the condition again before the next iteration.
- Call `print` with `value` = `state`.

### Built-in operations used by this file

- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
