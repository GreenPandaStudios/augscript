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

It sets `counter` of type [`Counter`](counter.md#symbol-Counter) to a new [`Counter`](counter.md#symbol-Counter) (`value` set to `1`). `counter` of type [`Counter`](counter.md#symbol-Counter) owns this value. It calls [`Counter.increment`](counter.md#symbol-Counter.increment) on `counter`. It calls `print` (`value` set to the value from [`Counter.read`](counter.md#symbol-Counter.read) on `counter`).

### Dependencies

The file uses [`Counter`](counter.md#symbol-Counter) from `counter`. Construction takes `value` as `int`. [`increment`](counter.md#symbol-Counter.increment) takes no caller inputs. It returns no value. It may change `self`. [`read`](counter.md#symbol-Counter.read) takes no caller inputs. It returns `int`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
