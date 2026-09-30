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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Counter from counter
own Counter counter = Counter(value=1)
counter.increment()
print(value=counter.read())
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

It sets `counter` of type [`Counter`](counter.md#symbol-Counter) to a [`Counter`](counter.md#symbol-Counter) with `value` `1`. `counter` of type [`Counter`](counter.md#symbol-Counter) owns this value. It calls [`counter.increment`](counter.md#symbol-Counter.increment). It prints [`counter.read`](counter.md#symbol-Counter.read).

### Dependencies

It uses [`Counter`](counter.md#symbol-Counter) ([`increment`](counter.md#symbol-Counter.increment) and [`read`](counter.md#symbol-Counter.read)) from `counter`. These links explain the full dependency contracts.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
