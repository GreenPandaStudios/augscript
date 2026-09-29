---
title: "main.aug · Read access and mutable borrows"
generated: true
source: "examples/ownership/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

[Read access and mutable borrows](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`counter.aug`](counter.md)

:::

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Counter`](counter.md#symbol-Counter)

Available from `counter`.

Class. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `value`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: [`Counter`](counter.md#symbol-Counter).

**[`Counter.increment`](counter.md#symbol-Counter.increment)**

Result: finish without a result.

Changes: `self`.

**[`Counter.read`](counter.md#symbol-Counter.read)**

Result: `int`.

### Built-in operations used by this file

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Startup, in source order

- Set `counter` of type [`Counter`](counter.md#symbol-Counter) to the result of call [`Counter`](counter.md#symbol-Counter) with `value` set to `1`. This variable owns the value.
- Call [`Counter.increment`](counter.md#symbol-Counter.increment) on `counter`.
- Call `print` with `value` set to the result of call [`Counter.read`](counter.md#symbol-Counter.read) on `counter`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
