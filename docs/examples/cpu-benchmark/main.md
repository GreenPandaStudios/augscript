---
title: "main.aug · CPU benchmark"
generated: true
source: "benchmarks/cpu/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[CPU benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `state` of type `int` to `123`. It sets `index` of type `int` to `0`. While `index` is less than `2000000`, it sets `product` of type `int` to `state` times `48271`; then it sets `state` to `product` minus ((`product` divided by `2147483647`) times `2147483647`); then it increases `index` by `1`. It calls `print` (`value` set to `state`).

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
