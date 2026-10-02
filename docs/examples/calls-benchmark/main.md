---
title: "main.aug · Function-call benchmark"
generated: true
source: "benchmarks/calls/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Function-call benchmark](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`operations.aug`](operations.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import step from operations
int iterations = 200000
int state = 123
int index = 0
while index < iterations:
    state = step(value=state)
    index = index + 1
print(value=state)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import step from operations
int iterations = 200000
int state = 123
int index = 0
while index < iterations {
    state = step(value=state)
    index = index + 1
}
print(value=state)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Startup

It sets `iterations` to `200000`. It sets `state` to `123`. It sets `index` to `0`. While `index` is less than `iterations`, it sets `state` to [`step`](operations.md#symbol-step) with `value` from `state`; then it increases `index` by `1`.

After the loop, it prints `state`.

### Dependencies

It uses [`step`](operations.md#symbol-step) from `operations`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
