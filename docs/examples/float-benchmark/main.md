---
title: "main.aug · Floating-point benchmark"
generated: true
source: "benchmarks/float/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Floating-point benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 1000000
float sum = 0.0
int index = 0
while index < iterations:
    int remainder = index - index / 8 * 8
    sum = sum + remainder * 0.125 + 0.5
    index = index + 1
print(value=sum == 937500.0)
print(value=iterations)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
int iterations = 1000000
float sum = 0.0
int index = 0
while index < iterations {
    int remainder = index - index / 8 * 8
    sum = sum + remainder * 0.125 + 0.5
    index = index + 1
}
print(value=sum == 937500.0)
print(value=iterations)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `iterations` to `1000000`. It sets `sum` to `0.0`. It sets `index` to `0`. While `index` is less than `iterations`, it sets `remainder` to `index` minus ((`index` divided by `8`) times `8`); then it sets `sum` to (`sum` plus (`remainder` times `0.125`)) plus `0.5`; then it increases `index` by `1`.

After the loop, it prints `sum` equals `937500.0`. It prints `iterations`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
