---
title: "src/export.aug · Create a package"
generated: true
source: "examples/packages/math/src/export.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `src/export.aug`

[Create a package](../index.md) · Source and specification

::: details Files in this project

- [`src/arithmetic.aug`](arithmetic.md)
- [`src/export.aug`](export.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
export add from arithmetic
```

```aug [Braces]
export add from arithmetic
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Folder exports

- Export the declaration `add` from [`arithmetic.aug`](arithmetic.md#symbol-add).


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
