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

It sets `counter` to a [`Counter`](counter.md#symbol-Counter) with `value` `1`. It prints [`counter.label`](counter.md#symbol-Counter.label). With temporary permission to change `counter`, it sets `counter.value` to `2`. It prints `counter.value`.

### Dependencies

It uses [`Counter`](counter.md#symbol-Counter) ([`label`](counter.md#symbol-Counter.label) and `value`) from `counter`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
